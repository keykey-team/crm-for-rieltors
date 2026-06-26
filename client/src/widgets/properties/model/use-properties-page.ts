import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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

function getOwnershipFromQuery(value: string | null | undefined): PropertyOwnershipSegment {
  return value === 'potential' ? 'potential' : 'my';
}

function getViewFromQuery(value: string | null | undefined): 'grid' | 'list' {
  return value === 'list' ? 'list' : 'grid';
}

function getEntityIdFromQuery(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export function usePropertiesPage(t: (k: string) => string) {
  const router = useRouter();
  const pathname = usePathname() ?? '/properties';
  const searchParams = useSearchParams();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [ownershipSegment, setOwnershipSegment] = useState<PropertyOwnershipSegment>(() => getOwnershipFromQuery(searchParams?.get('ownership')));
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams?.get('search') ?? '');
  const [typeFilter, setTypeFilter] = useState(() => searchParams?.get('type') ?? '');
  const [statusFilter, setStatusFilter] = useState(() => searchParams?.get('status') ?? '');
  const [dealTypeFilter, setDealTypeFilter] = useState(() => searchParams?.get('dealType') ?? '');
  const [publicationChannelFilter, setPublicationChannelFilter] = useState(() => searchParams?.get('publicationChannel') ?? '');
  const [publicationStatusFilter, setPublicationStatusFilter] = useState(() => searchParams?.get('publicationStatus') ?? '');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProp, setEditProp] = useState<Property | null>(null);
  const [view, setView] = useState<'grid' | 'list'>(() => getViewFromQuery(searchParams?.get('view')));
  const [chessGridPropId, setChessGridPropId] = useState<string | null>(null);
  const [chessGridFloors, setChessGridFloors] = useState<number>(10);
  const [chessGridTitle, setChessGridTitle] = useState('');
  const [previewProp, setPreviewProp] = useState<Property | null>(null);
  const isCreateDialogOpen = dialogOpen && !editProp;
  const isEditDialogOpen = dialogOpen && Boolean(editProp);

  useEffect(() => {
    const nextOwnership = getOwnershipFromQuery(searchParams?.get('ownership'));
    const nextView = getViewFromQuery(searchParams?.get('view'));
    const createRequested = searchParams?.get('create') === '1';
    const editId = getEntityIdFromQuery(searchParams?.get('edit'));
    const previewId = getEntityIdFromQuery(searchParams?.get('preview'));
    const nextSearch = searchParams?.get('search') ?? '';
    const nextType = searchParams?.get('type') ?? '';
    const nextStatus = searchParams?.get('status') ?? '';
    const nextDealType = searchParams?.get('dealType') ?? '';
    const nextPublicationChannel = searchParams?.get('publicationChannel') ?? '';
    const nextPublicationStatus = searchParams?.get('publicationStatus') ?? '';

    if (ownershipSegment !== nextOwnership) setOwnershipSegment(nextOwnership);
    if (view !== nextView) setView(nextView);
    if (search !== nextSearch) setSearch(nextSearch);
    if (typeFilter !== nextType) setTypeFilter(nextType);
    if (statusFilter !== nextStatus) setStatusFilter(nextStatus);
    if (dealTypeFilter !== nextDealType) setDealTypeFilter(nextDealType);
    if (publicationChannelFilter !== nextPublicationChannel) setPublicationChannelFilter(nextPublicationChannel);
    if (publicationStatusFilter !== nextPublicationStatus) setPublicationStatusFilter(nextPublicationStatus);

    if (editId) {
      const matchedProperty = allProperties.find((property) => property.id === editId) ?? null;
      if (matchedProperty && (!isEditDialogOpen || editProp?.id !== matchedProperty.id)) {
        setPreviewProp(null);
        setEditProp(matchedProperty);
        setDialogOpen(true);
      }
      if (!matchedProperty && allProperties.length > 0 && isEditDialogOpen && editProp?.id === editId) {
        setDialogOpen(false);
        setEditProp(null);
      }
    } else if (isEditDialogOpen) {
      setDialogOpen(false);
      setEditProp(null);
    }

    if (!editId) {
      if (createRequested && !isCreateDialogOpen) {
        setEditProp(null);
        setDialogOpen(true);
      }

      if (!createRequested && isCreateDialogOpen) {
        setDialogOpen(false);
        setEditProp(null);
      }
    }

    if (!editId && previewId) {
      const matchedProperty = allProperties.find((property) => property.id === previewId) ?? null;
      if (matchedProperty && previewProp?.id !== matchedProperty.id) {
        setPreviewProp(matchedProperty);
      }
      if (!matchedProperty && allProperties.length > 0 && previewProp?.id !== previewId) {
        setPreviewProp(null);
      }
    } else if (previewProp) {
      setPreviewProp(null);
    }
  }, [
    allProperties,
    dealTypeFilter,
    isCreateDialogOpen,
    isEditDialogOpen,
    editProp,
    ownershipSegment,
    previewProp,
    publicationChannelFilter,
    publicationStatusFilter,
    search,
    searchParams,
    statusFilter,
    typeFilter,
    view,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    if (ownershipSegment === 'potential') params.set('ownership', ownershipSegment);
    else params.delete('ownership');

    if (view === 'list') params.set('view', view);
    else params.delete('view');

    if (search.trim()) params.set('search', search.trim());
    else params.delete('search');

    if (typeFilter) params.set('type', typeFilter);
    else params.delete('type');

    if (statusFilter) params.set('status', statusFilter);
    else params.delete('status');

    if (dealTypeFilter) params.set('dealType', dealTypeFilter);
    else params.delete('dealType');

    if (publicationChannelFilter) params.set('publicationChannel', publicationChannelFilter);
    else params.delete('publicationChannel');

    if (publicationStatusFilter) params.set('publicationStatus', publicationStatusFilter);
    else params.delete('publicationStatus');

    if (isEditDialogOpen && editProp?.id) params.set('edit', editProp.id);
    else params.delete('edit');

    if (isCreateDialogOpen) params.set('create', '1');
    else params.delete('create');

    if (!dialogOpen && previewProp?.id) params.set('preview', previewProp.id);
    else params.delete('preview');

    const next = params.toString();
    const current = searchParams?.toString() ?? '';

    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [
    dealTypeFilter,
    isCreateDialogOpen,
    isEditDialogOpen,
    editProp,
    dialogOpen,
    ownershipSegment,
    pathname,
    previewProp,
    publicationChannelFilter,
    publicationStatusFilter,
    router,
    search,
    searchParams,
    statusFilter,
    typeFilter,
    view,
  ]);

  const fetchProps = useCallback(async () => {
    setLoading(true);
    const data = await getProperties({
      search: search || undefined,
      type: typeFilter || undefined,
      status: statusFilter || undefined,
      dealType: dealTypeFilter || undefined,
      publicationChannel: publicationChannelFilter || undefined,
      publicationStatus: publicationStatusFilter || undefined,
    });
    setAllProperties(data);
    setLoading(false);
    return data;
  }, [dealTypeFilter, publicationChannelFilter, publicationStatusFilter, search, statusFilter, typeFilter]);

  const properties = allProperties.filter((item) => {
    const isPotential = isPotentialStatus(item.status);
    const ownershipMatched = ownershipSegment === 'potential' ? isPotential : !isPotential;
    return ownershipMatched;
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
    publicationChannelFilter,
    setPublicationChannelFilter,
    publicationStatusFilter,
    setPublicationStatusFilter,
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
