'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPropertyProfile, usePropertyOptions, type PropertyProfile } from '@/entities/property';
import { useShowingStatusOptions } from '@/entities/showing';
import { formatPrice } from '@/shared/lib/format';
import { useTranslation } from '@/shared/lib/i18n/context';

function normalizeAction(action: string, t: (key: string) => string) {
  const normalized = action.toLowerCase();
  if (normalized === 'price_change') return t('properties.preview.activity.priceChange');
  if (normalized === 'create') return t('properties.preview.activity.create');
  if (normalized === 'update') return t('properties.preview.activity.update');
  if (normalized === 'delete') return t('properties.preview.activity.delete');
  return t('properties.preview.activity.other');
}

type RiskLevel = 'high' | 'medium';

type RiskItem = {
  key: string;
  message: string;
  level: RiskLevel;
  action: string;
  href: string;
};

export function PropertyProfilePage({ propertyId }: { propertyId: string }) {
  const { t } = useTranslation();
  const {
    typeOptions,
    statusOptions,
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
  const showingStatusOptions = useShowingStatusOptions(t);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [profile, setProfile] = useState<PropertyProfile | null>(null);
  const [dealStageFilter, setDealStageFilter] = useState('all');
  const [showingStatusFilter, setShowingStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    getPropertyProfile(propertyId)
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setProfile(null);
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [propertyId]);

  const typeLabel = useMemo(() => {
    const type = profile?.type;
    if (!type) return '-';
    return typeOptions.find((item) => item.value === type)?.label || type;
  }, [profile?.type, typeOptions]);

  const statusLabel = useMemo(() => {
    const value = profile?.status;
    if (!value) return '-';
    return statusOptions.find((item) => item.value === value)?.label || value;
  }, [profile?.status, statusOptions]);

  const detailItems = useMemo(() => {
    if (!profile) return [];

    const getLabel = (items: Array<{ value: string; label: string }>, value?: string | null) => {
      if (!value) return null;
      return items.find((item) => item.value === value)?.label || value;
    };

    return [
      { key: 'internalCode', label: t('properties.form.internalCode'), value: profile.internalCode || null },
      { key: 'district', label: t('settings.district'), value: getLabel(districtOptions, profile.district) || profile.district || null },
      { key: 'city', label: t('common.city'), value: profile.city || null },
      { key: 'source', label: t('properties.form.source'), value: getLabel(sourceOptions, profile.source) },
      { key: 'realEstateClass', label: t('properties.form.realEstateClass'), value: getLabel(realEstateClassOptions, profile.realEstateClass) },
      { key: 'commercialPurpose', label: t('properties.form.commercialPurpose'), value: getLabel(commercialPurposeOptions, profile.commercialPurpose) },
      { key: 'parkingType', label: t('properties.form.parkingType'), value: getLabel(parkingTypeOptions, profile.parkingType) },
      { key: 'paymentCondition', label: t('properties.form.paymentCondition'), value: getLabel(paymentConditionOptions, profile.paymentCondition) },
      { key: 'layoutType', label: t('properties.form.layoutType'), value: getLabel(layoutTypeOptions, profile.layoutType) },
      { key: 'repairType', label: t('properties.form.repairType'), value: getLabel(repairTypeOptions, profile.repairType) },
      { key: 'heatingType', label: t('properties.form.heatingType'), value: getLabel(heatingTypeOptions, profile.heatingType) },
      { key: 'wallType', label: t('properties.form.wallType'), value: getLabel(wallTypeOptions, profile.wallType) },
      { key: 'bedrooms', label: t('properties.form.bedrooms'), value: profile.bedrooms != null ? String(profile.bedrooms) : null },
      { key: 'bathrooms', label: t('properties.form.bathrooms'), value: profile.bathrooms != null ? String(profile.bathrooms) : null },
      { key: 'parkingSpaces', label: t('properties.form.parkingSpaces'), value: profile.parkingSpaces != null ? String(profile.parkingSpaces) : null },
      { key: 'yearBuilt', label: t('properties.form.yearBuilt'), value: profile.yearBuilt != null ? String(profile.yearBuilt) : null },
      { key: 'ceilingHeight', label: t('properties.form.ceilingHeight'), value: profile.ceilingHeight != null ? `${profile.ceilingHeight} m` : null },
      { key: 'landArea', label: t('properties.form.landArea'), value: profile.landArea != null ? `${profile.landArea} m²` : null },
    ].filter((item): item is { key: string; label: string; value: string } => Boolean(item.value));
  }, [commercialPurposeOptions, districtOptions, heatingTypeOptions, layoutTypeOptions, parkingTypeOptions, paymentConditionOptions, profile, realEstateClassOptions, repairTypeOptions, sourceOptions, t, wallTypeOptions]);

  const publicationChips = useMemo(() => {
    if (!profile) return [] as string[];
    const chips: string[] = [];
    if (profile.isPublished) chips.push(t('properties.profile.published'));
    else chips.push(t('properties.profile.unpublished'));
    if (profile.isFeatured) chips.push(t('properties.profile.featured'));
    return chips;
  }, [profile, t]);

  const communicationLabels = useMemo(
    () => (profile?.communicationTypes ?? []).map((value) => communicationTypeOptions.find((item) => item.value === value)?.label || value),
    [communicationTypeOptions, profile?.communicationTypes],
  );

  const tagLabels = useMemo(
    () => (profile?.tags ?? []).map((value) => tagOptions.find((item) => item.value === value)?.label || value),
    [profile?.tags, tagOptions],
  );

  const publicationEntries = useMemo(
    () =>
      (profile?.publications ?? []).map((publication) => ({
        ...publication,
        channelLabel: publicationChannelOptions.find((item) => item.value === publication.channel)?.label || publication.channel,
        statusLabel: publicationStatusOptions.find((item) => item.value === publication.status)?.label || publication.status,
      })),
    [profile?.publications, publicationChannelOptions, publicationStatusOptions],
  );

  const dealStages = useMemo(() => {
    const list = (profile?.deals ?? []).map((item) => item.stage).filter((item): item is string => Boolean(item));
    return Array.from(new Set(list));
  }, [profile?.deals]);

  const filteredDeals = useMemo(() => {
    if (dealStageFilter === 'all') return profile?.deals ?? [];
    return (profile?.deals ?? []).filter((item) => item.stage === dealStageFilter);
  }, [dealStageFilter, profile?.deals]);

  const filteredShowings = useMemo(() => {
    if (showingStatusFilter === 'all') return profile?.showings ?? [];
    return (profile?.showings ?? []).filter((item) => item.status === showingStatusFilter);
  }, [profile?.showings, showingStatusFilter]);

  const showingStatusLabelMap = useMemo(
    () => new Map(showingStatusOptions.map((item) => [item.value, item.label])),
    [showingStatusOptions],
  );

  const riskItems = useMemo(() => {
    const metrics = profile?.metrics;
    const priceStats = profile?.priceStats;
    const activityCount = profile?.activity?.length ?? 0;
    const risks: RiskItem[] = [];

    if (metrics && metrics.showingsUpcoming === 0) {
      risks.push({
        key: 'noUpcomingShowings',
        message: t('properties.profile.risk.noUpcomingShowings'),
        level: 'high',
        action: t('properties.profile.risk.action.scheduleShowing'),
        href: `/showings?propertyId=${propertyId}`,
      });
    }

    if (priceStats && priceStats.daysOnMarket > 30 && priceStats.changesCount <= 1) {
      risks.push({
        key: 'stalePrice',
        message: t('properties.profile.risk.stalePrice'),
        level: 'medium',
        action: t('properties.profile.risk.action.reviewPrice'),
        href: '/properties',
      });
    }

    if (activityCount <= 2) {
      risks.push({
        key: 'lowActivity',
        message: t('properties.profile.risk.lowActivity'),
        level: 'medium',
        action: t('properties.profile.risk.action.addTouchpoint'),
        href: `/showings?propertyId=${propertyId}`,
      });
    }

    risks.sort((a, b) => {
      if (a.level === b.level) return 0;
      return a.level === 'high' ? -1 : 1;
    });

    return risks;
  }, [profile?.activity?.length, profile?.metrics, profile?.priceStats, propertyId, t]);

  const riskLevelLabel = (level: RiskLevel) => {
    if (level === 'high') return t('const.priority.high');
    return t('const.priority.medium');
  };

  const riskLevelClass = (level: RiskLevel) => {
    if (level === 'high') {
      return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';
    }
    return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  };

  if (status === 'loading') {
    return <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">{t('common.loading')}</div>;
  }

  if (!profile || status === 'error') {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">{t('properties.noProperties')}</p>
        <Link href="/properties" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </Link>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.title || t('properties.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{profile.address || '-'}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="rounded-xl border border-border/60 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">{t('common.type')}</p>
            <p className="font-medium">{typeLabel}</p>
          </div>
          <div className="rounded-xl border border-border/60 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">{t('common.status')}</p>
            <p className="font-medium">{statusLabel}</p>
          </div>
          <div className="rounded-xl border border-border/60 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">{t('properties.preview.currentPrice')}</p>
            <p className="font-medium">{formatPrice(profile.price ?? 0, profile.currency ?? 'USD')}</p>
          </div>
          <div className="rounded-xl border border-border/60 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">{t('properties.preview.priceChanges')}</p>
            <p className="font-medium">{profile.priceStats?.changesCount ?? 0}</p>
          </div>
        </div>

        {detailItems.length ? (
          <div className="space-y-2">
            <h2 className="text-base font-semibold">{t('properties.profile.characteristics')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
              {detailItems.map((item) => (
                <div key={item.key} className="rounded-xl border border-border/60 px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {publicationChips.length || profile.publicationNotes || communicationLabels.length || tagLabels.length || publicationEntries.length ? (
          <div className="space-y-2">
            <h2 className="text-base font-semibold">{t('properties.profile.publication')}</h2>
            {publicationChips.length ? (
              <div className="flex flex-wrap gap-2">
                {publicationChips.map((item) => (
                  <span key={item} className="rounded-full border border-border bg-muted/20 px-3 py-1 text-xs font-medium">{item}</span>
                ))}
              </div>
            ) : null}
            {communicationLabels.length ? (
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t('properties.form.communicationTypes')}</p>
                <div className="flex flex-wrap gap-2">
                  {communicationLabels.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-background px-3 py-1 text-xs">{item}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {tagLabels.length ? (
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t('properties.form.tags')}</p>
                <div className="flex flex-wrap gap-2">
                  {tagLabels.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-background px-3 py-1 text-xs">{item}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {profile.publicationNotes ? <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.publicationNotes}</p> : null}
            {publicationEntries.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {publicationEntries.map((publication) => (
                  <div key={publication.id ?? `${publication.channel}-${publication.status}-${publication.url ?? ''}`} className="rounded-xl border border-border/60 px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{publication.channelLabel}</p>
                        <p className="text-xs text-muted-foreground mt-1">{publication.statusLabel}</p>
                        {publication.publishedAt ? <p className="text-xs text-muted-foreground mt-1">{t('properties.publications.publishedAt')}: {new Date(publication.publishedAt).toLocaleString()}</p> : null}
                        {publication.lastSyncedAt ? <p className="text-xs text-muted-foreground mt-1">{t('properties.publications.lastSyncedAt')}: {new Date(publication.lastSyncedAt).toLocaleString()}</p> : null}
                        {publication.note ? <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{publication.note}</p> : null}
                      </div>
                      {publication.url ? (
                        <a href={publication.url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-medium text-primary hover:underline">
                          {t('properties.publications.open')}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {profile.publicDescription ? (
          <div className="space-y-1 rounded-xl border border-border/60 px-3 py-3">
            <h2 className="text-sm font-semibold">{t('properties.form.publicDescription')}</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.publicDescription}</p>
          </div>
        ) : null}

        {profile.ownerName || profile.ownerPhone || profile.developerName || profile.developerContact ? (
          <div className="space-y-2">
            <h2 className="text-base font-semibold">{t('properties.profile.contacts')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.ownerName || profile.ownerPhone ? (
                <div className="space-y-1 rounded-xl border border-border/60 px-3 py-3">
                  <h3 className="text-sm font-semibold">{t('properties.profile.owner')}</h3>
                  {profile.ownerName ? <p className="text-sm">{profile.ownerName}</p> : null}
                  {profile.ownerPhone ? <p className="text-sm text-muted-foreground">{profile.ownerPhone}</p> : null}
                </div>
              ) : null}
              {profile.developerName || profile.developerContact ? (
                <div className="space-y-1 rounded-xl border border-border/60 px-3 py-3">
                  <h3 className="text-sm font-semibold">{t('properties.profile.developer')}</h3>
                  {profile.developerName ? <p className="text-sm">{profile.developerName}</p> : null}
                  {profile.developerContact ? <p className="text-sm text-muted-foreground">{profile.developerContact}</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {profile.internalDescription || profile.managerComment ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.internalDescription ? (
              <div className="space-y-1 rounded-xl border border-border/60 px-3 py-3">
                <h2 className="text-sm font-semibold">{t('properties.form.internalDescription')}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.internalDescription}</p>
              </div>
            ) : null}
            {profile.managerComment ? (
              <div className="space-y-1 rounded-xl border border-border/60 px-3 py-3">
                <h2 className="text-sm font-semibold">{t('properties.form.managerComment')}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.managerComment}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {(profile.documents ?? []).length ? (
          <div className="space-y-2">
            <h2 className="text-base font-semibold">{t('properties.profile.documents')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(profile.documents ?? []).map((document) => (
                <div key={document.id ?? document.cloudStoragePath} className="rounded-xl border border-border/60 px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{document.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {document.documentType ? documentTypeOptions.find((item) => item.value === document.documentType)?.label || document.documentType : t('common.notSelected')}
                      </p>
                    </div>
                    {document.url ? (
                      <a href={document.url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-medium text-primary hover:underline">
                        {t('properties.profile.openDocument')}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {(profile.mediaLinks ?? []).length ? (
          <div className="space-y-2">
            <h2 className="text-base font-semibold">{t('properties.profile.media')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(profile.mediaLinks ?? []).map((media) => (
                <div key={media.id ?? `${media.mediaType ?? 'media'}-${media.url}`} className="rounded-xl border border-border/60 px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{media.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {media.mediaType ? mediaTypeOptions.find((item) => item.value === media.mediaType)?.label || media.mediaType : t('common.notSelected')}
                      </p>
                    </div>
                    <a href={media.url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-medium text-primary hover:underline">
                      {t('properties.profile.openMedia')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <h2 className="text-base font-semibold">{t('properties.profile.risks')}</h2>
          {riskItems.length ? (
            <div className="space-y-2">
              {riskItems.map((risk) => (
                <div key={risk.key} className="rounded-xl border border-border/60 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{risk.message}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${riskLevelClass(risk.level)}`}>
                      {riskLevelLabel(risk.level)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{risk.action}</p>
                    <Link
                      href={risk.href}
                      className="shrink-0 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-medium hover:bg-muted"
                    >
                      {t('properties.profile.risk.openAction')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('properties.profile.risk.none')}</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{t('properties.profile.deals')}</h2>
          <div className="flex items-center gap-2">
            <select
              value={dealStageFilter}
              onChange={(event) => setDealStageFilter(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs"
            >
              <option value="all">{t('common.all')}</option>
              {dealStages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <Link href="/deals" className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted">
              {t('properties.profile.openDeals')}
            </Link>
          </div>
        </div>
        {filteredDeals.length ? (
          filteredDeals.slice(0, 12).map((item) => (
            <div key={item.id} className="rounded-lg border border-border/60 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <Link href={`/deals/${item.id}`} className="text-sm font-medium truncate hover:underline">
                  {item.title}
                </Link>
                <p className="text-xs text-muted-foreground">{item.stage || '-'}</p>
              </div>
              {item.amount ? <p className="text-xs text-muted-foreground mt-1">{formatPrice(item.amount, item.currency ?? 'USD')}</p> : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{t('properties.preview.emptyDeals')}</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{t('properties.profile.showings')}</h2>
          <div className="flex items-center gap-2">
            <select
              value={showingStatusFilter}
              onChange={(event) => setShowingStatusFilter(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs"
            >
              <option value="all">{t('common.all')}</option>
              {showingStatusOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <Link href={`/showings?propertyId=${profile.id}`} className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted">
              {t('properties.profile.openShowings')}
            </Link>
          </div>
        </div>
        {filteredShowings.length ? (
          filteredShowings.slice(0, 12).map((item) => (
            <div key={item.id} className="rounded-lg border border-border/60 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{new Date(item.scheduledAt).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{showingStatusLabelMap.get(item.status) || item.status}</p>
              </div>
              {item.lead ? (
                <p className="text-xs text-muted-foreground mt-1">{`${item.lead.firstName ?? ''} ${item.lead.lastName ?? ''}`.trim()}</p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{t('properties.preview.emptyShowings')}</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">{t('properties.preview.activityTab')}</h2>
        {(profile.activity ?? []).length ? (
          (profile.activity ?? []).slice(0, 15).map((item) => (
            <div key={item.id} className="rounded-lg border border-border/60 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{normalizeAction(item.action, t)}</p>
                <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              {item.details ? <p className="text-xs text-muted-foreground mt-1">{item.details}</p> : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{t('properties.preview.emptyActivity')}</p>
        )}
      </section>
    </div>
  );
}
