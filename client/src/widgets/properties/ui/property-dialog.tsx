'use client';
import { useTranslation } from '@/shared/lib/i18n/context';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Plus, Trash2, X } from 'lucide-react';
import { PROPERTY_DEAL_TYPES } from '@/shared/lib/constants';
import { useFormDraft } from '@/shared/hooks/use-form-draft';
import { usePropertyOptions } from '@/entities/property';
import type { Property, PropertyUpsertInput } from '@/entities/property';
import { getUploadPresigned } from '@/shared/api/upload.api';
import { convertImageToWebp } from '@/shared/lib/files/convertImageToWebp';
import { parseForm, propertySchema } from '@/shared/lib/validation';
import { cn } from '@/shared/lib/utils';

const CREATE_PROPERTY_DRAFT_KEY = 'crm_create_property_draft';
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;

type PropertyPhotoDraft = {
  key: string;
  url: string;
  cloudStoragePath?: string;
  isLocal: boolean;
  isPublic: boolean;
  file?: File;
};

type PropertyDocumentDraft = {
  key: string;
  title: string;
  documentType: string;
  url: string;
  cloudStoragePath?: string;
  isLocal: boolean;
  file?: File;
};

type PropertyMediaLinkDraft = {
  key: string;
  title: string;
  mediaType: string;
  url: string;
};

type PropertyPublicationDraft = {
  key: string;
  channel: string;
  status: string;
  url: string;
  note: string;
  publishedAt: string;
  lastSyncedAt: string;
};

