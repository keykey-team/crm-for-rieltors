'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Key, Users, User, Shield, Plus, Edit2, Trash2, X, Workflow, Book, Upload, Target, Heart, Camera, HelpCircle, Send, GripVertical, Palette, ImagePlus, RotateCcw, Sun, Moon, Monitor, Sparkles, GlassWater, Settings, Lock, Check, ShieldCheck } from 'lucide-react';
import { PROTECTED_STAGES, STAGE_GROUPS } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { confirmAction } from '@/shared/lib/confirm-action';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/shared/lib/i18n/context';
import { useHints } from '@/shared/lib/hints-context';
import { usePlan } from '@/shared/lib/plan-context';
import { useBrand } from '@/shared/lib/brand-context';
import { ROLES_STATIC, TABS_STATIC } from '@/widgets/settings/model/settings-constants';
import {
  createDealCustomField,
  createDictionary,
  createFunnelStage,
  deleteAftercarePlan,
  deleteDealCustomField,
  deleteDictionary,
  deleteDistributionRule,
  deleteFunnelStage,
  deleteTeamUser,
  getAftercarePlans,
  getDealCustomFields,
  getDictionaries,
  getDistributionRules,
  getFunnelStages,
  getProfileSettings,
  getTeamUsers,
  updateBrandSettings,
  updateFunnelStage,
  updateProfileSettings,
  upsertAftercarePlan,
  upsertDistributionRule,
  getUploadPresigned,
  reorderFunnelStages,
  reorderCustomFields,
  reorderDictionaries,
  reorderDistributionRules,
  reorderAftercarePlans,
  updateUserPermissions,
} from '@/entities/settings';

type TabKey = 'profile' | 'users' | 'funnel' | 'customFields' | 'dictionaries' | 'distribution' | 'aftercare' | 'branding';

