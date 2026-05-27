"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLeadCommunications = findLeadCommunications;
exports.createLeadCommunication = createLeadCommunication;
exports.findDirectMessages = findDirectMessages;
exports.markDirectMessagesRead = markDirectMessagesRead;
exports.findConversationUsers = findConversationUsers;
exports.findLastDirectMessage = findLastDirectMessage;
exports.countUnreadDirectMessages = countUnreadDirectMessages;
exports.createDirectMessage = createDirectMessage;
exports.findRoomMembership = findRoomMembership;
exports.renameRoom = renameRoom;
exports.addRoomMember = addRoomMember;
exports.countRoomMembers = countRoomMembers;
exports.markRoomAsGroup = markRoomAsGroup;
exports.removeRoomMembers = removeRoomMembers;
exports.findRoomWithMembers = findRoomWithMembers;
exports.deleteRoomGraph = deleteRoomGraph;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findLeadCommunications(leadId) {
    return prisma_1.prisma.communication.findMany({
        where: { leadId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
    });
}
async function createLeadCommunication(data) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const communication = await tx.communication.create({
            data: data,
            include: { user: { select: { id: true, name: true } } },
        });
        await tx.lead.update({
            where: { id: String(data.leadId) },
            data: { lastContact: communication.createdAt },
        });
        return communication;
    });
}
async function findDirectMessages(me, other) {
    return prisma_1.prisma.chatMessage.findMany({
        where: { OR: [{ senderId: me, receiverId: other }, { senderId: other, receiverId: me }] },
        orderBy: { createdAt: 'asc' },
        take: 200,
    });
}
async function markDirectMessagesRead(senderId, receiverId) {
    return prisma_1.prisma.chatMessage.updateMany({
        where: { senderId, receiverId, isRead: false },
        data: { isRead: true },
    });
}
async function findConversationUsers(me) {
    return prisma_1.prisma.user.findMany({
        where: { id: { not: me } },
        select: { id: true, name: true, role: true },
    });
}
async function findLastDirectMessage(me, other) {
    return prisma_1.prisma.chatMessage.findFirst({
        where: { OR: [{ senderId: me, receiverId: other }, { senderId: other, receiverId: me }] },
        orderBy: { createdAt: 'desc' },
    });
}
async function countUnreadDirectMessages(senderId, receiverId) {
    return prisma_1.prisma.chatMessage.count({ where: { senderId, receiverId, isRead: false } });
}
async function createDirectMessage(data) {
    return prisma_1.prisma.chatMessage.create({ data });
}
async function findRoomMembership(roomId, userId) {
    return prisma_1.prisma.chatRoomMember.findUnique({ where: { roomId_userId: { roomId, userId } } });
}
async function renameRoom(roomId, name) {
    return prisma_1.prisma.chatRoom.update({ where: { id: roomId }, data: { name: name } });
}
async function addRoomMember(roomId, userId) {
    return prisma_1.prisma.chatRoomMember.upsert({
        where: { roomId_userId: { roomId, userId } },
        create: { roomId, userId },
        update: {},
    });
}
async function countRoomMembers(roomId) {
    return prisma_1.prisma.chatRoomMember.count({ where: { roomId } });
}
async function markRoomAsGroup(roomId) {
    return prisma_1.prisma.chatRoom.update({ where: { id: roomId }, data: { type: 'group' } });
}
async function removeRoomMembers(roomId, userIds) {
    return prisma_1.prisma.chatRoomMember.deleteMany({ where: { roomId, userId: { in: userIds } } });
}
async function findRoomWithMembers(roomId) {
    return prisma_1.prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: { members: { include: { user: { select: { id: true, name: true, avatar: true, role: true } } } } },
    });
}
async function deleteRoomGraph(roomId) {
    await prisma_1.prisma.chatMention.deleteMany({ where: { message: { roomId } } });
    await prisma_1.prisma.chatMessage.deleteMany({ where: { roomId } });
    await prisma_1.prisma.chatRoomMember.deleteMany({ where: { roomId } });
    await prisma_1.prisma.chatRoom.delete({ where: { id: roomId } });
}