type PropertyFormState = {
  title: string;
  internalCode: string;
  type: string;
  source: string;
  ownerName: string;
  ownerPhone: string;
  developerName: string;
  developerContact: string;
  address: string;
  dealTypes: string[];
  district: string;
  city: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  landArea: string;
  floor: string;
  totalFloors: string;
  price: string;
  currency: string;
  paymentCondition: string;
  communicationTypes: string[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  publicationNotes: string;
  status: string;
  layoutType: string;
  repairType: string;
  heatingType: string;
  wallType: string;
  realEstateClass: string;
  commercialPurpose: string;
  parkingType: string;
  parkingSpaces: string;
  yearBuilt: string;
  ceilingHeight: string;
  managerComment: string;
  internalDescription: string;
  publicDescription: string;
  description: string;
};

function createEmptyForm(property: Property | null): PropertyFormState {
  return {
    title: property?.title ?? '',
    internalCode: property?.internalCode ?? '',
    type: property?.type ?? 'apartment',
    source: property?.source ?? '',
    ownerName: property?.ownerName ?? '',
    ownerPhone: property?.ownerPhone ?? '',
    developerName: property?.developerName ?? '',
    developerContact: property?.developerContact ?? '',
    address: property?.address ?? '',
    dealTypes: property?.dealTypes?.length ? property.dealTypes : ['sale'],
    district: property?.district ?? '',
    city: property?.city ?? 'Київ',
    rooms: property?.rooms?.toString() ?? '',
    bedrooms: property?.bedrooms?.toString() ?? '',
    bathrooms: property?.bathrooms?.toString() ?? '',
    area: property?.area?.toString() ?? '',
    landArea: property?.landArea?.toString() ?? '',
    floor: property?.floor?.toString() ?? '',
    totalFloors: property?.totalFloors?.toString() ?? '',
    price: property?.price?.toString() ?? '',
    currency: property?.currency ?? 'USD',
    paymentCondition: property?.paymentCondition ?? '',
    communicationTypes: property?.communicationTypes ?? [],
    tags: property?.tags ?? [],
    isPublished: property?.isPublished === true,
    isFeatured: property?.isFeatured === true,
    publicationNotes: property?.publicationNotes ?? '',
    status: property?.status ?? 'active',
    layoutType: property?.layoutType ?? '',
    repairType: property?.repairType ?? '',
    heatingType: property?.heatingType ?? '',
    wallType: property?.wallType ?? '',
    realEstateClass: property?.realEstateClass ?? '',
    commercialPurpose: property?.commercialPurpose ?? '',
    parkingType: property?.parkingType ?? '',
    parkingSpaces: property?.parkingSpaces?.toString() ?? '',
    yearBuilt: property?.yearBuilt?.toString() ?? '',
    ceilingHeight: property?.ceilingHeight?.toString() ?? '',
    managerComment: property?.managerComment ?? '',
    internalDescription: property?.internalDescription ?? '',
    publicDescription: property?.publicDescription ?? '',
    description: property?.description ?? '',
  };
}

function createInitialPhotos(property: Property | null): PropertyPhotoDraft[] {
  return (property?.photos ?? []).map((photo, index) => ({
    key: photo.id ?? photo.cloudStoragePath ?? `${property?.id ?? 'property'}-${index}`,
    url: photo.url ?? photo.cloudStoragePath ?? '',
    cloudStoragePath: photo.cloudStoragePath,
    isLocal: false,
    isPublic: photo.isPublic !== false,
  })).filter((photo) => photo.url || photo.cloudStoragePath);
}

function createInitialDocuments(property: Property | null): PropertyDocumentDraft[] {
  return (property?.documents ?? []).map((document, index) => ({
    key: document.id ?? document.cloudStoragePath ?? `${property?.id ?? 'property-document'}-${index}`,
    title: document.title,
    documentType: document.documentType ?? '',
    url: document.url ?? document.cloudStoragePath,
    cloudStoragePath: document.cloudStoragePath,
    isLocal: false,
  })).filter((document) => document.title && (document.url || document.cloudStoragePath));
}

function createInitialMediaLinks(property: Property | null): PropertyMediaLinkDraft[] {
  return (property?.mediaLinks ?? []).map((media, index) => ({
    key: media.id ?? `${property?.id ?? 'property-media'}-${index}`,
    title: media.title,
    mediaType: media.mediaType ?? '',
    url: media.url,
  })).filter((media) => media.title && media.url);
}

function createInitialPublications(property: Property | null): PropertyPublicationDraft[] {
  return (property?.publications ?? []).map((publication, index) => ({
    key: publication.id ?? `${property?.id ?? 'property-publication'}-${index}`,
    channel: publication.channel,
    status: publication.status,
    url: publication.url ?? '',
    note: publication.note ?? '',
    publishedAt: formatDateTimeLocal(publication.publishedAt),
    lastSyncedAt: formatDateTimeLocal(publication.lastSyncedAt),
  })).filter((publication) => publication.channel && publication.status);
}

function formatDateTimeLocal(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (part: number) => String(part).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function revokeObjectUrl(photo: PropertyPhotoDraft) {
  if (photo.isLocal) URL.revokeObjectURL(photo.url);
}

function revokeDocumentUrl(document: PropertyDocumentDraft) {
  if (document.isLocal) URL.revokeObjectURL(document.url);
}

function getOwnershipFromStatus(status?: string | null): 'my' | 'potential' {
  return status === 'inactive' ? 'potential' : 'my';
}

function getStatusFromOwnership(ownership: 'my' | 'potential'): string {
  return ownership === 'potential' ? 'inactive' : 'active';
}

export function PropertyDialog({ property, onSave, onClose }: { property: Property | null; onSave: (d: PropertyUpsertInput) => void | Promise<void>; onClose: () => void }) {
  const { t } = useTranslation();
  const {
    typeOptions,
    statusOptions,
    dealTypeOptions,
    currencyOptions,
    districtOptions,
    sourceOptions,
    layoutTypeOptions,
    repairTypeOptions,
    heatingTypeOptions,
    wallTypeOptions,
    documentTypeOptions,
    realEstateClassOptions,
    commercialPurposeOptions,
    parkingTypeOptions,
    paymentConditionOptions,
    communicationTypeOptions,
    mediaTypeOptions,
    tagOptions,
    publicationChannelOptions,
    publicationStatusOptions,
  } = usePropertyOptions(t);
  const createInitialValue = useCallback(() => createEmptyForm(property), [property]);
  const { form, setForm, clearDraft, resetForm } = useFormDraft<PropertyFormState>({
    storageKey: CREATE_PROPERTY_DRAFT_KEY,
    createInitialValue,
    draftEnabled: !property,
    resetKey: property?.id ?? 'create',
  });
  const [saving, setSaving] = useState(false);
  const [preparingPhotos, setPreparingPhotos] = useState(false);
  const [photos, setPhotos] = useState<PropertyPhotoDraft[]>(() => createInitialPhotos(property));
  const [documents, setDocuments] = useState<PropertyDocumentDraft[]>(() => createInitialDocuments(property));
  const [mediaLinks, setMediaLinks] = useState<PropertyMediaLinkDraft[]>(() => createInitialMediaLinks(property));
  const [publications, setPublications] = useState<PropertyPublicationDraft[]>(() => createInitialPublications(property));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const ownership = getOwnershipFromStatus(form.status);
  const photosRef = useRef(photos);
  const documentsRef = useRef(documents);
  const upd = <K extends keyof PropertyFormState>(k: K, v: PropertyFormState[K]) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: '' })); setSubmitError(''); };
  const toggleArrayValue = (key: 'communicationTypes' | 'tags', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((item) => item !== value) : [...prev[key], value],
    }));
    setSubmitError('');
  };

  const withCurrentValue = (items: Array<{ value: string; label: string }>, current: string) => {
    if (!current) return items;
    return items.some((item) => item.value === current) ? items : [...items, { value: current, label: current }];
  };

  const districtSelectOptions = withCurrentValue(districtOptions, form.district);
  const sourceSelectOptions = withCurrentValue(sourceOptions, form.source);
  const layoutSelectOptions = withCurrentValue(layoutTypeOptions, form.layoutType);
  const repairSelectOptions = withCurrentValue(repairTypeOptions, form.repairType);
  const heatingSelectOptions = withCurrentValue(heatingTypeOptions, form.heatingType);
  const wallSelectOptions = withCurrentValue(wallTypeOptions, form.wallType);
  const currencySelectOptions = withCurrentValue(currencyOptions, form.currency);
  const documentTypeSelectOptions = withCurrentValue(documentTypeOptions, '');
  const realEstateClassSelectOptions = withCurrentValue(realEstateClassOptions, form.realEstateClass);
  const commercialPurposeSelectOptions = withCurrentValue(commercialPurposeOptions, form.commercialPurpose);
  const parkingTypeSelectOptions = withCurrentValue(parkingTypeOptions, form.parkingType);
  const paymentConditionSelectOptions = withCurrentValue(paymentConditionOptions, form.paymentCondition);
  const publicationChannelSelectOptions = publicationChannelOptions;
  const publicationStatusSelectOptions = publicationStatusOptions;
  const isResidentialType = ['apartment', 'apartments', 'house', 'townhouse', 'duplex'].includes(form.type);
  const isHouseType = ['house', 'townhouse', 'duplex'].includes(form.type);
  const isCommercialType = ['commercial', 'office', 'retail', 'warehouse'].includes(form.type);
  const isLandType = form.type === 'land';
  const showLayout = ['apartment', 'apartments'].includes(form.type);
  const showBuildingSpecificFields = isResidentialType || isCommercialType;
  const showParkingFields = isResidentialType || isCommercialType;
  const showLandArea = isHouseType || isLandType;

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  useEffect(() => {
    setMediaLinks(createInitialMediaLinks(property));
  }, [property]);

  useEffect(() => {
    setPublications(createInitialPublications(property));
  }, [property]);

  useEffect(() => {
    setErrors({});
    setSubmitError('');
  }, [property?.id]);

  useEffect(() => {
    setPhotos((previous) => {
      previous.forEach(revokeObjectUrl);
      return createInitialPhotos(property);
    });
  }, [property]);

  useEffect(() => {
    setDocuments((previous) => {
      previous.forEach(revokeDocumentUrl);
      return createInitialDocuments(property);
    });
  }, [property]);

  useEffect(() => () => {
    photosRef.current.forEach(revokeObjectUrl);
    documentsRef.current.forEach(revokeDocumentUrl);
  }, []);

  const toNum = (v: string) => (v !== '' ? Number(v) : undefined);

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    setPreparingPhotos(true);
    setSubmitError('');
    try {
      const converted = await Promise.all(files.map((file) => convertImageToWebp(file)));
      const tooLarge = converted.find((file) => file.size > MAX_UPLOAD_SIZE);
      if (tooLarge) throw new Error(t('properties.photos.tooLarge'));

      setPhotos((previous) => [
        ...previous,
        ...converted.map((file, index) => ({
          key: `${file.name}-${Date.now()}-${index}`,
          url: URL.createObjectURL(file),
          isLocal: true,
          isPublic: true,
          file,
        })),
      ]);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t('properties.photos.processFailed'));
    } finally {
      setPreparingPhotos(false);
    }
  };

  const handlePhotoRemove = (key: string) => {
    setPhotos((previous) => {
      const current = previous.find((photo) => photo.key === key);
      if (current) revokeObjectUrl(current);
      return previous.filter((photo) => photo.key !== key);
    });
  };

  const handleDocumentSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    const tooLarge = files.find((file) => file.size > MAX_DOCUMENT_SIZE);
    if (tooLarge) {
      setSubmitError(t('properties.documents.tooLarge'));
      return;
    }

    setSubmitError('');
    setDocuments((previous) => [
      ...previous,
      ...files.map((file, index) => ({
        key: `${file.name}-${Date.now()}-${index}`,
        title: file.name,
        documentType: '',
        url: URL.createObjectURL(file),
        isLocal: true,
        file,
      })),
    ]);
  };

  const updateDocumentField = (key: string, field: 'title' | 'documentType', value: string) => {
    setDocuments((previous) => previous.map((document) => (document.key === key ? { ...document, [field]: value } : document)));
  };

  const handleDocumentRemove = (key: string) => {
    setDocuments((previous) => {
      const current = previous.find((document) => document.key === key);
      if (current) revokeDocumentUrl(current);
      return previous.filter((document) => document.key !== key);
    });
  };

  const addMediaLink = () => {
    setMediaLinks((previous) => [
      ...previous,
      { key: `media-${Date.now()}-${previous.length}`, title: '', mediaType: '', url: '' },
    ]);
  };

  const updateMediaLinkField = (key: string, field: 'title' | 'mediaType' | 'url', value: string) => {
    setMediaLinks((previous) => previous.map((media) => (media.key === key ? { ...media, [field]: value } : media)));
    setSubmitError('');
  };

  const removeMediaLink = (key: string) => {
    setMediaLinks((previous) => previous.filter((media) => media.key !== key));
  };

  const addPublication = () => {
    setPublications((previous) => [
      ...previous,
      {
        key: `publication-${Date.now()}-${previous.length}`,
        channel: '',
        status: '',
        url: '',
        note: '',
        publishedAt: '',
        lastSyncedAt: '',
      },
    ]);
  };

  const updatePublicationField = (key: string, field: 'channel' | 'status' | 'url' | 'note' | 'publishedAt' | 'lastSyncedAt', value: string) => {
    setPublications((previous) => previous.map((publication) => (publication.key === key ? { ...publication, [field]: value } : publication)));
    setSubmitError('');
  };

  const removePublication = (key: string) => {
    setPublications((previous) => previous.filter((publication) => publication.key !== key));
  };

  const uploadPhotos = async () => {
    return Promise.all(photos.map(async (photo) => {
      if (!photo.file) {
        if (!photo.cloudStoragePath) throw new Error(t('properties.photos.uploadFailed'));
        return { cloudStoragePath: photo.cloudStoragePath, isPublic: photo.isPublic };
      }

      const presigned = await getUploadPresigned({
        fileName: photo.file.name,
        contentType: photo.file.type,
        size: photo.file.size,
        isPublic: photo.isPublic,
      });
      const uploadUrl = presigned.uploadUrl || presigned.url;
      const cloudStoragePath = presigned.cloud_storage_path || presigned.cloudStoragePath;

      if (!uploadUrl || !cloudStoragePath) throw new Error(t('properties.photos.uploadFailed'));
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': photo.file.type,
          'Content-Disposition': 'attachment',
        },
        body: photo.file,
      });
      if (!uploadResponse.ok) throw new Error(t('properties.photos.uploadFailed'));

      return { cloudStoragePath, isPublic: photo.isPublic };
    }));
  };

  const uploadDocuments = async () => {
    return Promise.all(documents.map(async (document) => {
      if (!document.file) {
        if (!document.cloudStoragePath) throw new Error(t('properties.documents.uploadFailed'));
        return {
          title: document.title.trim(),
          documentType: document.documentType || undefined,
          cloudStoragePath: document.cloudStoragePath,
        };
      }

      const presigned = await getUploadPresigned({
        fileName: document.file.name,
        contentType: document.file.type || 'application/octet-stream',
        size: document.file.size,
        isPublic: false,
      });
      const uploadUrl = presigned.uploadUrl || presigned.url;
      const cloudStoragePath = presigned.cloud_storage_path || presigned.cloudStoragePath;

      if (!uploadUrl || !cloudStoragePath) throw new Error(t('properties.documents.uploadFailed'));
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': document.file.type || 'application/octet-stream',
          'Content-Disposition': 'attachment',
        },
        body: document.file,
      });
      if (!uploadResponse.ok) throw new Error(t('properties.documents.uploadFailed'));

      return {
        title: document.title.trim() || document.file.name,
        documentType: document.documentType || undefined,
        cloudStoragePath,
      };
    }));
  };

  const handleCancel = () => {
    photos.forEach(revokeObjectUrl);
    documents.forEach(revokeDocumentUrl);
    resetForm();
    setErrors({});
    setSubmitError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = parseForm(propertySchema, {
      title: form.title,
      address: form.address,
      price: toNum(form.price),
      dealTypes: form.dealTypes,
      bedrooms: toNum(form.bedrooms),
      bathrooms: toNum(form.bathrooms),
      parkingSpaces: toNum(form.parkingSpaces),
      yearBuilt: toNum(form.yearBuilt),
      ceilingHeight: toNum(form.ceilingHeight),
      landArea: toNum(form.landArea),
      mediaLinks: mediaLinks.filter((media) => media.title.trim() || media.url.trim()).map((media) => ({ title: media.title, url: media.url })),
      publications: publications
        .filter((publication) => publication.channel.trim() || publication.status.trim() || publication.url.trim() || publication.note.trim() || publication.publishedAt.trim() || publication.lastSyncedAt.trim())
        .map((publication) => ({
          channel: publication.channel,
          status: publication.status,
          url: publication.url,
          note: publication.note,
          publishedAt: publication.publishedAt,
          lastSyncedAt: publication.lastSyncedAt,
        })),
      floor: toNum(form.floor),
      totalFloors: toNum(form.totalFloors),
    });
    if (!validation.ok) { setErrors(validation.errors); return; }
    setErrors({});
    setSaving(true);
    setSubmitError('');
    try {
      const uploadedPhotos = await uploadPhotos();
      const uploadedDocuments = await uploadDocuments();
      await onSave({
        ...form,
        mediaLinks,
        publications,
        photos: uploadedPhotos,
        documents: uploadedDocuments,
      });
      if (!property) clearDraft();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t('common.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display font-bold text-lg">{property ? t('properties.dialog.editProperty') : t('properties.dialog.newProperty')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.title')} *</label>
            <input value={form.title} onChange={(e) => upd('title', e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.title ? 'border-destructive/60' : 'border-border'}`} />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('properties.form.internalCode')}</label>
            <input value={form.internalCode} onChange={(e) => upd('internalCode', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.type')}</label>
              <select value={form.type} onChange={(e) => upd('type', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                {typeOptions.map((pt) => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.status')}</label>
              <select value={form.status} onChange={(e) => upd('status', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                {statusOptions.map((ps) => <option key={ps.value} value={ps.value}>{ps.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('properties.form.source')}</label>
            <select value={form.source} onChange={(e) => upd('source', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
              <option value="">{t('common.notSelected')}</option>
              {sourceSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('properties.form.ownerName')}</label>
              <input value={form.ownerName} onChange={(e) => upd('ownerName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('properties.form.ownerPhone')}</label>
              <input value={form.ownerPhone} onChange={(e) => upd('ownerPhone', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('properties.form.developerName')}</label>
              <input value={form.developerName} onChange={(e) => upd('developerName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('properties.form.developerContact')}</label>
              <input value={form.developerContact} onChange={(e) => upd('developerContact', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('properties.segment.label')}</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => upd('status', getStatusFromOwnership('my'))}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-semibold border transition-all',
                  ownership === 'my'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground',
                )}
              >
                {t('properties.segment.my')}
              </button>
              <button
                type="button"
                onClick={() => upd('status', getStatusFromOwnership('potential'))}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-semibold border transition-all',
                  ownership === 'potential'
                    ? 'border-amber-300 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground',
                )}
              >
                {t('properties.segment.potential')}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('properties.dealType')}</label>
            <div className="flex flex-wrap gap-2">
              {(dealTypeOptions.length ? dealTypeOptions : PROPERTY_DEAL_TYPES).map((item) => {
                const active = form.dealTypes.includes(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => upd('dealTypes', active ? form.dealTypes.filter((value) => value !== item.value) : [...form.dealTypes, item.value])}
                    className={`px-3 py-2 rounded-xl text-sm border transition ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            {errors.dealTypes && <p className="text-xs text-destructive mt-1">{errors.dealTypes}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.address')} *</label>
              <input value={form.address} onChange={(e) => upd('address', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.address ? 'border-destructive/60' : 'border-border'}`} />
              {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('settings.district')}</label>
              <select value={form.district} onChange={(e) => upd('district', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                <option value="">{t('common.notSelected')}</option>
                {districtSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.rooms')}</label>
              <input type="number" value={form.rooms} onChange={(e) => upd('rooms', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.area')} (м²)</label>
              <input type="number" value={form.area} onChange={(e) => upd('area', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.price')} *</label>
              <input type="number" value={form.price} onChange={(e) => upd('price', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.price ? 'border-destructive/60' : 'border-border'}`} />
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.currency')}</label>
            <select
              value={form.currency}
              onChange={(e) => upd('currency', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm"
            >
              {currencySelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('properties.form.paymentCondition')}</label>
              <select value={form.paymentCondition} onChange={(e) => upd('paymentCondition', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                <option value="">{t('common.notSelected')}</option>
                {paymentConditionSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-6 pt-7">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => upd('isPublished', e.target.checked)} />
                <span>{t('properties.form.isPublished')}</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => upd('isFeatured', e.target.checked)} />
                <span>{t('properties.form.isFeatured')}</span>
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('properties.form.publicationNotes')}</label>
            <textarea rows={3} value={form.publicationNotes} onChange={(e) => upd('publicationNotes', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-sm font-medium block">{t('properties.publications.label')}</label>
                <p className="text-xs text-muted-foreground mt-1">{t('properties.publications.hint')}</p>
              </div>
              <button type="button" onClick={addPublication} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/20 text-sm font-medium hover:bg-muted transition">
                <Plus className="w-4 h-4" />
                {t('properties.publications.add')}
              </button>
            </div>
            {publications.length ? (
              <div className="space-y-3">
                {publications.map((publication) => (
                  <div key={publication.key} className="rounded-2xl border border-border bg-muted/10 p-3 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium">{publication.channel || t('properties.publications.newItem')}</p>
                      <button type="button" onClick={() => removePublication(publication.key)} className="shrink-0 rounded-full p-2 hover:bg-muted" aria-label={t('properties.publications.remove')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t('properties.publications.channel')}</label>
                        <select value={publication.channel} onChange={(e) => updatePublicationField(publication.key, 'channel', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
                          <option value="">{t('common.notSelected')}</option>
                          {publicationChannelSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t('properties.publications.status')}</label>
                        <select value={publication.status} onChange={(e) => updatePublicationField(publication.key, 'status', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
                          <option value="">{t('common.notSelected')}</option>
                          {publicationStatusSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">URL</label>
                        <input value={publication.url} onChange={(e) => updatePublicationField(publication.key, 'url', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t('properties.publications.note')}</label>
                        <input value={publication.note} onChange={(e) => updatePublicationField(publication.key, 'note', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t('properties.publications.publishedAt')}</label>
                        <input type="datetime-local" value={publication.publishedAt} onChange={(e) => updatePublicationField(publication.key, 'publishedAt', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t('properties.publications.lastSyncedAt')}</label>
                        <input type="datetime-local" value={publication.lastSyncedAt} onChange={(e) => updatePublicationField(publication.key, 'lastSyncedAt', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground bg-muted/10">
                {t('properties.publications.empty')}
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">{t('properties.form.communicationTypes')}</label>
            <div className="flex flex-wrap gap-2">
              {communicationTypeOptions.map((item) => {
                const active = form.communicationTypes.includes(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => toggleArrayValue('communicationTypes', item.value)}
                    className={`px-3 py-2 rounded-xl text-sm border transition ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">{t('properties.form.tags')}</label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((item) => {
                const active = form.tags.includes(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => toggleArrayValue('tags', item.value)}
                    className={`px-3 py-2 rounded-xl text-sm border transition ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          {showBuildingSpecificFields ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('properties.form.realEstateClass')}</label>
                <select value={form.realEstateClass} onChange={(e) => upd('realEstateClass', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                  <option value="">{t('common.notSelected')}</option>
                  {realEstateClassSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              {isCommercialType ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('properties.form.commercialPurpose')}</label>
                  <select value={form.commercialPurpose} onChange={(e) => upd('commercialPurpose', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                    <option value="">{t('common.notSelected')}</option>
                    {commercialPurposeSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
              ) : <div />}
            </div>
          ) : null}
          {(showBuildingSpecificFields || showLandArea) ? (
            <div className="grid grid-cols-2 gap-4">
              {isResidentialType ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('properties.form.bedrooms')}</label>
                  <input type="number" value={form.bedrooms} onChange={(e) => upd('bedrooms', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.bedrooms ? 'border-destructive/60' : 'border-border'}`} />
                  {errors.bedrooms && <p className="text-xs text-destructive mt-1">{errors.bedrooms}</p>}
                </div>
              ) : <div />}
              {(isResidentialType || isCommercialType) ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('properties.form.bathrooms')}</label>
                  <input type="number" value={form.bathrooms} onChange={(e) => upd('bathrooms', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.bathrooms ? 'border-destructive/60' : 'border-border'}`} />
                  {errors.bathrooms && <p className="text-xs text-destructive mt-1">{errors.bathrooms}</p>}
                </div>
              ) : <div />}
              {showLandArea ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('properties.form.landArea')} (м²)</label>
                  <input type="number" value={form.landArea} onChange={(e) => upd('landArea', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.landArea ? 'border-destructive/60' : 'border-border'}`} />
                  {errors.landArea && <p className="text-xs text-destructive mt-1">{errors.landArea}</p>}
                </div>
              ) : <div />}
              {showParkingFields ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('properties.form.parkingSpaces')}</label>
                  <input type="number" value={form.parkingSpaces} onChange={(e) => upd('parkingSpaces', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.parkingSpaces ? 'border-destructive/60' : 'border-border'}`} />
                  {errors.parkingSpaces && <p className="text-xs text-destructive mt-1">{errors.parkingSpaces}</p>}
                </div>
              ) : <div />}
              {showBuildingSpecificFields ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('properties.form.parkingType')}</label>
                  <select value={form.parkingType} onChange={(e) => upd('parkingType', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                    <option value="">{t('common.notSelected')}</option>
                    {parkingTypeSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
              ) : <div />}
              {showBuildingSpecificFields ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('properties.form.yearBuilt')}</label>
                  <input type="number" value={form.yearBuilt} onChange={(e) => upd('yearBuilt', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.yearBuilt ? 'border-destructive/60' : 'border-border'}`} />
                  {errors.yearBuilt && <p className="text-xs text-destructive mt-1">{errors.yearBuilt}</p>}
                </div>
              ) : <div />}
              {showBuildingSpecificFields ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('properties.form.ceilingHeight')} (м)</label>
                  <input type="number" step="0.1" value={form.ceilingHeight} onChange={(e) => upd('ceilingHeight', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.ceilingHeight ? 'border-destructive/60' : 'border-border'}`} />
                  {errors.ceilingHeight && <p className="text-xs text-destructive mt-1">{errors.ceilingHeight}</p>}
                </div>
              ) : <div />}
            </div>
          ) : null}
          {isResidentialType ? (
            <div className="grid grid-cols-2 gap-4">
              {showLayout ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('properties.form.layoutType')}</label>
                  <select value={form.layoutType} onChange={(e) => upd('layoutType', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                    <option value="">{t('common.notSelected')}</option>
                    {layoutSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
              ) : <div />}
              <div>
                <label className="text-sm font-medium mb-1 block">{t('properties.form.repairType')}</label>
                <select value={form.repairType} onChange={(e) => upd('repairType', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                  <option value="">{t('common.notSelected')}</option>
                  {repairSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('properties.form.heatingType')}</label>
                <select value={form.heatingType} onChange={(e) => upd('heatingType', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                  <option value="">{t('common.notSelected')}</option>
                  {heatingSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('properties.form.wallType')}</label>
                <select value={form.wallType} onChange={(e) => upd('wallType', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                  <option value="">{t('common.notSelected')}</option>
                  {wallSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.floor')}</label>
              <input type="number" value={form.floor} onChange={(e) => upd('floor', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.floor ? 'border-destructive/60' : 'border-border'}`} />
              {errors.floor && <p className="text-xs text-destructive mt-1">{errors.floor}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.totalFloors')}</label>
              <input type="number" value={form.totalFloors} onChange={(e) => upd('totalFloors', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.description')}</label>
            <textarea rows={3} value={form.description} onChange={(e) => upd('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('properties.form.managerComment')}</label>
            <textarea rows={3} value={form.managerComment} onChange={(e) => upd('managerComment', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('properties.form.internalDescription')}</label>
            <textarea rows={4} value={form.internalDescription} onChange={(e) => upd('internalDescription', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('properties.form.publicDescription')}</label>
            <textarea rows={4} value={form.publicDescription} onChange={(e) => upd('publicDescription', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-sm font-medium block">{t('properties.documents.label')}</label>
                <p className="text-xs text-muted-foreground mt-1">{t('properties.documents.hint')}</p>
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/20 text-sm font-medium cursor-pointer hover:bg-muted transition">
                <ImagePlus className="w-4 h-4" />
                {t('properties.documents.add')}
                <input type="file" multiple className="hidden" onChange={handleDocumentSelect} disabled={saving || preparingPhotos} />
              </label>
            </div>
            {documents.length ? (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div key={document.key} className="rounded-2xl border border-border bg-muted/10 p-3 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <a href={document.url} target="_blank" rel="noreferrer" className="min-w-0 text-sm font-medium text-primary hover:underline truncate">
                        {document.title}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDocumentRemove(document.key)}
                        className="shrink-0 rounded-full p-2 hover:bg-muted"
                        aria-label={t('properties.documents.remove')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t('properties.documents.title')}</label>
                        <input value={document.title} onChange={(e) => updateDocumentField(document.key, 'title', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t('properties.documents.type')}</label>
                        <select value={document.documentType} onChange={(e) => updateDocumentField(document.key, 'documentType', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
                          <option value="">{t('common.notSelected')}</option>
                          {documentTypeSelectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground bg-muted/10">
                {t('properties.documents.empty')}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-sm font-medium block">{t('properties.media.label')}</label>
                <p className="text-xs text-muted-foreground mt-1">{t('properties.media.hint')}</p>
              </div>
              <button type="button" onClick={addMediaLink} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/20 text-sm font-medium hover:bg-muted transition">
                <Plus className="w-4 h-4" />
                {t('properties.media.add')}
              </button>
            </div>
            {mediaLinks.length ? (
              <div className="space-y-3">
                {mediaLinks.map((media) => (
                  <div key={media.key} className="rounded-2xl border border-border bg-muted/10 p-3 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium">{media.title || t('properties.media.newItem')}</p>
                      <button type="button" onClick={() => removeMediaLink(media.key)} className="shrink-0 rounded-full p-2 hover:bg-muted" aria-label={t('properties.media.remove')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t('properties.media.title')}</label>
                        <input value={media.title} onChange={(e) => updateMediaLinkField(media.key, 'title', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t('properties.media.type')}</label>
                        <select value={media.mediaType} onChange={(e) => updateMediaLinkField(media.key, 'mediaType', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
                          <option value="">{t('common.notSelected')}</option>
                          {mediaTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">URL</label>
                        <input value={media.url} onChange={(e) => updateMediaLinkField(media.key, 'url', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground bg-muted/10">
                {t('properties.media.empty')}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-sm font-medium block">{t('properties.photos.label')}</label>
                <p className="text-xs text-muted-foreground mt-1">{t('properties.photos.hint')}</p>
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/20 text-sm font-medium cursor-pointer hover:bg-muted transition">
                {preparingPhotos ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                {preparingPhotos ? t('properties.photos.processing') : t('properties.photos.add')}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} disabled={saving || preparingPhotos} />
              </label>
            </div>
            {photos.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div key={photo.key} className="relative overflow-hidden rounded-2xl border border-border bg-muted/20 aspect-[4/3]">
                    <img src={photo.url} alt={form.title || t('properties.title')} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handlePhotoRemove(photo.key)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/75 transition"
                      aria-label={t('properties.photos.remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {photo.isLocal ? (
                      <span className="absolute left-2 bottom-2 rounded-full bg-card/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
                        WEBP
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground bg-muted/10">
                {t('properties.photos.empty')}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleCancel} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted">{t('common.cancel')}</button>
            <button type="submit" disabled={saving || preparingPhotos}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
