export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/chat — list rooms for current user
// GET /api/chat?roomId=xxx — messages in room
// GET /api/chat?roomId=xxx&threadId=yyy — thread replies
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const roomId = req.nextUrl.searchParams.get('roomId');
  const threadId = req.nextUrl.searchParams.get('threadId');

  // Thread replies
  if (roomId && threadId) {
    const replies = await prisma.chatMessage.findMany({
      where: { roomId, threadId },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        mentions: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    return NextResponse.json(replies);
  }

  // Messages in room
  if (roomId) {
    // verify membership
    const membership = await prisma.chatRoomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

    const messages = await prisma.chatMessage.findMany({
      where: { roomId, threadId: null },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        mentions: { include: { user: { select: { id: true, name: true } } } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    // Update last read
    await prisma.chatRoomMember.update({
      where: { roomId_userId: { roomId, userId } },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json(messages);
  }

  // List rooms
  const memberships = await prisma.chatRoomMember.findMany({
    where: { userId },
    include: {
      room: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
          },
        },
      },
    },
  });

  const rooms = await Promise.all(
    memberships.map(async (m) => {
      const lastMsg = await prisma.chatMessage.findFirst({
        where: { roomId: m.roomId, threadId: null },
        orderBy: { createdAt: 'desc' },
        include: { sender: { select: { id: true, name: true } } },
      });
      const unreadCount = await prisma.chatMessage.count({
        where: {
          roomId: m.roomId,
          threadId: null,
          createdAt: { gt: m.lastReadAt },
          senderId: { not: userId },
        },
      });
      return {
        id: m.room.id,
        name: m.room.name,
        type: m.room.type,
        members: m.room.members.map((mem) => mem.user),
        lastMessage: lastMsg,
        unreadCount,
        updatedAt: lastMsg?.createdAt || m.room.createdAt,
      };
    })
  );

  rooms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return NextResponse.json(rooms);
}

// POST /api/chat — send message or create room
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();

  // Create group room
  if (body.action === 'createRoom') {
    const { name, memberIds } = body;
    const allIds = Array.from(new Set([userId, ...(memberIds || [])]));
    const room = await prisma.chatRoom.create({
      data: {
        name: name || null,
        type: allIds.length > 2 ? 'group' : 'direct',
        createdById: userId,
        members: { create: allIds.map((id: string) => ({ userId: id })) },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatar: true, role: true } } } },
      },
    });
    return NextResponse.json(room);
  }

  // Send message to a room
  const { roomId, text, threadId, mentions } = body;

  // If no roomId but receiverId — find/create DM room
  let targetRoomId = roomId;
  if (!targetRoomId && body.receiverId) {
    // Find existing DM room
    const existingDm = await prisma.chatRoom.findFirst({
      where: {
        type: 'direct',
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: body.receiverId } } },
        ],
      },
    });
    if (existingDm) {
      targetRoomId = existingDm.id;
    } else {
      const newRoom = await prisma.chatRoom.create({
        data: {
          type: 'direct',
          createdById: userId,
          members: { create: [{ userId }, { userId: body.receiverId }] },
        },
      });
      targetRoomId = newRoom.id;
    }
  }

  if (!targetRoomId || !text?.trim()) {
    return NextResponse.json({ error: 'Missing roomId or text' }, { status: 400 });
  }

  // For DM backward compat, figure out receiverId
  const roomMembers = await prisma.chatRoomMember.findMany({ where: { roomId: targetRoomId } });
  const otherMember = roomMembers.find((m) => m.userId !== userId);
  const receiverId = body.receiverId || otherMember?.userId || userId;

  const msg = await prisma.chatMessage.create({
    data: {
      senderId: userId,
      receiverId,
      text: text.trim(),
      roomId: targetRoomId,
      threadId: threadId || null,
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      _count: { select: { replies: true } },
    },
  });

  // Create mentions
  if (mentions && Array.isArray(mentions) && mentions.length > 0) {
    await prisma.chatMention.createMany({
      data: mentions.map((uid: string) => ({ messageId: msg.id, userId: uid })),
      skipDuplicates: true,
    });
  }

  // Update room timestamp
  await prisma.chatRoom.update({ where: { id: targetRoomId }, data: { updatedAt: new Date() } });

  return NextResponse.json(msg);
}