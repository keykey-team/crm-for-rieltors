import { badRequest, forbidden, unauthorized } from '../../../common/shared-kernel/errors';
import { isAdminRole } from '../../../common/shared-kernel/roles';
import { prisma } from '../../../common/infrastructure/db/prisma';
import {
  addRoomMember,
  countRoomMembers,
  countUnreadDirectMessages,
  createRoomMessage,
  createDirectMessage,
  createLeadCommunication,
  deleteRoomGraph,
  findConversationUsers,
  findDirectMessages,
  findLastDirectMessage,
  findLeadCommunications,
  findRoomMembershipForUser,
  findRoomMembership,
  findRoomWithMembers,
  findActiveAgencyMemberIds,
  findRoomMessages,
  findRoomsForUser,
  markDirectMessagesRead,
  markRoomRead,
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

export async function getChat(me: string | undefined, query: Record<string, unknown>) {
  if (!me) throw unauthorized();
  const roomId = typeof query.roomId === 'string' ? query.roomId.trim() : '';
  const threadId = typeof query.threadId === 'string' ? query.threadId.trim() : '';
  const other = typeof query.userId === 'string' ? query.userId.trim() : '';

  if (roomId) {
    if (!(await findRoomMembershipForUser(roomId, me))) throw forbidden('Not a member');
    const messages = await findRoomMessages(roomId, threadId || undefined);
    await markRoomRead(roomId, me);
    return messages;
  }

  if (other) {
    const messages = await findDirectMessages(me, other);
    await markDirectMessagesRead(other, me);
    return messages;
  }

  const rooms = await findRoomsForUser(me);
  return rooms.map((room: any) => {
    const currentMember = room.members.find((member: any) => member.user.id === me);
    const lastMessage = room.messages[0]
      ? {
          ...room.messages[0],
          sender: room.messages[0].sender,
        }
      : null;
    const unreadCount = currentMember
      ? room.messages.filter((message: any) => message.senderId !== me && message.createdAt > currentMember.lastReadAt).length
      : 0;

    return {
      ...room,
      members: room.members.map((member: any) => member.user),
      lastMessage,
      unreadCount,
      messages: undefined,
    };
  });
}

export async function listChatUsers(me: string | undefined, agencyId: string | undefined) {
  if (!me) throw unauthorized();
  if (!agencyId) throw badRequest('Missing agency');
  return findConversationUsers(me, agencyId);
}

export async function sendChatMessage(me: string | undefined, input: Record<string, unknown>) {
  if (!me) throw unauthorized();
  const roomId = String(input.roomId ?? '').trim();
  const receiverId = String(input.receiverId ?? '').trim();
  const text = String(input.text ?? '').trim();
  const threadId = input.threadId === undefined ? null : String(input.threadId).trim() || null;
  const mentions = Array.isArray(input.mentions) ? input.mentions.map((value) => String(value).trim()).filter(Boolean) : [];

  if (!text) throw badRequest('Missing text');

  if (roomId) {
    const room = await findRoomWithMembers(roomId);
    if (!room || !(await findRoomMembership(roomId, me))) throw forbidden('Not a member');
    const receiver = room.type === 'direct'
      ? room.members.find((member: any) => member.user.id !== me)?.user.id ?? me
      : me;
    return createRoomMessage({ roomId, senderId: me, receiverId: receiver, text, threadId, mentions });
  }

  if (!receiverId) throw badRequest('Missing receiverId or roomId');
  return createDirectMessage({ senderId: me, receiverId, text });
}

export async function createChatRoom(
  userId: string | undefined,
  role: string | undefined,
  agencyId: string | undefined,
  input: Record<string, unknown>,
) {
  if (!userId) throw unauthorized();
  if (!agencyId) throw badRequest('Missing agency');

  const name = input.name === undefined ? null : String(input.name).trim() || null;
  const memberIds = Array.isArray(input.memberIds)
    ? Array.from(new Set(input.memberIds.map((memberId) => String(memberId).trim()).filter(Boolean)))
    : [];

  if (memberIds.length === 0) throw badRequest('At least one member required');
  const allowedMemberIds = await findActiveAgencyMemberIds(agencyId, memberIds);
  if (allowedMemberIds.length !== memberIds.length) {
    throw badRequest('Some selected users are not active members of current agency');
  }
  const isGroupChat = memberIds.length > 1 || Boolean(name);
  if (isGroupChat && !isAdminRole(role)) throw forbidden('Only admin and director can create group chats');

  return prisma.chatRoom.create({
    data: {
      name,
      type: isGroupChat ? 'group' : 'direct',
      createdById: userId,
      agencyId,
      members: {
        create: [{ userId }, ...allowedMemberIds.map((memberId: string) => ({ userId: memberId }))],
      },
    },
    include: { members: { include: { user: { select: { id: true, name: true, avatar: true, role: true } } } } },
  });
}

export async function updateChatRoom(userId: string, input: Record<string, unknown>) {
  const roomId = String(input.roomId ?? '').trim();
  if (!roomId) throw badRequest('Missing roomId');
  const room = await findRoomWithMembers(roomId);
  if (!room || !(await findRoomMembership(roomId, userId))) throw forbidden('Not a member');
  if (input.name !== undefined) await renameRoom(roomId, input.name);

  if (Array.isArray(input.addMemberIds)) {
    const addMemberIds = Array.from(new Set(input.addMemberIds.map((memberId) => String(memberId).trim()).filter(Boolean)));
    const allowedMemberIds = await findActiveAgencyMemberIds(room.agencyId, addMemberIds);
    if (allowedMemberIds.length !== addMemberIds.length) {
      throw badRequest('Some selected users are not active members of current agency');
    }
    for (const memberId of allowedMemberIds) await addRoomMember(roomId, memberId);
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

