'use client';
import { useState, useEffect, useCallback } from 'react';
import { Save, Key, Users, User, Shield, Plus, Edit2, Trash2, X, Workflow, Book, Upload, Target, Heart, Camera } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/shared/lib/i18n/context';

const ROLES_STATIC = [
  { value: 'admin', labelKey: 'role.admin', descKey: 'common.fullAccess' },
  { value: 'director', labelKey: 'role.director', descKey: 'common.viewAndManage' },
  { value: 'agent', labelKey: 'role.agent', descKey: 'common.basicOps' },
];

const TABS_STATIC = [
  { key: 'profile', labelKey: 'settings.profile', icon: User },
  { key: 'users', labelKey: 'settings.users', icon: Users, adminOnly: true },
  { key: 'funnel', labelKey: 'settings.funnel', icon: Workflow, adminOnly: true },
  { key: 'customFields', labelKey: 'settings.customFields', icon: Edit2, adminOnly: true },
  { key: 'dictionaries', labelKey: 'settings.dictionaries', icon: Book, adminOnly: true },
  { key: 'distribution', labelKey: 'settings.distribution', icon: Target, adminOnly: true },
  { key: 'aftercare', labelKey: 'settings.aftercare', icon: Heart, adminOnly: true },
];

type TabKey = 'profile' | 'users' | 'funnel' | 'customFields' | 'dictionaries' | 'distribution' | 'aftercare';

