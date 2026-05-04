export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const otherUserId = req.nextUrl.searchParams.get('userId');

  if (otherUserId) {
    // Get conversation with specific user
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    // Mark as read
    await prisma.chatMessage.updateMany({
      where: { senderId: otherUserId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json(messages);
  }

  // Get list of conversations (last message per user)
  const users = await prisma.user.findMany({
    where: { id: { not: userId } },
    select: { id: true, name: true, avatar: true, role: true },
  });

  const conversations = await Promise.all(
    users.map(async (u: any) => {
      const lastMsg = await prisma.chatMessage.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: u.id },
            { senderId: u.id, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      const unread = await prisma.chatMessage.count({
        where: { senderId: u.id, receiverId: userId, isRead: false },
      });
      return { user: u, lastMessage: lastMsg, unreadCount: unread };
    })
  );

  return NextResponse.json(conversations.sort((a: any, b: any) => {
    const aTime = a.lastMessage?.createdAt?.getTime?.() || 0;
    const bTime = b.lastMessage?.createdAt?.getTime?.() || 0;
    return bTime - aTime;
  }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const { receiverId, text } = await req.json();
  const msg = await prisma.chatMessage.create({
    data: { senderId: userId, receiverId, text },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
  return NextResponse.json(msg);
}
