import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findLeadCommunications(leadId: string) {
  return prisma.communication.findMany({
    where: { leadId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createLeadCommunication(data: Record<string, unknown>) {
  return prisma.$transaction(async (tx: any) => {
    const communication = await tx.communication.create({
      data: data as any,
      include: { user: { select: { id: true, name: true } } },
    });

    await tx.lead.update({
      where: { id: String(data.leadId) },
      data: { lastContact: communication.createdAt },
    });

    return communication;
  });
}

export async function findDirectMessages(me: string, other: string) {
  return prisma.chatMessage.findMany({
    where: { OR: [{ senderId: me, receiverId: other }, { senderId: other, receiverId: me }] },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });
}

export async function markDirectMessagesRead(senderId: string, receiverId: string) {
  return prisma.chatMessage.updateMany({
    where: { senderId, receiverId, isRead: false },
    data: { isRead: true },
  });
}

export async function findConversationUsers(me: string, agencyId: string) {
  return prisma.user.findMany({
    where: {
      id: { not: me },
      memberships: {
        some: {
          agencyId,
          isActive: true,
        },
      },
    },
    select: { id: true, name: true, role: true, avatar: true, email: true },
  });
}

export async function findLastDirectMessage(me: string, other: string) {
  return prisma.chatMessage.findFirst({
    where: { OR: [{ senderId: me, receiverId: other }, { senderId: other, receiverId: me }] },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findRoomMessages(roomId: string, threadId?: string) {
  return prisma.chatMessage.findMany({
    where: { roomId, ...(threadId ? { threadId } : {}) },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      _count: { select: { replies: true } },
    },
  });
}

export async function findRoomsForUser(userId: string) {
  return prisma.chatRoom.findMany({
    where: { members: { some: { userId } } },
    orderBy: { updatedAt: 'desc' },
    include: {
      members: { include: { user: { select: { id: true, name: true, avatar: true, role: true } } } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });
}

export async function findRoomMembershipForUser(roomId: string, userId: string) {
  return prisma.chatRoomMember.findUnique({ where: { roomId_userId: { roomId, userId } } });
}

export async function markRoomRead(roomId: string, userId: string) {
  return prisma.chatRoomMember.update({
    where: { roomId_userId: { roomId, userId } },
    data: { lastReadAt: new Date() },
  });
}

export async function createRoomMessage(data: {
  roomId: string;
  senderId: string;
  receiverId: string;
  text: string;
  threadId?: string | null;
  mentions?: string[];
}) {
  return prisma.$transaction(async (tx: any) => {
    const message = await tx.chatMessage.create({
      data: {
        roomId: data.roomId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text,
        threadId: data.threadId ?? null,
        isRead: true,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        _count: { select: { replies: true } },
      },
    });

    if (Array.isArray(data.mentions) && data.mentions.length > 0) {
      await tx.chatMention.createMany({
        data: data.mentions.map((userId) => ({ messageId: message.id, userId })),
      });
    }

    await tx.chatRoomMember.update({
      where: { roomId_userId: { roomId: data.roomId, userId: data.senderId } },
      data: { lastReadAt: new Date() },
    });

    return message;
  });
}

export async function countUnreadDirectMessages(senderId: string, receiverId: string) {
  return prisma.chatMessage.count({ where: { senderId, receiverId, isRead: false } });
}

export async function createDirectMessage(data: { senderId: string; receiverId: string; text: string }) {
  return prisma.chatMessage.create({ data });
}

export async function findRoomMembership(roomId: string, userId: string) {
  return prisma.chatRoomMember.findUnique({ where: { roomId_userId: { roomId, userId } } });
}

export async function renameRoom(roomId: string, name: unknown) {
  return prisma.chatRoom.update({ where: { id: roomId }, data: { name: name as any } });
}

export async function addRoomMember(roomId: string, userId: string) {
  return prisma.chatRoomMember.upsert({
    where: { roomId_userId: { roomId, userId } },
    create: { roomId, userId },
    update: {},
  });
}

export async function countRoomMembers(roomId: string) {
  return prisma.chatRoomMember.count({ where: { roomId } });
}

export async function markRoomAsGroup(roomId: string) {
  return prisma.chatRoom.update({ where: { id: roomId }, data: { type: 'group' } });
}

export async function removeRoomMembers(roomId: string, userIds: string[]) {
  return prisma.chatRoomMember.deleteMany({ where: { roomId, userId: { in: userIds } } });
}

export async function findRoomWithMembers(roomId: string) {
  return prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: { members: { include: { user: { select: { id: true, name: true, avatar: true, role: true } } } } },
  });
}

export async function findActiveAgencyMemberIds(agencyId: string, userIds: string[]) {
  if (userIds.length === 0) return [];
  const memberships = await prisma.agencyMembership.findMany({
    where: {
      agencyId,
      isActive: true,
      userId: { in: userIds },
    },
    select: { userId: true },
  });
  return memberships.map((membership: { userId: string }) => membership.userId);
}

export async function deleteRoomGraph(roomId: string) {
  await prisma.chatMention.deleteMany({ where: { message: { roomId } } as any });
  await prisma.chatMessage.deleteMany({ where: { roomId } });
  await prisma.chatRoomMember.deleteMany({ where: { roomId } });
  await prisma.chatRoom.delete({ where: { id: roomId } });
}

