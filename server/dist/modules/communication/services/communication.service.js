"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLeadCommunications = listLeadCommunications;
exports.addLeadCommunication = addLeadCommunication;
exports.getChat = getChat;
exports.sendDirectMessage = sendDirectMessage;
exports.updateChatRoom = updateChatRoom;
exports.deleteChatRoom = deleteChatRoom;
const errors_1 = require("../../../common/shared-kernel/errors");
const communication_repository_1 = require("../repositories/communication.repository");
async function listLeadCommunications(leadId) {
    const id = String(leadId ?? '').trim();
    if (!id)
        throw (0, errors_1.badRequest)('leadId required');
    return (0, communication_repository_1.findLeadCommunications)(id);
}
async function addLeadCommunication(userId, input) {
    return (0, communication_repository_1.createLeadCommunication)({ ...input, userId: userId ?? null });
}
async function getChat(me, other) {
    if (!me)
        throw (0, errors_1.unauthorized)();
    if (other) {
        const messages = await (0, communication_repository_1.findDirectMessages)(me, other);
        await (0, communication_repository_1.markDirectMessagesRead)(other, me);
        return messages;
    }
    const users = await (0, communication_repository_1.findConversationUsers)(me);
    const conversations = await Promise.all(users.map(async (user) => ({
        user,
        lastMessage: await (0, communication_repository_1.findLastDirectMessage)(me, user.id),
        unreadCount: await (0, communication_repository_1.countUnreadDirectMessages)(user.id, me),
    })));
    return conversations.filter((conversation) => conversation.lastMessage || conversation.unreadCount > 0);
}
async function sendDirectMessage(me, input) {
    if (!me)
        throw (0, errors_1.unauthorized)();
    const receiverId = String(input.receiverId ?? '').trim();
    const text = String(input.text ?? '').trim();
    if (!receiverId || !text)
        throw (0, errors_1.badRequest)('Missing receiverId or text');
    return (0, communication_repository_1.createDirectMessage)({ senderId: me, receiverId, text });
}
async function updateChatRoom(userId, input) {
    const roomId = String(input.roomId ?? '').trim();
    if (!roomId)
        throw (0, errors_1.badRequest)('Missing roomId');
    if (!(await (0, communication_repository_1.findRoomMembership)(roomId, userId)))
        throw (0, errors_1.forbidden)('Not a member');
    if (input.name !== undefined)
        await (0, communication_repository_1.renameRoom)(roomId, input.name);
    if (Array.isArray(input.addMemberIds)) {
        for (const memberId of input.addMemberIds)
            await (0, communication_repository_1.addRoomMember)(roomId, String(memberId));
        if ((await (0, communication_repository_1.countRoomMembers)(roomId)) > 2)
            await (0, communication_repository_1.markRoomAsGroup)(roomId);
    }
    if (Array.isArray(input.removeMemberIds)) {
        await (0, communication_repository_1.removeRoomMembers)(roomId, input.removeMemberIds.map(String));
    }
    return (0, communication_repository_1.findRoomWithMembers)(roomId);
}
async function deleteChatRoom(userId, roomIdInput) {
    const roomId = String(roomIdInput ?? '').trim();
    if (!roomId)
        throw (0, errors_1.badRequest)('Missing roomId');
    if (!(await (0, communication_repository_1.findRoomMembership)(roomId, userId)))
        throw (0, errors_1.forbidden)('Not a member');
    await (0, communication_repository_1.deleteRoomGraph)(roomId);
    return { ok: true };
}
