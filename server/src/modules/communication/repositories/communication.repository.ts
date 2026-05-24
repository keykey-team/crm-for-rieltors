import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findLeadCommunications(leadId: string) {
  return prisma.communication.findMany({
    where: { leadId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createLeadCommunication(data: Record<string, unknown>) {
  return prisma.communication.create({
    data: data as any,
    include: { user: { select: { id: true, name: true } } },
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

export async function findConversationUsers(me: string) {
  return prisma.user.findMany({
    where: { id: { not: me } },
    select: { id: true, name: true, role: true },
  });
}

export async function findLastDirectMessage(me: string, other: string) {
  return prisma.chatMessage.findFirst({
    where: { OR: [{ senderId: me, receiverId: other }, { senderId: other, receiverId: me }] },
    orderBy: { createdAt: 'desc' },
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

export async function deleteRoomGraph(roomId: string) {
  await prisma.chatMention.deleteMany({ where: { message: { roomId } } as any });
  await prisma.chatMessage.deleteMany({ where: { roomId } });
  await prisma.chatRoomMember.deleteMany({ where: { roomId } });
  await prisma.chatRoom.delete({ where: { id: roomId } });
}

