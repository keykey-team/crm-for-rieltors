import PDFDocument from 'pdfkit';
import { customAlphabet } from 'nanoid';
import { badRequest, forbidden } from '../../../common/shared-kernel/errors';
import { isAdminRole } from '../../../common/shared-kernel/roles';
import { ClientReaction } from '../models/matching.dto';
import {
  createCommunication,
  createSelection,
  createSelectionItems,
  deleteSelection,
  findSelectionById,
  findSelectionBySlug,
  findSelectionBySlugOnly,
  listSelectionsByUser,
  removeSelectionItem,
  updateSelection,
  updateSelectionItem,
  updateSelectionViews,
} from '../repositories/selections.repository';

export interface CreateSelectionOptions {
  title?: string;
  message?: string;
  expiresAt?: string | null;
}

export interface SelectionsDependencies {
  slugExists: (slug: string) => Promise<boolean>;
  createCommunication: typeof createCommunication;
  findSelectionById: typeof findSelectionById;
  findSelectionBySlug: typeof findSelectionBySlug;
  listSelectionsByUser: typeof listSelectionsByUser;
  createSelection: typeof createSelection;
  createSelectionItems: typeof createSelectionItems;
  removeSelectionItem: typeof removeSelectionItem;
  updateSelection: typeof updateSelection;
  updateSelectionItem: typeof updateSelectionItem;
  updateSelectionViews: typeof updateSelectionViews;
  deleteSelection: typeof deleteSelection;
}

const defaultDeps: SelectionsDependencies = {
  slugExists: async (slug) => Boolean(await findSelectionBySlugOnly(slug)),
  createCommunication,
  findSelectionById,
  findSelectionBySlug,
  listSelectionsByUser,
  createSelection,
  createSelectionItems,
  removeSelectionItem,
  updateSelection,
  updateSelectionItem,
  updateSelectionViews,
  deleteSelection,
};

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);

function buildSlug() {
  return nanoid();
}

export async function generateUniquePublicSlug(checkExists: (slug: string) => Promise<boolean>) {
  for (let i = 0; i < 20; i += 1) {
    const slug = buildSlug();
    if (!(await checkExists(slug))) return slug;
  }
  throw badRequest('Unable to generate unique public slug');
}

function assertSelectionAccess(selection: { createdById: string } | null, userId?: string, role?: string) {
  if (!selection) throw badRequest('Selection not found');
  if (!isAdminRole(role) && selection.createdById !== userId) throw forbidden();
}

