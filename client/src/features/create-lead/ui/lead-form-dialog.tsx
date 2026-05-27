"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { useTranslation } from "@/shared/lib/i18n/context";
import {
  LEAD_SOURCES,
  PRIORITIES,
} from "@/shared/lib/constants";
import { DatePicker } from "@/shared/ui";
import type { Lead, LeadUpsertInput } from "@/entities/lead";
import { useLeadForm } from "@/features/create-lead/model/use-lead-form";
import { PhoneInput } from "@/shared/ui/phone-input";

interface Props {
  lead: Lead | null;
  onSave: (data: LeadUpsertInput) => void | Promise<void>;
  onClose: () => void;
  leadStatuses: Array<{ value: string; label: string; color?: string }>;
}

export function LeadFormDialog({ lead, onSave, onClose, leadStatuses }: Props) {
  const { t } = useTranslation();
  const { users, saving, form, upd, submit, errors, submitError, resetForm } = useLeadForm(lead, onSave);

  useEffect(() => {
    if (lead || leadStatuses.length === 0) return;
    if (!leadStatuses.some((status) => status.value === form.status)) {
      upd("status", leadStatuses[0].value);
    }
  }, [form.status, lead, leadStatuses, upd]);

  const handleCancel = () => {
    resetForm();
    onClose();
  };

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
          {submitError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{t("leads.form.firstName")} *</span>
              <input
                value={form.firstName}
                onChange={(e) => upd("firstName", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm ${errors.firstName ? 'border-destructive/60' : 'border-border'}`}
              />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{t("leads.form.lastName")}</span>
              <input
                value={form.lastName}
                onChange={(e) => upd("lastName", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{t("leads.form.phone")} *</span>
              <PhoneInput
                value={form.phone}
                onChange={(v) => upd("phone", v)}
                error={!!errors.phone}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{t("leads.form.email")}</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => upd("email", e.target.value)}
                autoComplete="email"
                className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm ${errors.email ? 'border-destructive/60' : 'border-border'}`}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{t("leads.source")}</span>
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
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{t("common.status")}</span>
              <select
                value={form.status ?? "new_lead"}
                onChange={(e) => upd("status", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
              >
                {leadStatuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label || t(`const.dealStage.${s.value}`) || s.value}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{t("common.priority")}</span>
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
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{t("leads.form.assignedManager")}</span>
            <select
              value={form.assignedToId ?? ""}
              onChange={(e) => upd("assignedToId", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            >
              <option value="">{t("leads.form.autoAssign")}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.email}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{t("leads.form.needType")}</span>
              <select
                value={form.needType ?? "buy"}
                onChange={(e) => upd("needType", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
              >
                <option value="buy">{t("leads.dialog.needBuy")}</option>
                <option value="sell">{t("leads.dialog.needSell")}</option>
                <option value="rent">{t("leads.dialog.needRent")}</option>
              </select>
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{t("leads.form.budget")}</span>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => upd("budget", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm ${errors.budget ? 'border-destructive/60' : 'border-border'}`}
              />
              {errors.budget && <p className="text-xs text-destructive">{errors.budget}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("leads.lastContact")}</label>
            <DatePicker value={form.lastContact ?? ""} onChange={(value: string) => upd("lastContact", value)} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{t("leads.form.notes")}</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => upd("notes", e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm resize-none ${errors.notes ? 'border-destructive/60' : 'border-border'}`}
            />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
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