export function SettingsClient() {
  const { t } = useTranslation();
  const { data: session } = useSession() || {};
  const { hintsEnabled, setHintsEnabled } = useHints();
  const { hasFeature } = usePlan();
  const { brand, refreshBrand } = useBrand();
  const ROLES = ROLES_STATIC.map(r => ({ value: r.value, label: t(r.labelKey), desc: t(r.descKey) }));
  const TABS: { key: TabKey; label: string; icon: any; adminOnly?: boolean; feature?: string }[] = TABS_STATIC.map(tb => ({ ...tb, label: t(tb.labelKey) }));
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [permissionsUser, setPermissionsUser] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [newStage, setNewStage] = useState({ label: '', value: '', color: '#60B5FF' });
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageData, setEditingStageData] = useState({ label: '', color: '' });
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [newField, setNewField] = useState({ name: '', label: '', fieldType: 'text', options: '' });
  const [dictCategory, setDictCategory] = useState('district');
  const [dicts, setDicts] = useState<any[]>([]);
  const [newDict, setNewDict] = useState({ value: '', label: '' });
  const [distRules, setDistRules] = useState<any[]>([]);
  const [showDistDialog, setShowDistDialog] = useState(false);
  const [editingDist, setEditingDist] = useState<any>(null);
  const [aftercarePlans, setAftercarePlans] = useState<any[]>([]);
  const [showAftercareDialog, setShowAftercareDialog] = useState(false);
  const [editingAftercare, setEditingAftercare] = useState<any>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [telegramUrl, setTelegramUrlState] = useState('');
  // Branding state
  const [brandName, setBrandName] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [brandSaving, setBrandSaving] = useState(false);
  const [themeMode, setThemeMode] = useState('light');
  const [sidebarGlass, setSidebarGlass] = useState(false);
  const [sidebarOpacity, setSidebarOpacity] = useState(1);
  const [gradientBg, setGradientBg] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    getProfileSettings()
      .then(d => { setProfile(d); setName(d.name ?? ''); setPhone(d.phone ?? ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
    const savedUrl = localStorage.getItem('crm_telegram_bot_url') ?? '';
    setTelegramUrlState(savedUrl);
  }, []);

  const fetchTabData = useCallback(() => {
    if (activeTab === 'users') {
      getTeamUsers().then(setUsers).catch(() => {});
    } else if (activeTab === 'funnel') {
      getFunnelStages().then(setStages).catch(() => {});
    } else if (activeTab === 'customFields') {
      getDealCustomFields().then(setCustomFields).catch(() => {});
    } else if (activeTab === 'dictionaries') {
      getDictionaries(dictCategory).then(setDicts).catch(() => {});
    } else if (activeTab === 'distribution') {
      getDistributionRules().then(setDistRules).catch(() => {});
      getTeamUsers().then(setUsers).catch(() => {});
    } else if (activeTab === 'aftercare') {
      getAftercarePlans().then(setAftercarePlans).catch(() => {});
    }
  }, [activeTab, dictCategory]);

  useEffect(() => { fetchTabData(); }, [fetchTabData]);

  // Initialize branding fields from brand context when tab opens
  const brandInitRef = useRef(false);
  useEffect(() => {
    if (activeTab === 'branding' && !brandInitRef.current && brand.themeMode !== undefined) {
      setBrandName(brand.brandName ?? '');
      setBrandLogo(brand.brandLogo ?? '');
      setThemeMode(brand.themeMode ?? 'light');
      setSidebarGlass(!!brand.sidebarGlass);
      setSidebarOpacity(brand.sidebarOpacity ?? 1);
      setGradientBg(!!brand.gradientBg);
      brandInitRef.current = true;
    }
    if (activeTab !== 'branding') {
      brandInitRef.current = false;
    }
  }, [activeTab, brand]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfileSettings({ name, phone, ...(newPassword && { newPassword }) });
      toast.success(t('settings.profileSaved'));
      setNewPassword('');
    } catch {
      toast.error(t('settings.saveError'));
    }
    // Save telegram URL to localStorage
    localStorage.setItem('crm_telegram_bot_url', telegramUrl.trim());
    window.dispatchEvent(new Event('telegram-url-updated'));
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const presignData = await getUploadPresigned({ fileName: file.name, contentType: file.type, isPublic: true });
      const uploadUrl = presignData.uploadUrl || presignData.url;
      const storagePath = presignData.cloud_storage_path || presignData.cloudStoragePath;
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type, 'Content-Disposition': 'attachment' }, body: file });
      await updateProfileSettings({ avatar: storagePath });
      setProfile((p: any) => ({ ...p, avatar: storagePath }));
      toast.success(t('settings.photoUpdated'));
    } catch { toast.error(t('settings.uploadError')); }
    setAvatarUploading(false);
  };

  const handleSaveBrand = async () => {
    setBrandSaving(true);
    try {
      await updateBrandSettings({
        brandName: brandName || null,
        brandLogo: brandLogo || null,
        primaryColor: null,
        themeMode,
        sidebarGlass,
        sidebarOpacity,
        gradientBg,
      });
      toast.success(t('settings.brandSaved'));
      refreshBrand();
    } catch { toast.error(t('settings.saveError')); }
    setBrandSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const { uploadUrl, publicUrl } = await getUploadPresigned({ fileName: `brand-logo-${Date.now()}.${file.name.split('.').pop()}`, contentType: file.type, isPublic: true });
      const headers: Record<string, string> = { 'Content-Type': file.type };
      if (uploadUrl.includes('content-disposition')) headers['Content-Disposition'] = 'attachment';
      await fetch(uploadUrl, { method: 'PUT', headers, body: file });
      setBrandLogo(publicUrl);
      toast.success(t('settings.logoUploaded'));
    } catch { toast.error(t('settings.saveError')); }
    setLogoUploading(false);
  };

  const addStage = async () => {
    if (!newStage.label || !newStage.value) { toast.error(t('settings.fillNameValue')); return; }
    await createFunnelStage(newStage);
    setNewStage({ label: '', value: '', color: '#60B5FF' }); fetchTabData(); toast.success(t('settings.stageAdded'));
  };
  const deleteStage = async (id: string) => {
    await deleteFunnelStage(id); fetchTabData(); toast.success(t('settings.deleted'));
  };
  const startEditStage = (s: any) => {
    setEditingStageId(s.id);
    setEditingStageData({ label: s.label, color: s.color });
  };
  const cancelEditStage = () => { setEditingStageId(null); };
  const saveEditStage = async () => {
    if (!editingStageId || !editingStageData.label.trim()) return;
    await updateFunnelStage({ id: editingStageId, label: editingStageData.label, color: editingStageData.color });
    setEditingStageId(null);
    fetchTabData();
    toast.success(t('settings.saved'));
  };

  const addCustomField = async () => {
    if (!newField.name || !newField.label) { toast.error(t('settings.fillFieldName')); return; }
    await createDealCustomField(newField);
    setNewField({ name: '', label: '', fieldType: 'text', options: '' }); fetchTabData(); toast.success(t('settings.fieldAdded'));
  };
  const deleteCustomField = async (id: string) => {
    await deleteDealCustomField(id); fetchTabData();
  };

  const addDictItem = async () => {
    if (!newDict.value || !newDict.label) { toast.error(t('settings.fillFields')); return; }
    await createDictionary({ ...newDict, category: dictCategory });
    setNewDict({ value: '', label: '' }); fetchTabData(); toast.success(t('settings.addedDict'));
  };
  const deleteDictItem = async (id: string) => {
    await deleteDictionary(id); fetchTabData();
  };

  const saveDistRule = async (data: any) => {
    const body = editingDist ? { ...data, id: editingDist.id } : data;
    await upsertDistributionRule(body, !!editingDist);
    setShowDistDialog(false); setEditingDist(null); fetchTabData(); toast.success(t('settings.saved'));
  };
  const deleteDistRule = async (id: string) => {
    await deleteDistributionRule(id); fetchTabData(); toast.success(t('settings.deleted'));
  };

  const saveAftercare = async (data: any) => {
    if (editingAftercare) {
      await upsertAftercarePlan(data, editingAftercare.id);
    } else {
      await upsertAftercarePlan(data);
    }
    setShowAftercareDialog(false); setEditingAftercare(null); fetchTabData(); toast.success(t('settings.saved'));
  };
  const deleteAftercare = async (id: string) => {
    await deleteAftercarePlan(id); fetchTabData(); toast.success(t('settings.deleted'));
  };

  // ─── Drag-and-drop reorder logic ───
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };
  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIdx(idx);
  };

  const reorderList = <T extends { id: string }>(list: T[], fromIdx: number, toIdx: number): T[] => {
    const newList = [...list];
    const [moved] = newList.splice(fromIdx, 1);
    newList.splice(toIdx, 0, moved);
    return newList;
  };

  const handleDropStages = (toIdx: number) => async (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === toIdx) return;
    const reordered = reorderList(stages, dragIdx, toIdx);
    setStages(reordered);
    setDragIdx(null); setDragOverIdx(null);
    await reorderFunnelStages(reordered.map((s, i) => ({ id: s.id, order: i }))); 
  };

  const handleDropCustomFields = (toIdx: number) => async (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === toIdx) return;
    const reordered = reorderList(customFields, dragIdx, toIdx);
    setCustomFields(reordered);
    setDragIdx(null); setDragOverIdx(null);
    await reorderCustomFields(reordered.map((f, i) => ({ id: f.id, order: i }))); 
  };

  const handleDropDicts = (toIdx: number) => async (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === toIdx) return;
    const reordered = reorderList(dicts, dragIdx, toIdx);
    setDicts(reordered);
    setDragIdx(null); setDragOverIdx(null);
    await reorderDictionaries(reordered.map((d, i) => ({ id: d.id, order: i }))); 
  };

  const handleDropDistRules = (toIdx: number) => async (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === toIdx) return;
    const reordered = reorderList(distRules, dragIdx, toIdx);
    setDistRules(reordered);
    setDragIdx(null); setDragOverIdx(null);
    await reorderDistributionRules(reordered.map((r, i) => ({ id: r.id, priority: reordered.length - i }))); 
  };

  const handleDropAftercare = (toIdx: number) => async (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === toIdx) return;
    const reordered = reorderList(aftercarePlans, dragIdx, toIdx);
    setAftercarePlans(reordered);
    setDragIdx(null); setDragOverIdx(null);
    await reorderAftercarePlans(reordered.map((p, i) => ({ id: p.id, order: i }))); 
  };

  const handleSaveUser = async (data: any) => {
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) {
      toast.success(editingUser ? t('settings.updated') : t('settings.created'));
      setShowUserDialog(false); setEditingUser(null); fetchTabData();
    } else { const err = await res.json(); toast.error(err.error ?? t('leads.error')); }
  };

  const handleSavePermissions = async (permissions: string | null) => {
    if (!permissionsUser) return;
    try {
      await updateUserPermissions(permissionsUser.id, permissions);
      toast.success(t('settings.permissionsSaved'));
      setPermissionsUser(null);
      fetchTabData();
    } catch (err: any) {
      toast.error(err?.message ?? t('leads.error'));
    }
  };

  const handleDeleteUser = async (id: string) => {
    const ok = await confirmAction(t('settings.deleteUserConfirm'));
    if (!ok) return;
    await deleteTeamUser(id); toast.success(t('settings.deleted')); fetchTabData();
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>;

  const isAdmin = profile?.role === 'admin';
  const DICT_CATS = [
    {v:'district',l:t('settings.districts')},{v:'property_type',l:t('settings.propertyTypes')},{v:'lead_source',l:t('settings.leadSources')}
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 scroll-tabs pb-1"
        onScroll={e => {
          const el = e.currentTarget;
          el.classList.toggle('scrolled-end', el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
        }}>
        {TABS.filter(tb => {
          if (tb.adminOnly && !isAdmin) return false;
          if ((tb as any).feature && !hasFeature((tb as any).feature)) return false;
          return true;
        }).map(tb => (
          <button key={tb.key} onClick={() => setActiveTab(tb.key as TabKey)}
            className={cn('flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex-shrink-0 active:scale-95',
              activeTab === tb.key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80')}>
            <tb.icon className="w-4 h-4" /> {tb.label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold overflow-hidden">
                  {profile?.avatar ? (
                    <img src={profile.avatar.startsWith('http') ? profile.avatar : `/api/files?path=${encodeURIComponent(profile.avatar)}`} alt="avatar" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (name || 'U')[0]?.toUpperCase()}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <Camera className="w-5 h-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
                </label>
              </div>
              <div>
                <p className="font-semibold text-lg">{name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {ROLES.find(r => r.value === profile?.role)?.label ?? profile?.role}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('settings.name')}</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('settings.phone')}</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-4"><Key className="w-4 h-4 text-muted-foreground" /><h2 className="font-semibold">{t('settings.changePw')}</h2></div>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('settings.newPw')}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          {/* Hints toggle */}
          <div className="bg-card rounded-xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-2"><HelpCircle className="w-4 h-4 text-muted-foreground" /><h2 className="font-semibold">{t('settings.hintsTitle')}</h2></div>
            <p className="text-xs text-muted-foreground mb-4">{t('settings.hintsDesc')}</p>
            <button
              onClick={() => setHintsEnabled(!hintsEnabled)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                hintsEnabled ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
                hintsEnabled ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
            <span className="ml-3 text-sm text-muted-foreground">
              {hintsEnabled ? t('settings.hintsOn') : t('settings.hintsOff')}
            </span>
          </div>

          {/* Telegram assistant */}
          <div className="bg-card rounded-xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-2"><Send className="w-4 h-4 text-muted-foreground" /><h2 className="font-semibold">{t('settings.telegramTitle')}</h2></div>
            <p className="text-xs text-muted-foreground mb-4">{t('settings.telegramDesc')}</p>
            <input
              value={telegramUrl}
              onChange={e => setTelegramUrlState(e.target.value)}
              placeholder={t('settings.telegramPlaceholder')}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {telegramUrl.trim() && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                ✓ {t('settings.telegramActive')}
              </p>
            )}
          </div>

          <button onClick={handleSaveProfile} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? t('common.saving') : t('common.save')}
          </button>

          {/* NBU Rate Widget */}
          <NbuRateWidget t={t} />
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && isAdmin && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditingUser(null); setShowUserDialog(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
              <Plus className="w-4 h-4" /> {t('settings.addUser')}
            </button>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.userName')}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.userEmail')}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.userRole')}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.permissions')}</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('settings.actions')}</th>
              </tr></thead>
              <tbody>{users.map(u => {
                const permsArr = u.permissions ? (() => { try { return JSON.parse(u.permissions); } catch { return null; } })() : null;
                const isFullAccess = !permsArr || u.role === 'admin' || u.role === 'director';
                return (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{u.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><span className={cn('text-xs px-2 py-0.5 rounded-full',
                    u.role === 'admin' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : u.role === 'director' ? 'bg-[#073B34]/10 text-[#073B34] dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  )}>{ROLES.find(r => r.value === u.role)?.label ?? u.role}</span></td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' || u.role === 'director' ? (
                      <span className="text-xs text-muted-foreground">{t('settings.fullAccess')}</span>
                    ) : (
                      <button
                        onClick={() => setPermissionsUser(u)}
                        className={cn('text-xs px-2.5 py-1 rounded-lg transition flex items-center gap-1.5',
                          isFullAccess
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                        )}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {isFullAccess ? t('settings.fullAccess') : `${t('settings.limitedAccess')} (${permsArr?.length ?? 0})`}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1">
                    <button onClick={() => { setEditingUser(u); setShowUserDialog(true); }} className="p-1.5 hover:bg-muted rounded-lg transition"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </div></td>
                </tr>
              );})}</tbody>
            </table>
          </div>
          {showUserDialog && <UserDialog user={editingUser} roles={ROLES} t={t} onSave={handleSaveUser} onClose={() => { setShowUserDialog(false); setEditingUser(null); }} />}
          {permissionsUser && <PermissionsDialog user={permissionsUser} t={t} onSave={handleSavePermissions} onClose={() => setPermissionsUser(null)} />}
        </div>
      )}

      {/* FUNNEL STAGES TAB */}
      {activeTab === 'funnel' && isAdmin && (() => {
        const isProtected = (val: string) => (PROTECTED_STAGES as readonly string[]).includes(val);
        const stagesByGroup = STAGE_GROUPS.map(g => ({
          ...g,
          items: stages.filter(s => (g.stages as readonly string[]).includes(s.value)),
        }));
        const groupedValues = STAGE_GROUPS.flatMap(g => g.stages as readonly string[]);
        const ungrouped = stages.filter(s => !groupedValues.includes(s.value));

        const renderStageRow = (s: any, cardBg: string) => {
          const idx = stages.findIndex((st: any) => st.id === s.id);
          const prot = isProtected(s.value);
          const isEditing = editingStageId === s.id;

          if (isEditing) {
            return (
              <div key={s.id} className={cn('flex items-center gap-2 p-2.5 rounded-xl transition-all border-2 border-primary/30', cardBg)}>
                <div className="relative w-8 h-8 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full border-2 border-border cursor-pointer overflow-hidden" style={{ backgroundColor: editingStageData.color }}>
                    <input type="color" value={editingStageData.color} onChange={e => setEditingStageData(prev => ({ ...prev, color: e.target.value }))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title={t('settings.stageColor')} />
                  </div>
                </div>
                <input value={editingStageData.label} onChange={e => setEditingStageData(prev => ({ ...prev, label: e.target.value }))}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') saveEditStage(); if (e.key === 'Escape') cancelEditStage(); }}
                  className="flex-1 px-2.5 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder={t('settings.stageLabel')} />
                <button onClick={saveEditStage} className="p-1.5 hover:bg-green-500/10 rounded-lg transition active:scale-95" title={t('common.save')}>
                  <Check className="w-4 h-4 text-green-600" />
                </button>
                <button onClick={cancelEditStage} className="p-1.5 hover:bg-muted rounded-lg transition active:scale-95" title={t('common.cancel')}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            );
          }

          return (
            <div key={s.id}
              draggable={!prot}
              onDragStart={prot ? undefined : handleDragStart(idx)}
              onDragEnd={prot ? undefined : handleDragEnd}
              onDragOver={handleDragOver(idx)}
              onDrop={handleDropStages(idx)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-all border border-transparent', cardBg,
                dragOverIdx === idx && dragIdx !== idx && 'ring-2 ring-primary/40 bg-primary/5',
                prot && 'opacity-90'
              )}
            >
              {!prot ? (
                <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab active:cursor-grabbing flex-shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
              )}
              <div className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-white/20" style={{ backgroundColor: s.color }} />
              <span className="text-sm font-medium flex-1">{s.label}</span>
              {prot && (
                <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{t('settings.systemStage')}</span>
              )}
              <button onClick={() => startEditStage(s)} className="p-1.5 hover:bg-primary/10 rounded-lg transition active:scale-95" title={t('common.edit')}>
                <Edit2 className="w-3.5 h-3.5 text-primary/70" />
              </button>
              {!prot && (
                <button onClick={() => deleteStage(s.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition active:scale-95">
                  <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                </button>
              )}
            </div>
          );
        };

        return (
          <div className="space-y-4">
            {stagesByGroup.map(g => g.items.length > 0 && (
              <div key={g.key} className="bg-card rounded-2xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">{t(g.labelKey)}</h3>
                  <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">{g.items.length}</span>
                </div>
                <div className="space-y-1.5">
                  {g.items.map((s: any) => renderStageRow(s, 'bg-muted/30'))}
                </div>
              </div>
            ))}

            {ungrouped.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">{t('settings.stageGroupOther')}</h3>
                  <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">{ungrouped.length}</span>
                </div>
                <div className="space-y-1.5">
                  {ungrouped.map((s: any) => renderStageRow(s, 'bg-muted/30'))}
                </div>
              </div>
            )}

            {/* Add new stage */}
            <div className="bg-card rounded-2xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-sm font-semibold mb-3">{t('settings.addNewStage')}</h3>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">{t('settings.stageLabel')}</label>
                  <input value={newStage.label} onChange={e => setNewStage({...newStage, label: e.target.value, value: e.target.value.toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')})}
                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder={t('settings.newStage')} />
                </div>
                <div className="w-12">
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">{t('settings.stageColor')}</label>
                  <div className="w-10 h-10 p-1 rounded-xl border border-border bg-muted/30 shadow-sm">
                    <input type="color" value={newStage.color} onChange={e => setNewStage({...newStage, color: e.target.value})} className="w-full h-full rounded-lg border-0 bg-transparent cursor-pointer" />
                  </div>
                </div>
                <button onClick={addStage} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition active:scale-95">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CUSTOM FIELDS TAB */}
      {activeTab === 'customFields' && isAdmin && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="font-semibold mb-4">{t('settings.customFieldsTitle')}</h2>
            <div className="space-y-2 mb-4">
              {customFields.map((f, idx) => (
                <div key={f.id}
                  draggable
                  onDragStart={handleDragStart(idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver(idx)}
                  onDrop={handleDropCustomFields(idx)}
                  className={cn(
                    'flex items-center gap-3 p-3 bg-muted/30 rounded-xl transition-all',
                    dragOverIdx === idx && dragIdx !== idx && 'ring-2 ring-primary/40 bg-primary/5'
                  )}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing flex-shrink-0" />
                  <span className="text-sm font-medium flex-1">{f.label}</span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">{f.fieldType}</span>
                  <button onClick={() => deleteCustomField(f.id)} className="p-1 hover:bg-destructive/10 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <input value={newField.label} onChange={e => setNewField({...newField, label: e.target.value, name: e.target.value.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')})}
                  placeholder={t('settings.fieldName')} className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <select value={newField.fieldType} onChange={e => setNewField({...newField, fieldType: e.target.value})}
                  className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="text">{t('settings.fieldText')}</option><option value="number">{t('settings.fieldNumber')}</option><option value="date">{t('settings.fieldDate')}</option>
                  <option value="select">{t('settings.fieldSelect')}</option><option value="checkbox">{t('settings.fieldCheckbox')}</option>
                </select>
                <button onClick={addCustomField} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition active:scale-95">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {newField.fieldType === 'select' && (
                <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 border border-border rounded-xl text-sm focus-within:ring-2 focus-within:ring-primary/20 bg-background">
                  {newField.options.split(',').filter(Boolean).map((opt, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium animate-in fade-in zoom-in-95 duration-150">
                      {opt.trim()}
                      <button type="button" onClick={() => {
                        const opts = newField.options.split(',').filter(Boolean);
                        opts.splice(i, 1);
                        setNewField({...newField, options: opts.join(',')});
                      }} className="hover:bg-primary/20 rounded-full p-0.5 transition">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    placeholder={newField.options ? t('settings.optionsEnterMore') : t('settings.optionsEnter')}
                    className="flex-1 min-w-[120px] py-0.5 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          const existing = newField.options ? newField.options + ',' : '';
                          setNewField({...newField, options: existing + val});
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                      if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && newField.options) {
                        const opts = newField.options.split(',').filter(Boolean);
                        opts.pop();
                        setNewField({...newField, options: opts.join(',')});
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DICTIONARIES TAB */}
      {activeTab === 'dictionaries' && isAdmin && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            {DICT_CATS.map(c => (
              <button key={c.v} onClick={() => setDictCategory(c.v)}
                className={cn('px-4 py-2 rounded-xl text-sm font-medium transition',
                  dictCategory === c.v ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground')}>
                {c.l}
              </button>
            ))}
          </div>
          <div className="bg-card rounded-xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="space-y-2 mb-4">
              {dicts.map((d, idx) => (
                <div key={d.id}
                  draggable
                  onDragStart={handleDragStart(idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver(idx)}
                  onDrop={handleDropDicts(idx)}
                  className={cn(
                    'flex items-center gap-3 p-3 bg-muted/30 rounded-xl transition-all',
                    dragOverIdx === idx && dragIdx !== idx && 'ring-2 ring-primary/40 bg-primary/5'
                  )}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing flex-shrink-0" />
                  <span className="text-sm font-medium flex-1">{d.label}</span>
                  <span className="text-xs text-muted-foreground font-mono">{d.value}</span>
                  <button onClick={() => deleteDictItem(d.id)} className="p-1 hover:bg-destructive/10 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              ))}
              {dicts.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">{t('settings.empty')}</p>}
            </div>
            <div className="flex gap-2">
              <input value={newDict.label} onChange={e => setNewDict({...newDict, label: e.target.value, value: e.target.value.toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')})}
                placeholder={t('settings.dictName')} className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button onClick={addDictItem} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISTRIBUTION TAB */}
      {activeTab === 'distribution' && isAdmin && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditingDist(null); setShowDistDialog(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
              <Plus className="w-4 h-4" /> {t('settings.addRule')}
            </button>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
            {distRules.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6 text-center">{t('settings.noRules')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="w-10"></th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.ruleName')}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.conditions')}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.assignTo')}</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('settings.actions')}</th>
                </tr></thead>
                <tbody>{distRules.map((r, idx) => (
                  <tr key={r.id}
                    draggable
                    onDragStart={handleDragStart(idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver(idx)}
                    onDrop={handleDropDistRules(idx)}
                    className={cn(
                      'border-b border-border last:border-0 transition-all',
                      dragOverIdx === idx && dragIdx !== idx && 'bg-primary/5'
                    )}
                  >
                    <td className="px-2 py-3"><GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing" /></td>
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {[r.source && `${t('settings.source')}: ${r.source}`, r.district && `${t('settings.district')}: ${r.district}`, r.propertyType && `${t('settings.propType')}: ${r.propertyType}`, r.needType && `${t('settings.needType')}: ${r.needType}`].filter(Boolean).join(', ') || t('settings.all')}
                    </td>
                    <td className="px-4 py-3">{r.assignTo?.name ?? '—'}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-1">
                      <button onClick={() => { setEditingDist(r); setShowDistDialog(true); }} className="p-1.5 hover:bg-muted rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteDistRule(r.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
          {showDistDialog && <DistributionDialog rule={editingDist} users={users} t={t} onSave={saveDistRule} onClose={() => { setShowDistDialog(false); setEditingDist(null); }} />}
        </div>
      )}

      {/* AFTERCARE TAB */}
      {activeTab === 'aftercare' && isAdmin && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditingAftercare(null); setShowAftercareDialog(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
              <Plus className="w-4 h-4" /> {t('settings.addPlan')}
            </button>
          </div>
          {aftercarePlans.map((plan, idx) => (
            <div key={plan.id}
              draggable
              onDragStart={handleDragStart(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver(idx)}
              onDrop={handleDropAftercare(idx)}
              className={cn(
                'bg-card rounded-xl border border-border p-5 transition-all',
                dragOverIdx === idx && dragIdx !== idx && 'ring-2 ring-primary/40'
              )}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingAftercare(plan); setShowAftercareDialog(true); }} className="p-1.5 hover:bg-muted rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteAftercare(plan.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                </div>
              </div>
              <div className="space-y-1">
                {plan.steps?.map((step: any) => (
                  <div key={step.id} className="flex items-center gap-3 text-sm py-1.5 px-3 bg-muted/30 rounded-lg">
                    <span className="text-xs font-mono text-muted-foreground w-16">{t('settings.day')} {step.dayOffset}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{step.type}</span>
                    <span className="flex-1">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {aftercarePlans.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t('settings.noPlans')}</p>}
          {showAftercareDialog && <AftercareDialog plan={editingAftercare} t={t} onSave={saveAftercare} onClose={() => { setShowAftercareDialog(false); setEditingAftercare(null); }} />}
        </div>
      )}

      {/* BRANDING TAB */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          {/* ── Theme Mode ── */}
          <div className="bg-card rounded-2xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-primary/10"><Sun className="w-4 h-4 text-primary" /></div>
              <h2 className="font-display font-semibold text-lg">{t('settings.themeTitle')}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{t('settings.themeDesc')}</p>
            <div className="grid grid-cols-3 gap-4 max-w-2xl">
              <button onClick={() => setThemeMode('light')}
                className={cn('relative p-4 rounded-2xl border-2 transition-all text-left group',
                  themeMode === 'light' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40')}>
                <div className="w-full h-20 rounded-xl bg-white border border-gray-200 mb-3 overflow-hidden">
                  <div className="h-5 bg-gray-50 border-b border-gray-200 flex items-center px-2 gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  </div>
                  <div className="flex h-[60px]">
                    <div className="w-8 bg-gray-50 border-r border-gray-200" />
                    <div className="flex-1 p-1.5 space-y-1">
                      <div className="h-1.5 w-3/4 bg-gray-200 rounded" />
                      <div className="h-1.5 w-1/2 bg-gray-100 rounded" />
                      <div className="flex gap-1 mt-1"><div className="h-3 w-6 bg-emerald-200 rounded" /><div className="h-3 w-6 bg-blue-100 rounded" /></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('settings.lightTheme')}</span>
                </div>
                {themeMode === 'light' && <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
              </button>

              <button onClick={() => setThemeMode('dark')}
                className={cn('relative p-4 rounded-2xl border-2 transition-all text-left group',
                  themeMode === 'dark' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40')}>
                <div className="w-full h-20 rounded-xl bg-[#1a1d2e] border border-[#2a2d3e] mb-3 overflow-hidden">
                  <div className="h-5 bg-[#151828] border-b border-[#2a2d3e] flex items-center px-2 gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3a3d4e]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3a3d4e]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3a3d4e]" />
                  </div>
                  <div className="flex h-[60px]">
                    <div className="w-8 bg-[#151828] border-r border-[#2a2d3e]" />
                    <div className="flex-1 p-1.5 space-y-1">
                      <div className="h-1.5 w-3/4 bg-[#2a2d3e] rounded" />
                      <div className="h-1.5 w-1/2 bg-[#232638] rounded" />
                      <div className="flex gap-1 mt-1"><div className="h-3 w-6 bg-emerald-500/40 rounded" /><div className="h-3 w-6 bg-blue-500/20 rounded" /></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('settings.darkTheme')}</span>
                </div>
                {themeMode === 'dark' && <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
              </button>

              <button onClick={() => setThemeMode('system')}
                className={cn('relative p-4 rounded-2xl border-2 transition-all text-left group',
                  themeMode === 'system' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40')}>
                <div className="w-full h-20 rounded-xl overflow-hidden mb-3 flex">
                  <div className="w-1/2 bg-white border-y border-l border-gray-200 rounded-l-xl overflow-hidden">
                    <div className="h-5 bg-gray-50 border-b border-gray-200 flex items-center px-1 gap-0.5">
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                    </div>
                    <div className="p-1 space-y-0.5">
                      <div className="h-1 w-3/4 bg-gray-200 rounded" />
                      <div className="h-1 w-1/2 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="w-1/2 bg-[#1a1d2e] border-y border-r border-[#2a2d3e] rounded-r-xl overflow-hidden">
                    <div className="h-5 bg-[#151828] border-b border-[#2a2d3e] flex items-center px-1 gap-0.5">
                      <div className="w-1 h-1 rounded-full bg-[#3a3d4e]" />
                      <div className="w-1 h-1 rounded-full bg-[#3a3d4e]" />
                    </div>
                    <div className="p-1 space-y-0.5">
                      <div className="h-1 w-3/4 bg-[#2a2d3e] rounded" />
                      <div className="h-1 w-1/2 bg-[#232638] rounded" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('settings.systemTheme')}</span>
                </div>
                {themeMode === 'system' && <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
              </button>
            </div>
          </div>

          {/* ── Visual Effects ── */}
          <div className="bg-card rounded-2xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-[#073B34]/10"><Sparkles className="w-4 h-4 text-[#073B34] dark:text-emerald-400" /></div>
              <h2 className="font-display font-semibold text-lg">{t('settings.visualEffects')}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{t('settings.visualEffectsDesc')}</p>

            <div className="space-y-5">
              {/* Gradient background */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#073B34]/20 to-emerald-800/20">
                    <Sparkles className="w-4 h-4 text-[#073B34] dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('settings.gradientBg')}</p>
                    <p className="text-xs text-muted-foreground">{t('settings.gradientBgDesc')}</p>
                  </div>
                </div>
                <button onClick={() => setGradientBg(!gradientBg)}
                  className={cn('relative w-11 h-6 rounded-full transition-colors', gradientBg ? 'bg-primary' : 'bg-muted')}>
                  <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform', gradientBg ? 'translate-x-[22px]' : 'translate-x-0.5')} />
                </button>
              </div>

              {/* Glass sidebar */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <GlassWater className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('settings.glassSidebar')}</p>
                    <p className="text-xs text-muted-foreground">{t('settings.glassSidebarDesc')}</p>
                  </div>
                </div>
                <button onClick={() => setSidebarGlass(!sidebarGlass)}
                  className={cn('relative w-11 h-6 rounded-full transition-colors', sidebarGlass ? 'bg-primary' : 'bg-muted')}>
                  <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform', sidebarGlass ? 'translate-x-[22px]' : 'translate-x-0.5')} />
                </button>
              </div>

              {/* Sidebar opacity */}
              {sidebarGlass && (
                <div className="p-4 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">{t('settings.sidebarOpacity')}</p>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">{Math.round(sidebarOpacity * 100)}%</span>
                  </div>
                  <input type="range" min="0.3" max="1" step="0.05"
                    value={sidebarOpacity} onChange={e => setSidebarOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary" />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>30%</span><span>100%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Brand Identity ── */}
          <div className="bg-card rounded-2xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-primary/10"><Palette className="w-4 h-4 text-primary" /></div>
              <h2 className="font-display font-semibold text-lg">{t('settings.brandingTitle')}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{t('settings.brandingDesc')}</p>

            {/* CRM Name */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium">{t('settings.crmName')}</label>
              <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="FREEMO R"
                className="w-full max-w-md px-4 py-2.5 border border-border rounded-xl text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              <p className="text-xs text-muted-foreground">{t('settings.crmNameHint')}</p>
            </div>

            {/* Logo */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium">{t('settings.logo')}</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                  {brandLogo ? (
                    <img src={brandLogo} alt="logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <ImagePlus className="w-6 h-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted transition cursor-pointer">
                    <Upload className="w-4 h-4" /> {logoUploading ? t('common.loading') : t('settings.uploadLogo')}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
                  </label>
                  {brandLogo && (
                    <button onClick={() => setBrandLogo('')} className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80">
                      <Trash2 className="w-3 h-3" /> {t('settings.removeLogo')}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t('settings.logoHint')}</p>
            </div>

            {/* Preview */}
            {(brandName || brandLogo) && (
              <div className="border border-border rounded-xl p-4 bg-muted/20 mb-6">
                <p className="text-xs font-medium text-muted-foreground mb-3">{t('settings.preview')}</p>
                <div className="flex items-center gap-3">
                  {brandLogo ? (
                    <img src={brandLogo} alt="logo" className="w-8 h-8 rounded-lg object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{(brandName || 'R')[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <span className="font-display font-bold text-lg">{brandName || 'FREEMO R'}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Save ── */}
          <button onClick={handleSaveBrand} disabled={brandSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
            <Save className="w-4 h-4" /> {brandSaving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sub-dialogs ───

function PermissionsDialog({ user, t, onSave, onClose }: { user: any; t: (k:string)=>string; onSave: (perms: string | null) => void; onClose: () => void }) {
  const ALL_SECTIONS = [
    { key: 'dashboard', labelKey: 'nav.dashboard' },
    { key: 'deals', labelKey: 'nav.deals' },
    { key: 'leads', labelKey: 'nav.leads' },
    { key: 'properties', labelKey: 'nav.properties' },
    { key: 'tasks', labelKey: 'nav.tasks' },
    { key: 'calendar', labelKey: 'nav.calendar' },
    { key: 'chat', labelKey: 'nav.chat' },
    { key: 'analytics', labelKey: 'nav.analytics' },
    { key: 'automations', labelKey: 'nav.automations' },
    { key: 'templates', labelKey: 'nav.templates' },
    { key: 'knowledge-base', labelKey: 'nav.knowledgeBase' },
    { key: 'activity-log', labelKey: 'nav.activityLog' },
  ];
  const existingPerms: string[] | null = user.permissions ? (() => { try { return JSON.parse(user.permissions); } catch { return null; } })() : null;
  const [selected, setSelected] = useState<Set<string>>(
    existingPerms ? new Set(existingPerms) : new Set(ALL_SECTIONS.map(s => s.key))
  );
  const [isFullAccess, setIsFullAccess] = useState(!existingPerms);

  const toggleSection = (key: string) => {
    setIsFullAccess(false);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleSelectAll = () => {
    setIsFullAccess(true);
    setSelected(new Set(ALL_SECTIONS.map(s => s.key)));
  };

  const handleDeselectAll = () => {
    setIsFullAccess(false);
    setSelected(new Set());
  };

  const handleSave = () => {
    if (isFullAccess || selected.size === ALL_SECTIONS.length) {
      onSave(null); // null = full access
    } else {
      onSave(JSON.stringify(Array.from(selected)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold">{t('settings.customPermissions')}</h2>
              <p className="text-xs text-muted-foreground">{user.name ?? user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Toggle buttons */}
          <div className="flex gap-2">
            <button onClick={handleSelectAll}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition">
              {t('settings.selectAll')}
            </button>
            <button onClick={handleDeselectAll}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition">
              {t('settings.deselectAll')}
            </button>
          </div>
          {/* Sections grid */}
          <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto">
            {ALL_SECTIONS.map(sec => {
              const checked = isFullAccess || selected.has(sec.key);
              return (
                <label key={sec.key}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all',
                    checked
                      ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                      : 'border-border hover:border-border/80 hover:bg-muted/50'
                  )}>
                  <div className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                    checked ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                  )}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" checked={checked} onChange={() => toggleSection(sec.key)} className="sr-only" />
                  <span className="text-sm font-medium">{t(sec.labelKey)}</span>
                </label>
              );
            })}
          </div>
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition">
              {t('common.cancel')}
            </button>
            <button onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDialog({ user, roles, t, onSave, onClose }: { user: any; roles: {value:string;label:string;desc:string}[]; t: (k:string)=>string; onSave: (d: any) => void; onClose: () => void }) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role ?? 'agent');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const data: any = { name, role, phone };
    if (!user) { data.email = email; data.password = password; }
    await onSave(data); setSaving(false);
  };
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-display font-bold">{user ? t('settings.editUser') : t('settings.newUser')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">{t('settings.userName')} {t('settings.required')}</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          {!user && (<><div><label className="text-sm font-medium mb-1 block">{t('settings.userEmail')} {t('settings.required')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <div><label className="text-sm font-medium mb-1 block">{t('auth.password')} {t('settings.required')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div></>)}
          <div><label className="text-sm font-medium mb-1 block">{t('settings.userRole')}</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              {roles.map((r: {value:string;label:string}) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
          <div><label className="text-sm font-medium mb-1 block">{t('settings.userPhone')}</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition">{t('common.cancel')}</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
              {saving ? t('common.saving') : t('common.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DistributionDialog({ rule, users, t, onSave, onClose }: { rule: any; users: any[]; t: (k:string)=>string; onSave: (d: any) => void; onClose: () => void }) {
  const [name, setName] = useState(rule?.name ?? '');
  const [source, setSource] = useState(rule?.source ?? '');
  const [district, setDistrict] = useState(rule?.district ?? '');
  const [propertyType, setPropertyType] = useState(rule?.propertyType ?? '');
  const [needType, setNeedType] = useState(rule?.needType ?? '');
  const [assignToId, setAssignToId] = useState(rule?.assignToId ?? '');
  const [priority, setPriority] = useState(rule?.priority ?? 0);
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-display font-bold">{rule ? t('settings.editRule') : t('settings.newRule')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">{t('settings.ruleName')} {t('settings.required')}</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <div><label className="text-sm font-medium mb-1 block">{t('settings.source')}</label>
            <input value={source} onChange={e => setSource(e.target.value)} placeholder="telegram, instagram..." className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <div><label className="text-sm font-medium mb-1 block">{t('settings.district')}</label>
            <input value={district} onChange={e => setDistrict(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <div><label className="text-sm font-medium mb-1 block">{t('settings.propType')}</label>
            <input value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <div><label className="text-sm font-medium mb-1 block">{t('settings.assignTo')} {t('settings.required')}</label>
            <select value={assignToId} onChange={e => setAssignToId(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">{t('settings.chooseUser')}</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name ?? u.email}</option>)}</select></div>
          <div><label className="text-sm font-medium mb-1 block">{t('settings.priorityLabel')}</label>
            <input type="number" value={priority} onChange={e => setPriority(+e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition">{t('common.cancel')}</button>
            <button onClick={() => { if (!name || !assignToId) return; onSave({ name, source: source || null, district: district || null, propertyType: propertyType || null, needType: needType || null, assignToId, priority }); }}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">{t('common.save')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AftercareDialog({ plan, t, onSave, onClose }: { plan: any; t: (k:string)=>string; onSave: (d: any) => void; onClose: () => void }) {
  const [name, setName] = useState(plan?.name ?? '');
  const [description, setDescription] = useState(plan?.description ?? '');
  const [steps, setSteps] = useState<any[]>(plan?.steps?.map((s: any) => ({ dayOffset: s.dayOffset, type: s.type, title: s.title, content: s.content || '', order: s.order })) ?? []);

  const addStep = () => setSteps([...steps, { dayOffset: (steps[steps.length-1]?.dayOffset || 0) + 7, type: 'message', title: '', content: '', order: steps.length }]);
  const updateStep = (i: number, field: string, value: any) => { const ns = [...steps]; ns[i] = { ...ns[i], [field]: value }; setSteps(ns); };
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-display font-bold">{plan ? t('settings.editPlan') : t('settings.newPlan')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">{t('settings.planName')} {t('settings.required')}</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <div><label className="text-sm font-medium mb-1 block">{t('settings.descriptionLabel')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>

          <div>
            <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">{t('settings.steps')}</label>
              <button onClick={addStep} className="text-xs text-primary hover:underline">{t('settings.addStep')}</button></div>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-xl space-y-2">
                  <div className="flex gap-2 items-center">
                    <div className="w-20"><label className="text-xs text-muted-foreground">{t('settings.day')}</label>
                      <input type="number" value={step.dayOffset} onChange={e => updateStep(i, 'dayOffset', +e.target.value)} className="w-full px-2 py-1 border border-border rounded-lg text-sm" /></div>
                    <div className="w-28"><label className="text-xs text-muted-foreground">{t('settings.stepType')}</label>
                      <select value={step.type} onChange={e => updateStep(i, 'type', e.target.value)} className="w-full px-2 py-1 border border-border rounded-lg text-sm">
                        <option value="message">{t('settings.stepMessage')}</option><option value="call">{t('settings.stepCall')}</option><option value="email">{t('settings.stepEmail')}</option><option value="gift">{t('settings.stepGift')}</option>
                      </select></div>
                    <div className="flex-1"><label className="text-xs text-muted-foreground">{t('settings.stepTitle')}</label>
                      <input value={step.title} onChange={e => updateStep(i, 'title', e.target.value)} className="w-full px-2 py-1 border border-border rounded-lg text-sm" /></div>
                    <button onClick={() => removeStep(i)} className="p-1 mt-4 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </div>
                  <textarea value={step.content} onChange={e => updateStep(i, 'content', e.target.value)} rows={1} placeholder={t('settings.stepContent')}
                    className="w-full px-2 py-1 border border-border rounded-lg text-sm" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition">{t('common.cancel')}</button>
            <button onClick={() => { if (!name) return; onSave({ name, description: description || null, isActive: true, steps }); }}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">{t('common.save')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NbuRateWidget({ t }: { t: (k: string) => string }) {
  const [rate, setRate] = useState<{ rate: number; date: string } | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  useEffect(() => {
    import('@/shared/api/exchange-rate').then(({ getExchangeRate }) => getExchangeRate()).then(d => { if (d?.rate) setRate({ rate: d.rate, date: d.date }); })
      .catch(() => {})
      .finally(() => setLoadingRate(false));
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-6 mt-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="text-lg">🏦</span> {t('deals.nbuRate')}
      </h3>
      {loadingRate ? (
        <p className="text-sm text-muted-foreground">...</p>
      ) : rate ? (
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">{rate.rate.toFixed(4)}</span>
            <span className="text-sm text-muted-foreground">UAH / USD</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('deals.nbuRateDate')} {rate.date}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('deals.rateUnavailable')}</p>
      )}
    </div>
  );
}