function parseDateOrNull(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildReactionContent(reaction: ClientReaction, note?: string) {
  const label = reaction === 'like' ? '👍 like' : reaction === 'dislike' ? '👎 dislike' : '👁 want_to_view';
  return note ? `${label}: ${note}` : label;
}

export function createSelectionsService(deps: SelectionsDependencies = defaultDeps) {
  return {
    async listSelections(userId: string, leadId?: string) {
      return deps.listSelectionsByUser(userId, leadId);
    },

    async createSelection(userId: string, leadId: string, propertyIds: string[], options: CreateSelectionOptions = {}) {
      const uniquePropertyIds = Array.from(new Set(propertyIds.filter(Boolean)));
      if (!uniquePropertyIds.length) throw badRequest('propertyIds required');

      const publicSlug = await generateUniquePublicSlug(deps.slugExists);
      const selection = await deps.createSelection({
        leadId,
        createdById: userId,
        publicSlug,
        title: options.title ?? null,
        message: options.message ?? null,
        expiresAt: parseDateOrNull(options.expiresAt),
      });

      await deps.createSelectionItems(
        uniquePropertyIds.map((propertyId, index) => ({
          selectionId: selection.id,
          propertyId,
          order: index,
        })),
      );

      return deps.findSelectionById(selection.id);
    },

    async addItems(selectionId: string, propertyIds: string[], userId?: string, role?: string) {
      const selection = await deps.findSelectionById(selectionId);
      assertSelectionAccess(selection, userId, role);
      const ids = Array.from(new Set(propertyIds.filter(Boolean)));
      await deps.createSelectionItems(ids.map((propertyId, index) => ({ selectionId, propertyId, order: 1000 + index })));
      return deps.findSelectionById(selectionId);
    },

    async removeItem(selectionId: string, itemId: string, userId?: string, role?: string) {
      const selection = await deps.findSelectionById(selectionId);
      assertSelectionAccess(selection, userId, role);
      await deps.removeSelectionItem(selectionId, itemId);
      return deps.findSelectionById(selectionId);
    },

    async reorderItems(selectionId: string, items: Array<{ itemId: string; order: number }>, userId?: string, role?: string) {
      const selection = await deps.findSelectionById(selectionId);
      assertSelectionAccess(selection, userId, role);
      await Promise.all(items.map((item) => deps.updateSelectionItem(item.itemId, { order: item.order })));
      return deps.findSelectionById(selectionId);
    },

    async updateItemComment(selectionId: string, itemId: string, agentComment: string | null, userId?: string, role?: string) {
      const selection = await deps.findSelectionById(selectionId);
      assertSelectionAccess(selection, userId, role);
      await deps.updateSelectionItem(itemId, { agentComment: agentComment || null });
      return deps.findSelectionById(selectionId);
    },

    async updateSelection(selectionId: string, meta: CreateSelectionOptions, userId?: string, role?: string) {
      const selection = await deps.findSelectionById(selectionId);
      assertSelectionAccess(selection, userId, role);
      await deps.updateSelection(selectionId, {
        ...(meta.title !== undefined ? { title: meta.title || null } : {}),
        ...(meta.message !== undefined ? { message: meta.message || null } : {}),
        ...(meta.expiresAt !== undefined ? { expiresAt: parseDateOrNull(meta.expiresAt) } : {}),
      });
      return deps.findSelectionById(selectionId);
    },

    async deleteSelection(selectionId: string, userId?: string, role?: string) {
      const selection = await deps.findSelectionById(selectionId);
      assertSelectionAccess(selection, userId, role);
      await deps.deleteSelection(selectionId);
      return { ok: true };
    },

    async getBySlug(slug: string) {
      const selection = await deps.findSelectionBySlug(slug);
      if (!selection) throw badRequest('Selection not found');
      if (selection.expiresAt && new Date(selection.expiresAt).getTime() < Date.now()) throw badRequest('Selection expired');
      await deps.updateSelectionViews(selection.id);
      return deps.findSelectionBySlug(slug);
    },

    async recordReaction(slug: string, itemId: string, reaction: ClientReaction, clientNote?: string) {
      const selection = await deps.findSelectionBySlug(slug);
      if (!selection) throw badRequest('Selection not found');

      const item = selection.items.find((entry) => entry.id === itemId);
      if (!item) throw badRequest('Selection item not found');

      await deps.updateSelectionItem(itemId, {
        clientReaction: reaction,
        clientNote: clientNote || null,
        reactedAt: new Date(),
      });

      await deps.createCommunication({
        leadId: selection.leadId,
        type: 'selection_reaction',
        direction: 'inbound',
        content: buildReactionContent(reaction, clientNote),
        userId: null,
      });

      return deps.findSelectionBySlug(slug);
    },

    async getSelectionPdf(selectionId: string, userId?: string, role?: string): Promise<Buffer> {
      const selection = await deps.findSelectionById(selectionId);
      assertSelectionAccess(selection, userId, role);

      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));

      const title = selection?.title || `Selection #${selection?.id}`;
      doc.fontSize(18).text(title);
      if (selection?.message) doc.moveDown().fontSize(11).text(selection.message);
      doc.moveDown();

      selection?.items.forEach((item, index) => {
        doc.fontSize(13).text(`${index + 1}. ${item.property.title}`);
        doc.fontSize(11).text(`Price: ${item.property.price} ${item.property.currency}`);
        doc.text(`Area: ${item.property.area ?? '—'} m² | Rooms: ${item.property.rooms ?? '—'}`);
        doc.text(`Address: ${item.property.address}`);
        if (item.agentComment) doc.text(`Comment: ${item.agentComment}`);
        doc.moveDown();
      });

      doc.end();
      await new Promise<void>((resolve) => doc.on('end', () => resolve()));
      return Buffer.concat(chunks);
    },
  };
}

export const selectionsService = createSelectionsService();
