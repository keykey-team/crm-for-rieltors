'use client';

import { useCallback, useEffect, useState } from 'react';

interface UseFormDraftOptions<T> {
  storageKey: string;
  createInitialValue: () => T;
  draftEnabled: boolean;
  resetKey: string | number | null;
}

function readDraft<T>(storageKey: string): T | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeDraft<T>(storageKey: string, value: T) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {}
}

function removeDraft(storageKey: string) {
  try {
    localStorage.removeItem(storageKey);
  } catch {}
}

export function useFormDraft<T>({
  storageKey,
  createInitialValue,
  draftEnabled,
  resetKey,
}: UseFormDraftOptions<T>) {
  const [draftReady, setDraftReady] = useState(false);
  const [form, setForm] = useState<T>(() => createInitialValue());

  useEffect(() => {
    const initialValue = createInitialValue();

    if (!draftEnabled) {
      setForm(initialValue);
      setDraftReady(true);
      return;
    }

    setForm(readDraft<T>(storageKey) ?? initialValue);
    setDraftReady(true);
  }, [createInitialValue, draftEnabled, resetKey, storageKey]);

  useEffect(() => {
    if (!draftEnabled || !draftReady) return;
    writeDraft(storageKey, form);
  }, [draftEnabled, draftReady, form, storageKey]);

  const clearDraft = useCallback(() => {
    removeDraft(storageKey);
  }, [storageKey]);

  const resetForm = useCallback(() => {
    clearDraft();
    setForm(createInitialValue());
  }, [clearDraft, createInitialValue]);

  return {
    form,
    setForm,
    clearDraft,
    resetForm,
  };
}