export function SettingsPage() {
  const { t } = useTranslation();
  const { data: session } = useSession() || {};
  const ROLES = ROLES_STATIC.map(r => ({ value: r.value, label: t(r.labelKey), desc: t(r.descKey) }));
  const TABS = TABS_STATIC.map(tb => ({ ...tb, label: t(tb.labelKey) }));
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
  const [stages, setStages] = useState<any[]>([]);
  const [newStage, setNewStage] = useState({ label: '', value: '', color: '#60B5FF' });
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

  useEffect(() => {
    fetch('/api/settings/profile')
      .then(r => r.json())
      .then(d => { setProfile(d); setName(d.name ?? ''); setPhone(d.phone ?? ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchTabData = useCallback(() => {
    if (activeTab === 'users') {
      fetch('/api/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
    } else if (activeTab === 'funnel') {
      fetch('/api/funnel-stages').then(r => r.json()).then(d => setStages(Array.isArray(d) ? d : []));
    } else if (activeTab === 'customFields') {
      fetch('/api/deal-custom-fields').then(r => r.json()).then(d => setCustomFields(Array.isArray(d) ? d : []));
    } else if (activeTab === 'dictionaries') {
      fetch(`/api/dictionaries?category=${dictCategory}`).then(r => r.json()).then(d => setDicts(Array.isArray(d) ? d : []));
    } else if (activeTab === 'distribution') {
      fetch('/api/lead-distribution').then(r => r.json()).then(d => setDistRules(Array.isArray(d) ? d : []));
      fetch('/api/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
    } else if (activeTab === 'aftercare') {
      fetch('/api/aftercare-plans').then(r => r.json()).then(d => setAftercarePlans(Array.isArray(d) ? d : []));
    }
  }, [activeTab, dictCategory]);

  useEffect(() => { fetchTabData(); }, [fetchTabData]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const res = await fetch('/api/settings/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, ...(newPassword && { newPassword }) }),
    });
    if (res.ok) { toast.success(t('settings.profileSaved')); setNewPassword(''); }
    else toast.error(t('settings.saveError'));
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const presignRes = await fetch('/api/upload/presigned', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
      });
      const presignData = await presignRes.json();
      const uploadUrl = presignData.uploadUrl || presignData.url;
      const storagePath = presignData.cloud_storage_path || presignData.cloudStoragePath;
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type, 'Content-Disposition': 'attachment' }, body: file });
      await fetch('/api/settings/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: storagePath }),
      });
      setProfile((p: any) => ({ ...p, avatar: storagePath }));
      toast.success(t('settings.photoUpdated'));
    } catch { toast.error(t('settings.uploadError')); }
    setAvatarUploading(false);
  };

  const addStage = async () => {
    if (!newStage.label || !newStage.value) { toast.error(t('settings.fillNameValue')); return; }
    await fetch('/api/funnel-stages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newStage) });
    setNewStage({ label: '', value: '', color: '#60B5FF' }); fetchTabData(); toast.success(t('settings.stageAdded'));
  };
  const deleteStage = async (id: string) => {
    await fetch(`/api/funnel-stages?id=${id}`, { method: 'DELETE' }); fetchTabData(); toast.success(t('settings.deleted'));
  };

  const addCustomField = async () => {
    if (!newField.name || !newField.label) { toast.error(t('settings.fillFieldName')); return; }
    await fetch('/api/deal-custom-fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newField) });
    setNewField({ name: '', label: '', fieldType: 'text', options: '' }); fetchTabData(); toast.success(t('settings.fieldAdded'));
  };
  const deleteCustomField = async (id: string) => {
    await fetch(`/api/deal-custom-fields?id=${id}`, { method: 'DELETE' }); fetchTabData();
  };

  const addDictItem = async () => {
    if (!newDict.value || !newDict.label) { toast.error(t('settings.fillFields')); return; }
    await fetch('/api/dictionaries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newDict, category: dictCategory }) });
    setNewDict({ value: '', label: '' }); fetchTabData(); toast.success(t('settings.addedDict'));
  };
  const deleteDictItem = async (id: string) => {
    await fetch(`/api/dictionaries?id=${id}`, { method: 'DELETE' }); fetchTabData();
  };

  const saveDistRule = async (data: any) => {
    const method = editingDist ? 'PUT' : 'POST';
    const body = editingDist ? { ...data, id: editingDist.id } : data;
    await fetch('/api/lead-distribution', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowDistDialog(false); setEditingDist(null); fetchTabData(); toast.success(t('settings.saved'));
  };
  const deleteDistRule = async (id: string) => {
    await fetch(`/api/lead-distribution?id=${id}`, { method: 'DELETE' }); fetchTabData(); toast.success(t('settings.deleted'));
  };

  const saveAftercare = async (data: any) => {
    if (editingAftercare) {
      await fetch(`/api/aftercare-plans/${editingAftercare.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } else {
      await fetch('/api/aftercare-plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    }
    setShowAftercareDialog(false); setEditingAftercare(null); fetchTabData(); toast.success(t('settings.saved'));
  };
  const deleteAftercare = async (id: string) => {
    await fetch(`/api/aftercare-plans/${id}`, { method: 'DELETE' }); fetchTabData(); toast.success(t('settings.deleted'));
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

  const handleDeleteUser = async (id: string) => {
    if (!confirm(t('settings.deleteUserConfirm'))) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' }); toast.success(t('settings.deleted')); fetchTabData();
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>;

  const isAdmin = profile?.role === 'admin';
  const DICT_CATS = [
    {v:'district',l:t('settings.districts')},{v:'property_type',l:t('settings.propertyTypes')},{v:'lead_source',l:t('settings.leadSources')}
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-display font-bold mb-6">{t('settings.title')}</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.filter(tb => !tb.adminOnly || isAdmin).map(tb => (
          <button key={tb.key} onClick={() => setActiveTab(tb.key as TabKey)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap',
              activeTab === tb.key ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground')}>
            <tb.icon className="w-4 h-4" /> {tb.label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
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
          <div className="bg-white rounded-xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-4"><Key className="w-4 h-4 text-muted-foreground" /><h2 className="font-semibold">{t('settings.changePw')}</h2></div>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('settings.newPw')}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <button onClick={handleSaveProfile} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? t('common.saving') : t('common.save')}
          </button>
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
          <div className="bg-white rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.userName')}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.userEmail')}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.userRole')}</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('settings.actions')}</th>
              </tr></thead>
              <tbody>{users.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{u.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><span className={cn('text-xs px-2 py-0.5 rounded-full',
                    u.role === 'admin' ? 'bg-red-100 text-red-600' : u.role === 'director' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                  )}>{ROLES.find(r => r.value === u.role)?.label ?? u.role}</span></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1">
                    <button onClick={() => { setEditingUser(u); setShowUserDialog(true); }} className="p-1.5 hover:bg-muted rounded-lg transition"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {showUserDialog && <UserDialog user={editingUser} roles={ROLES} t={t} onSave={handleSaveUser} onClose={() => { setShowUserDialog(false); setEditingUser(null); }} />}
        </div>
      )}

      {/* FUNNEL STAGES TAB */}
      {activeTab === 'funnel' && isAdmin && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="font-semibold mb-4">{t('settings.funnelStages')}</h2>
            <div className="space-y-2 mb-4">
              {stages.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-sm font-medium flex-1">{s.label}</span>
                  <span className="text-xs text-muted-foreground font-mono">{s.value}</span>
                  {!s.isDefault && (
                    <button onClick={() => deleteStage(s.id)} className="p-1 hover:bg-destructive/10 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium mb-1 block">{t('settings.stageLabel')}</label>
                <input value={newStage.label} onChange={e => setNewStage({...newStage, label: e.target.value, value: e.target.value.toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')})}
                  className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder={t('settings.newStage')} />
              </div>
              <div className="w-16">
                <label className="text-xs font-medium mb-1 block">{t('settings.stageColor')}</label>
                <input type="color" value={newStage.color} onChange={e => setNewStage({...newStage, color: e.target.value})} className="w-full h-9 rounded-xl border border-border" />
              </div>
              <button onClick={addStage} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM FIELDS TAB */}
      {activeTab === 'customFields' && isAdmin && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="font-semibold mb-4">{t('settings.customFieldsTitle')}</h2>
            <div className="space-y-2 mb-4">
              {customFields.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <span className="text-sm font-medium flex-1">{f.label}</span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">{f.fieldType}</span>
                  <button onClick={() => deleteCustomField(f.id)} className="p-1 hover:bg-destructive/10 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input value={newField.label} onChange={e => setNewField({...newField, label: e.target.value, name: e.target.value.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')})}
                placeholder={t('settings.fieldName')} className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <select value={newField.fieldType} onChange={e => setNewField({...newField, fieldType: e.target.value})}
                className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="text">{t('settings.fieldText')}</option><option value="number">{t('settings.fieldNumber')}</option><option value="date">{t('settings.fieldDate')}</option>
                <option value="select">{t('settings.fieldSelect')}</option><option value="checkbox">{t('settings.fieldCheckbox')}</option>
              </select>
              {newField.fieldType === 'select' && (
                <input value={newField.options} onChange={e => setNewField({...newField, options: e.target.value})}
                  placeholder={t('settings.optionsComma')} className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              )}
              <button onClick={addCustomField} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition">
                <Plus className="w-4 h-4 mx-auto" />
              </button>
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
          <div className="bg-white rounded-xl border border-border p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="space-y-2 mb-4">
              {dicts.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
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
          <div className="bg-white rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
            {distRules.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6 text-center">{t('settings.noRules')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.ruleName')}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.conditions')}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('settings.assignTo')}</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('settings.actions')}</th>
                </tr></thead>
                <tbody>{distRules.map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0">
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
          {aftercarePlans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{plan.name}</h3>
                  {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
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
    </div>
  );
}

// ─── Sub-dialogs ───

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
      <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
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
      <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
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
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-white z-10">
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
