export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getHelperLimit, getMonthStart } from '@/lib/helper-limits';
import { executeQuery, QUERY_SCHEMA, type QueryParams } from '@/lib/assistant-queries';
import { getSessionUser } from '@/lib/role-guard';

const LLM_URL = 'https://apps.abacus.ai/v1/chat/completions';

async function callLLM(messages: any[], options: { stream?: boolean } = {}) {
  const body: any = {
    model: 'gpt-5.4-mini',
    messages,
    max_tokens: options.stream ? 1500 : 500,
    temperature: options.stream ? 0.7 : 0.1,
  };
  if (options.stream) {
    body.stream = true;
  }

  return fetch(LLM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, role: true, name: true, email: true },
    });
    const plan = user?.plan ?? 'free';
    const limit = getHelperLimit(plan);
    const monthStart = getMonthStart();

    // Check usage limit (shared with helper)
    const usedCount = await prisma.helperMessage.count({
      where: { userId, role: 'user', createdAt: { gte: monthStart } },
    });

    if (usedCount >= limit) {
      return NextResponse.json({ error: 'limit_reached', used: usedCount, limit, plan }, { status: 429 });
    }

    const { message, history } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Save user message
    await prisma.helperMessage.create({
      data: { userId, role: 'user', content: `[assistant] ${message}` },
    });

    // Get session user for role-based access
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // STEP 1: Determine query intent via LLM
    const intentMessages = [
      { role: 'system', content: QUERY_SCHEMA },
      ...(Array.isArray(history) ? history.slice(-4).map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })) : []),
      { role: 'user', content: message },
    ];

    const intentRes = await callLLM(intentMessages);
    if (!intentRes.ok) {
      console.error('Intent LLM error:', await intentRes.text());
      return NextResponse.json({ error: 'LLM error' }, { status: 502 });
    }

    const intentData = await intentRes.json();
    let intentContent = intentData.choices?.[0]?.message?.content || '{}';
    
    // Extract JSON from potential markdown code blocks
    const jsonMatch = intentContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) intentContent = jsonMatch[1].trim();
    
    let queryParams: any;
    try {
      queryParams = JSON.parse(intentContent);
    } catch {
      queryParams = { entity: 'none' };
    }

    // If not a data query, redirect to regular helper
    if (!queryParams.entity || queryParams.entity === 'none') {
      // It's a general question — answer without DB data
      const chatMessages = [
        {
          role: 'system',
          content: `Ти — FREEMO R Асистент, AI-помічник CRM-системи для рієлторів.
Ти допомагаєш з питаннями про дані в CRM: ліди, угоди, об'єкти, задачі, аналітику.
Якщо питання не стосується даних CRM, ввічливо поясни що ти спеціалізуєшся на роботі з даними CRM.
Відповідай коротко, українською.`,
        },
        ...(Array.isArray(history) ? history.slice(-6).map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })) : []),
        { role: 'user', content: message },
      ];

      const chatRes = await callLLM(chatMessages, { stream: true });
      if (!chatRes.ok) {
        return NextResponse.json({ error: 'LLM error' }, { status: 502 });
      }

      return streamResponse(chatRes, userId, usedCount, limit);
    }

    // STEP 2: Execute DB query
    const dbResult = await executeQuery(queryParams, sessionUser);

    // STEP 3: Generate natural language response with DB data
    const responseMessages = [
      {
        role: 'system',
        content: `Ти — FREEMO R Асистент, AI-помічник CRM-системи для рієлторів.
Тобі надані реальні дані з CRM. Сформуй зрозумілу, структуровану відповідь українською мовою.
Використовуй емодзі для наочності. Якщо даних багато, згрупуй або підсумуй.
Не додавай інформацію, якої немає в даних. Будь точним з цифрами.`,
      },
      {
        role: 'user',
        content: `Питання користувача: "${message}"

Дані з CRM:
${dbResult}

Дай зрозумілу відповідь на основі цих даних.`,
      },
    ];

    const responseRes = await callLLM(responseMessages, { stream: true });
    if (!responseRes.ok) {
      console.error('Response LLM error:', await responseRes.text());
      return NextResponse.json({ error: 'LLM error' }, { status: 502 });
    }

    return streamResponse(responseRes, userId, usedCount, limit);
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/** Stream LLM response and save to DB */
function streamResponse(llmResponse: Response, userId: string, usedCount: number, limit: number) {
  let fullResponse = '';

  const stream = new ReadableStream({
    async start(controller) {
      const reader = llmResponse.body?.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      if (!reader) { controller.close(); return; }

      let partialRead = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          partialRead += decoder.decode(value, { stream: true });
          const lines = partialRead.split('\n');
          partialRead = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullResponse += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch { /* skip */ }
            }
          }
        }

        // Save assistant response
        if (fullResponse) {
          await prisma.helperMessage.create({
            data: { userId, role: 'assistant', content: `[assistant] ${fullResponse}` },
          });
        }

        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ done: true, used: usedCount + 1, limit })}\n\n`
        ));
      } catch (error) {
        console.error('Stream error:', error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
