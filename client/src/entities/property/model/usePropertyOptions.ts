'use client';

import { useEffect, useMemo, useState } from 'react';
import { PROPERTY_DEAL_TYPES, PROPERTY_STATUSES, PROPERTY_TYPES } from '@/shared/lib/constants';

type DictionaryItem = { value?: string; label?: string };
export type PropertyOption = { value: string; label: string; color?: string };

async function loadDictionary(category: string): Promise<DictionaryItem[]> {
  const response = await fetch(`/api/dictionaries?category=${category}`);
  if (!response.ok) throw new Error('Failed to load dictionaries');
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

function mapFallbackTypes(t: (key: string) => string): PropertyOption[] {
  return PROPERTY_TYPES.map((item) => ({
    value: item.value,
    label: t(`const.propertyType.${item.value}`) || item.label || item.value,
  }));
}

function mapFallbackStatuses(t: (key: string) => string): PropertyOption[] {
  return PROPERTY_STATUSES.map((item) => ({
    value: item.value,
    label: t(`const.propertyStatus.${item.value}`) || item.label || item.value,
    color: item.color,
  }));
}

function mapFallbackDealTypes(t: (key: string) => string): PropertyOption[] {
  return PROPERTY_DEAL_TYPES.map((item) => ({
    value: item.value,
    label: item.value === 'sale' ? t('leads.dialog.needSell') : item.value === 'rent' ? t('leads.dialog.needRent') : item.label || item.value,
  }));
}

function toOptions(items: DictionaryItem[]): PropertyOption[] {
  return items
    .filter((item): item is { value: string; label: string } => Boolean(item?.value && item?.label))
    .map((item) => ({ value: item.value, label: item.label }));
}

export function usePropertyOptions(t: (key: string) => string) {
  const [typeItems, setTypeItems] = useState<PropertyOption[]>([]);
  const [statusItems, setStatusItems] = useState<PropertyOption[]>([]);
  const [dealTypeItems, setDealTypeItems] = useState<PropertyOption[]>([]);
  const [currencyItems, setCurrencyItems] = useState<PropertyOption[]>([]);
  const [districtItems, setDistrictItems] = useState<PropertyOption[]>([]);
  const [sourceItems, setSourceItems] = useState<PropertyOption[]>([]);
  const [layoutTypeItems, setLayoutTypeItems] = useState<PropertyOption[]>([]);
  const [repairTypeItems, setRepairTypeItems] = useState<PropertyOption[]>([]);
  const [heatingTypeItems, setHeatingTypeItems] = useState<PropertyOption[]>([]);
  const [wallTypeItems, setWallTypeItems] = useState<PropertyOption[]>([]);
  const [documentTypeItems, setDocumentTypeItems] = useState<PropertyOption[]>([]);
  const [realEstateClassItems, setRealEstateClassItems] = useState<PropertyOption[]>([]);
  const [commercialPurposeItems, setCommercialPurposeItems] = useState<PropertyOption[]>([]);
  const [parkingTypeItems, setParkingTypeItems] = useState<PropertyOption[]>([]);
  const [paymentConditionItems, setPaymentConditionItems] = useState<PropertyOption[]>([]);
  const [communicationTypeItems, setCommunicationTypeItems] = useState<PropertyOption[]>([]);
  const [mediaTypeItems, setMediaTypeItems] = useState<PropertyOption[]>([]);
  const [tagItems, setTagItems] = useState<PropertyOption[]>([]);
  const [publicationChannelItems, setPublicationChannelItems] = useState<PropertyOption[]>([]);
  const [publicationStatusItems, setPublicationStatusItems] = useState<PropertyOption[]>([]);

  const fallbackTypes = useMemo(() => mapFallbackTypes(t), [t]);
  const fallbackStatuses = useMemo(() => mapFallbackStatuses(t), [t]);
  const fallbackDealTypes = useMemo(() => mapFallbackDealTypes(t), [t]);

  useEffect(() => {
    let active = true;

    Promise.all([
      loadDictionary('property_type').catch(() => []),
      loadDictionary('property_status').catch(() => []),
      loadDictionary('property_deal_type').catch(() => []),
      loadDictionary('currency').catch(() => []),
      loadDictionary('district').catch(() => []),
      loadDictionary('object_source').catch(() => []),
      loadDictionary('layout_type').catch(() => []),
      loadDictionary('repair_type').catch(() => []),
      loadDictionary('heating_type').catch(() => []),
      loadDictionary('wall_type').catch(() => []),
      loadDictionary('document_type').catch(() => []),
      loadDictionary('real_estate_class').catch(() => []),
      loadDictionary('commercial_purpose').catch(() => []),
      loadDictionary('parking_type').catch(() => []),
      loadDictionary('payment_condition').catch(() => []),
      loadDictionary('communication_type').catch(() => []),
      loadDictionary('media_type').catch(() => []),
      loadDictionary('tag').catch(() => []),
      loadDictionary('publication_channel').catch(() => []),
      loadDictionary('publication_status').catch(() => []),
    ]).then(([
      types,
      statuses,
      dealTypes,
      currencies,
      districts,
      sources,
      layouts,
      repairs,
      heating,
      walls,
      documentTypes,
      realEstateClasses,
      commercialPurposes,
      parkingTypes,
      paymentConditions,
      communicationTypes,
      mediaTypes,
      tags,
      publicationChannels,
      publicationStatuses,
    ]) => {
      if (!active) return;
      setTypeItems(toOptions(types));
      setStatusItems(toOptions(statuses));
      setDealTypeItems(toOptions(dealTypes));
      setCurrencyItems(toOptions(currencies));
      setDistrictItems(toOptions(districts));
      setSourceItems(toOptions(sources));
      setLayoutTypeItems(toOptions(layouts));
      setRepairTypeItems(toOptions(repairs));
      setHeatingTypeItems(toOptions(heating));
      setWallTypeItems(toOptions(walls));
      setDocumentTypeItems(toOptions(documentTypes));
      setRealEstateClassItems(toOptions(realEstateClasses));
      setCommercialPurposeItems(toOptions(commercialPurposes));
      setParkingTypeItems(toOptions(parkingTypes));
      setPaymentConditionItems(toOptions(paymentConditions));
      setCommunicationTypeItems(toOptions(communicationTypes));
      setMediaTypeItems(toOptions(mediaTypes));
      setTagItems(toOptions(tags));
      setPublicationChannelItems(toOptions(publicationChannels));
      setPublicationStatusItems(toOptions(publicationStatuses));
    });

    return () => {
      active = false;
    };
  }, []);

  const statusColorMap = useMemo(() => {
    const map = new Map<string, string>();
    fallbackStatuses.forEach((item) => {
      if (item.color) map.set(item.value, item.color);
    });
    return map;
  }, [fallbackStatuses]);

  const typeOptions = typeItems.length > 0 ? typeItems : fallbackTypes;
  const statusOptions = (statusItems.length > 0 ? statusItems : fallbackStatuses).map((item) => ({
    ...item,
    color: item.color || statusColorMap.get(item.value) || '#72BF78',
  }));
  const dealTypeOptions = dealTypeItems.length > 0 ? dealTypeItems : fallbackDealTypes;
  const currencyOptions = currencyItems.length > 0 ? currencyItems : [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'UAH', label: 'UAH' },
  ];
  const districtOptions = districtItems;
  const sourceOptions = sourceItems;
  const layoutTypeOptions = layoutTypeItems;
  const repairTypeOptions = repairTypeItems;
  const heatingTypeOptions = heatingTypeItems;
  const wallTypeOptions = wallTypeItems;
  const documentTypeOptions = documentTypeItems;
  const realEstateClassOptions = realEstateClassItems;
  const commercialPurposeOptions = commercialPurposeItems;
  const parkingTypeOptions = parkingTypeItems;
  const paymentConditionOptions = paymentConditionItems;
  const communicationTypeOptions = communicationTypeItems;
  const mediaTypeOptions = mediaTypeItems;
  const tagOptions = tagItems;
  const publicationChannelOptions = publicationChannelItems;
  const publicationStatusOptions = publicationStatusItems;

  return {
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
  };
}
