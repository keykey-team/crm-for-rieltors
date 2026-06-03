import { useCallback, useEffect, useState } from 'react';
import { confirmAction } from '@/shared/lib/confirm-action';
import { createProperty, deleteProperty, getProperties, updateProperty } from '@/entities/property';
import type { Property, PropertyUpsertInput } from '@/entities/property';

export type PropertyOwnershipSegment = 'my' | 'potential';

function isPotentialStatus(status?: string | null) {
  return status === 'inactive';
}

function toStatusByOwnership(target: PropertyOwnershipSegment): string {
  return target === 'potential' ? 'inactive' : 'active';
}

export function usePropertiesPage(t: (k: string) => string) {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [ownershipSegment, setOwnershipSegment] = useState<PropertyOwnershipSegment>('my');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dealTypeFilter, setDealTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProp, setEditProp] = useState<Property | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [chessGridPropId, setChessGridPropId] = useState<string | null>(null);
  const [chessGridFloors, setChessGridFloors] = useState<number>(10);
  const [chessGridTitle, setChessGridTitle] = useState('');
  const [previewProp, setPreviewProp] = useState<Property | null>(null);

  const fetchProps = useCallback(async () => {
    setLoading(true);
    const data = await getProperties({
      search: search || undefined,
      type: typeFilter || undefined,
      status: statusFilter || undefined,
      dealType: dealTypeFilter || undefined,
    });
    setAllProperties(data);
    setLoading(false);
    return data;
  }, [dealTypeFilter, search, statusFilter, typeFilter]);

  const properties = allProperties.filter((item) => {
    const isPotential = isPotentialStatus(item.status);
    return ownershipSegment === 'potential' ? isPotential : !isPotential;
  });

  useEffect(() => {
    fetchProps();
  }, [fetchProps]);

  const handleSave = useCallback(async (data: PropertyUpsertInput) => {
    if (editProp) await updateProperty(editProp.id, data);
    else await createProperty(data);
    setDialogOpen(false);
    setEditProp(null);
    fetchProps();
  }, [editProp, fetchProps]);

  const handleDelete = useCallback(async (id: string) => {
    const ok = await confirmAction(t('properties.deleteProperty'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await deleteProperty(id);
    fetchProps();
  }, [fetchProps, t]);

  const handleOwnershipChange = useCallback(async (property: Property, target: PropertyOwnershipSegment) => {
    const nextStatus = toStatusByOwnership(target);
    if (property.status === nextStatus) return;
    await updateProperty(property.id, { status: nextStatus });
    await fetchProps();
  }, [fetchProps]);

  return {
    properties,
    ownershipSegment,
    setOwnershipSegment,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    dealTypeFilter,
    setDealTypeFilter,
    dialogOpen,
    setDialogOpen,
    editProp,
    setEditProp,
    view,
    setView,
    chessGridPropId,
    setChessGridPropId,
    chessGridFloors,
    setChessGridFloors,
    chessGridTitle,
    setChessGridTitle,
    previewProp,
    setPreviewProp,
    fetchProps,
    handleSave,
    handleDelete,
    handleOwnershipChange,
  };
}
