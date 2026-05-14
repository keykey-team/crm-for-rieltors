"use client";

import { X } from "lucide-react";

import { useTranslation } from "@/shared/lib/i18n/context";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  PRIORITIES,
} from "@/shared/lib/constants";
import type { Lead, LeadUpsertInput } from "@/entities/lead";
import { useLeadForm } from "@/features/create-lead/model/use-lead-form";

interface Props {
  lead: Lead | null;
  onSave: (data: LeadUpsertInput) => void | Promise<void>;
  onClose: () => void;
}

export function LeadFormDialog({ lead, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const { users, saving, form, upd, submit } = useLeadForm(lead, onSave);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "var(--shadow-lg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display font-bold text-lg">
            {lead ? t("leads.dialog.editLead") : t("leads.dialog.newLead")}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              value={form.firstName}
              onChange={(e) => upd("firstName", e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            />
            <input
              value={form.lastName}
              onChange={(e) => upd("lastName", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              value={form.phone}
              onChange={(e) => upd("phone", e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => upd("email", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <select
              value={form.source ?? "manual"}
              onChange={(e) => upd("source", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            >
              {LEAD_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {t(`const.leadSource.${s.value}`) || s.label}
                </option>
              ))}
            </select>
            <select
              value={form.status ?? "new"}
              onChange={(e) => upd("status", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {t(`const.leadStatus.${s.value}`) || s.label}
                </option>
              ))}
            </select>
            <select
              value={form.priority ?? "medium"}
              onChange={(e) => upd("priority", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {t(`const.priority.${p.value}`) || p.label}
                </option>
              ))}
            </select>
          </div>
          <select
            value={form.assignedToId ?? ""}
            onChange={(e) => upd("assignedToId", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
          >
            <option value="">{t("leads.autoAssign")}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ?? u.email}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={form.needType ?? "buy"}
              onChange={(e) => upd("needType", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            >
              <option value="buy">{t("leads.dialog.needBuy")}</option>
              <option value="sell">{t("leads.dialog.needSell")}</option>
              <option value="rent">{t("leads.dialog.needRent")}</option>
            </select>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => upd("budget", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            />
          </div>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => upd("notes", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm resize-none"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
