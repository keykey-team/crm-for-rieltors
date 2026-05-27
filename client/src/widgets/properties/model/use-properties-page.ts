import { useCallback, useEffect, useState } from 'react';
import { confirmAction } from '@/shared/lib/confirm-action';
import { createProperty, deleteProperty, getProperties, updateProperty } from '@/entities/property';
import type { Property, PropertyUpsertInput } from '@/entities/property';

export function usePropertiesPage(t: (k: string) => string) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
    });
    setProperties(data);
    setLoading(false);
  }, [search, typeFilter, statusFilter]);

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

  return {
    properties,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
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
    handleSave,
    handleDelete,
  };
}
