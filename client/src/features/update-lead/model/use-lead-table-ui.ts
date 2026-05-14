'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Lead } from '@/entities/lead';

type DropdownType = 'status' | 'source' | 'manager';

export function useLeadTableUi(leads: Lead[], sortBy?: string, sortDir?: 'asc' | 'desc') {
  const [activeDropdown, setActiveDropdown] = useState<{ id: string; type: DropdownType } | null>(null);

  useEffect(() => {
    if (!activeDropdown) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-inline-dropdown]')) setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeDropdown]);

  const toggleDropdown = (id: string, type: DropdownType) => {
    setActiveDropdown((prev) => (prev?.id === id && prev?.type === type ? null : { id, type }));
  };

  const sortedLeads = useMemo(() => {
    if (!sortBy) return leads;
    const arr = [...leads];
    arr.sort((a, b) => {
      let va = '';
      let vb = '';
      switch (sortBy) {
        case 'name':
          va = `${a.firstName} ${a.lastName ?? ''}`;
          vb = `${b.firstName} ${b.lastName ?? ''}`;
          break;
        case 'source':
          va = a.source ?? '';
          vb = b.source ?? '';
          break;
        case 'status':
          va = a.status ?? '';
          vb = b.status ?? '';
          break;
        case 'manager':
          va = a.assignedTo?.name ?? '';
          vb = b.assignedTo?.name ?? '';
          break;
        case 'createdAt':
          va = a.createdAt ?? '';
          vb = b.createdAt ?? '';
          break;
        default:
          return 0;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [leads, sortBy, sortDir]);

  return {
    activeDropdown,
    setActiveDropdown,
    toggleDropdown,
    sortedLeads,
  };
}
