import { badRequest, forbidden, unauthorized } from '../../../common/shared-kernel/errors';
import {
  addRoomMember,
  countRoomMembers,
  countUnreadDirectMessages,
  createDirectMessage,
  createLeadCommunication,
  deleteRoomGraph,
  findConversationUsers,
  findDirectMessages,
  findLastDirectMessage,
  findLeadCommunications,
  findRoomMembership,
  findRoomWithMembers,
  markDirectMessagesRead,
  markRoomAsGroup,
  removeRoomMembers,
  renameRoom,
} from '../repositories/communication.repository';

export async function listLeadCommunications(leadId: unknown) {
  const id = String(leadId ?? '').trim();
  if (!id) throw badRequest('leadId required');
  return findLeadCommunications(id);
}

export async function addLeadCommunication(userId: string | undefined, input: Record<string, unknown>) {
  return createLeadCommunication({ ...input, userId: userId ?? null });
}

export async function getChat(me: string | undefined, other: string) {
  if (!me) throw unauthorized();
  if (other) {
    const messages = await findDirectMessages(me, other);
    await markDirectMessagesRead(other, me);
    return messages;
  }

  const users = await findConversationUsers(me);
  const conversations = await Promise.all(
    users.map(async (user) => ({
      user,
      lastMessage: await findLastDirectMessage(me, user.id),
      unreadCount: await countUnreadDirectMessages(user.id, me),
    })),
  );
  return conversations.filter((conversation) => conversation.lastMessage || conversation.unreadCount > 0);
}

export async function sendDirectMessage(me: string | undefined, input: Record<string, unknown>) {
  if (!me) throw unauthorized();
  const receiverId = String(input.receiverId ?? '').trim();
  const text = String(input.text ?? '').trim();
  if (!receiverId || !text) throw badRequest('Missing receiverId or text');
  return createDirectMessage({ senderId: me, receiverId, text });
}

export async function updateChatRoom(userId: string, input: Record<string, unknown>) {
  const roomId = String(input.roomId ?? '').trim();
  if (!roomId) throw badRequest('Missing roomId');
  if (!(await findRoomMembership(roomId, userId))) throw forbidden('Not a member');
  if (input.name !== undefined) await renameRoom(roomId, input.name);

  if (Array.isArray(input.addMemberIds)) {
    for (const memberId of input.addMemberIds) await addRoomMember(roomId, String(memberId));
    if ((await countRoomMembers(roomId)) > 2) await markRoomAsGroup(roomId);
  }

  if (Array.isArray(input.removeMemberIds)) {
    await removeRoomMembers(roomId, input.removeMemberIds.map(String));
  }

  return findRoomWithMembers(roomId);
}

export async function deleteChatRoom(userId: string, roomIdInput: unknown) {
  const roomId = String(roomIdInput ?? '').trim();
  if (!roomId) throw badRequest('Missing roomId');
  if (!(await findRoomMembership(roomId, userId))) throw forbidden('Not a member');
  await deleteRoomGraph(roomId);
  return { ok: true };
}

