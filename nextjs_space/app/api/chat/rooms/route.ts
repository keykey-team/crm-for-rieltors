export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PUT /api/chat/rooms — update room (rename, add/remove members)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();
  const { roomId, name, addMemberIds, removeMemberIds } = body;

  if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });

  // Verify membership
  const membership = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  // Update name
  if (name !== undefined) {
    await prisma.chatRoom.update({ where: { id: roomId }, data: { name } });
  }

  // Add members
  if (addMemberIds && Array.isArray(addMemberIds)) {
    for (const mid of addMemberIds) {
      await prisma.chatRoomMember.upsert({
        where: { roomId_userId: { roomId, userId: mid } },
        create: { roomId, userId: mid },
        update: {},
      });
    }
    // If room was direct and now has >2 members, make it group
    const count = await prisma.chatRoomMember.count({ where: { roomId } });
    if (count > 2) {
      await prisma.chatRoom.update({ where: { id: roomId }, data: { type: 'group' } });
    }
  }

  // Remove members
  if (removeMemberIds && Array.isArray(removeMemberIds)) {
    await prisma.chatRoomMember.deleteMany({
      where: { roomId, userId: { in: removeMemberIds } },
    });
  }

  const updatedRoom = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      members: { include: { user: { select: { id: true, name: true, avatar: true, role: true } } } },
    },
  });

  return NextResponse.json(updatedRoom);
}

// DELETE /api/chat/rooms — delete a chat room
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');

  if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });

  // Verify membership
  const membership = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  // Delete all related data in order
  await prisma.chatMention.deleteMany({ where: { message: { roomId } } });
  await prisma.chatMessage.deleteMany({ where: { roomId } });
  await prisma.chatRoomMember.deleteMany({ where: { roomId } });
  await prisma.chatRoom.delete({ where: { id: roomId } });

  return NextResponse.json({ ok: true });
}
