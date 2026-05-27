'use client';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Building, Workflow, CheckSquare,
  BarChart3, BookOpen, CalendarDays, Zap, FileText, MessageCircle,
  Shield, Settings, Target, Heart, Grid3X3, Upload, Globe,
  Lock, UserCog, Database, ChevronRight, ChevronDown, Sparkles,
  ArrowRight, CheckCircle2, Search, MousePointerClick, Bell,
  Layers, Eye, GripVertical, Palette, ListChecks
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from '@/shared/lib/i18n/context';
import Link from 'next/link';

interface Feature {
  id: string;
  icon: any;
  titleKey: string;
  descKey: string;
  href: string;
  color: string;
  stepsKeys: string[];
  tipsKeys?: string[];
}

const FEATURES: Feature[] = [
  {
    id: 'dashboard', icon: LayoutDashboard,
    titleKey: 'capabilities.dashboard.title', descKey: 'capabilities.dashboard.desc',
    href: '/dashboard', color: 'bg-blue-500',
    stepsKeys: ['capabilities.dashboard.step1', 'capabilities.dashboard.step2', 'capabilities.dashboard.step3', 'capabilities.dashboard.step4'],
    tipsKeys: ['capabilities.dashboard.tip1', 'capabilities.dashboard.tip2'],
  },
  {
    id: 'deals', icon: Workflow,
    titleKey: 'capabilities.deals.title', descKey: 'capabilities.deals.desc',
    href: '/deals', color: 'bg-violet-500',
    stepsKeys: ['capabilities.deals.step1', 'capabilities.deals.step2', 'capabilities.deals.step3', 'capabilities.deals.step4', 'capabilities.deals.step5'],
    tipsKeys: ['capabilities.deals.tip1', 'capabilities.deals.tip2'],
  },
  {
    id: 'leads', icon: Users,
    titleKey: 'capabilities.leads.title', descKey: 'capabilities.leads.desc',
    href: '/leads', color: 'bg-emerald-500',
    stepsKeys: ['capabilities.leads.step1', 'capabilities.leads.step2', 'capabilities.leads.step3', 'capabilities.leads.step4', 'capabilities.leads.step5'],
    tipsKeys: ['capabilities.leads.tip1', 'capabilities.leads.tip2'],
  },
  {
    id: 'properties', icon: Building,
    titleKey: 'capabilities.properties.title', descKey: 'capabilities.properties.desc',
    href: '/properties', color: 'bg-amber-500',
    stepsKeys: ['capabilities.properties.step1', 'capabilities.properties.step2', 'capabilities.properties.step3', 'capabilities.properties.step4', 'capabilities.properties.step5'],
    tipsKeys: ['capabilities.properties.tip1', 'capabilities.properties.tip2'],
  },
  {
    id: 'tasks', icon: CheckSquare,
    titleKey: 'capabilities.tasks.title', descKey: 'capabilities.tasks.desc',
    href: '/tasks', color: 'bg-rose-500',
    stepsKeys: ['capabilities.tasks.step1', 'capabilities.tasks.step2', 'capabilities.tasks.step3', 'capabilities.tasks.step4'],
    tipsKeys: ['capabilities.tasks.tip1'],
  },
  {
    id: 'calendar', icon: CalendarDays,
    titleKey: 'capabilities.calendar.title', descKey: 'capabilities.calendar.desc',
    href: '/calendar', color: 'bg-cyan-500',
    stepsKeys: ['capabilities.calendar.step1', 'capabilities.calendar.step2', 'capabilities.calendar.step3', 'capabilities.calendar.step4'],
    tipsKeys: ['capabilities.calendar.tip1'],
  },
  {
    id: 'analytics', icon: BarChart3,
    titleKey: 'capabilities.analytics.title', descKey: 'capabilities.analytics.desc',
    href: '/analytics', color: 'bg-indigo-500',
    stepsKeys: ['capabilities.analytics.step1', 'capabilities.analytics.step2', 'capabilities.analytics.step3'],
    tipsKeys: ['capabilities.analytics.tip1'],
  },
  {
    id: 'automations', icon: Zap,
    titleKey: 'capabilities.automations.title', descKey: 'capabilities.automations.desc',
    href: '/automations', color: 'bg-yellow-500',
    stepsKeys: ['capabilities.automations.step1', 'capabilities.automations.step2', 'capabilities.automations.step3', 'capabilities.automations.step4', 'capabilities.automations.step5'],
    tipsKeys: ['capabilities.automations.tip1', 'capabilities.automations.tip2'],
  },
  {
    id: 'templates', icon: FileText,
    titleKey: 'capabilities.templates.title', descKey: 'capabilities.templates.desc',
    href: '/templates', color: 'bg-teal-500',
    stepsKeys: ['capabilities.templates.step1', 'capabilities.templates.step2', 'capabilities.templates.step3', 'capabilities.templates.step4'],
    tipsKeys: ['capabilities.templates.tip1'],
  },
  {
    id: 'knowledge', icon: BookOpen,
    titleKey: 'capabilities.knowledge.title', descKey: 'capabilities.knowledge.desc',
    href: '/knowledge-base', color: 'bg-purple-500',
    stepsKeys: ['capabilities.knowledge.step1', 'capabilities.knowledge.step2', 'capabilities.knowledge.step3'],
    tipsKeys: ['capabilities.knowledge.tip1'],
  },
  {
    id: 'chat', icon: MessageCircle,
    titleKey: 'capabilities.chat.title', descKey: 'capabilities.chat.desc',
    href: '/chat', color: 'bg-pink-500',
    stepsKeys: ['capabilities.chat.step1', 'capabilities.chat.step2', 'capabilities.chat.step3'],
  },
  {
    id: 'activityLog', icon: Shield,
    titleKey: 'capabilities.activityLog.title', descKey: 'capabilities.activityLog.desc',
    href: '/activity-log', color: 'bg-slate-500',
    stepsKeys: ['capabilities.activityLog.step1', 'capabilities.activityLog.step2', 'capabilities.activityLog.step3'],
  },
  {
    id: 'settings', icon: Settings,
    titleKey: 'capabilities.settings.title', descKey: 'capabilities.settings.desc',
    href: '/settings', color: 'bg-gray-500',
    stepsKeys: ['capabilities.settings.step1', 'capabilities.settings.step2', 'capabilities.settings.step3', 'capabilities.settings.step4', 'capabilities.settings.step5'],
    tipsKeys: ['capabilities.settings.tip1'],
  },
];

interface ExtraFeature {
  icon: any;
  titleKey: string;
  descKey: string;
  color: string;
  stepsKeys: string[];
}

const EXTRA_FEATURES: ExtraFeature[] = [
  { icon: Grid3X3, titleKey: 'capabilities.chess.title', descKey: 'capabilities.chess.desc', color: 'bg-orange-500',
    stepsKeys: ['capabilities.chess.step1', 'capabilities.chess.step2', 'capabilities.chess.step3', 'capabilities.chess.step4'] },
  { icon: Upload, titleKey: 'capabilities.import.title', descKey: 'capabilities.import.desc', color: 'bg-lime-500',
    stepsKeys: ['capabilities.import.step1', 'capabilities.import.step2', 'capabilities.import.step3'] },
  { icon: Globe, titleKey: 'capabilities.i18n.title', descKey: 'capabilities.i18n.desc', color: 'bg-sky-500',
    stepsKeys: ['capabilities.i18n.step1', 'capabilities.i18n.step2'] },
  { icon: Lock, titleKey: 'capabilities.rbac.title', descKey: 'capabilities.rbac.desc', color: 'bg-red-500',
    stepsKeys: ['capabilities.rbac.step1', 'capabilities.rbac.step2', 'capabilities.rbac.step3'] },
  { icon: UserCog, titleKey: 'capabilities.distribution.title', descKey: 'capabilities.distribution.desc', color: 'bg-fuchsia-500',
    stepsKeys: ['capabilities.distribution.step1', 'capabilities.distribution.step2', 'capabilities.distribution.step3'] },
  { icon: Heart, titleKey: 'capabilities.aftercare.title', descKey: 'capabilities.aftercare.desc', color: 'bg-rose-400',
    stepsKeys: ['capabilities.aftercare.step1', 'capabilities.aftercare.step2', 'capabilities.aftercare.step3'] },
  { icon: Search, titleKey: 'capabilities.globalSearch.title', descKey: 'capabilities.globalSearch.desc', color: 'bg-blue-600',
    stepsKeys: ['capabilities.globalSearch.step1', 'capabilities.globalSearch.step2', 'capabilities.globalSearch.step3'] },
  { icon: MousePointerClick, titleKey: 'capabilities.bulkOps.title', descKey: 'capabilities.bulkOps.desc', color: 'bg-emerald-600',
    stepsKeys: ['capabilities.bulkOps.step1', 'capabilities.bulkOps.step2', 'capabilities.bulkOps.step3'] },
  { icon: Bell, titleKey: 'capabilities.notifications.title', descKey: 'capabilities.notifications.desc', color: 'bg-amber-600',
    stepsKeys: ['capabilities.notifications.step1', 'capabilities.notifications.step2', 'capabilities.notifications.step3'] },
  { icon: GripVertical, titleKey: 'capabilities.dndTasks.title', descKey: 'capabilities.dndTasks.desc', color: 'bg-rose-600',
    stepsKeys: ['capabilities.dndTasks.step1', 'capabilities.dndTasks.step2', 'capabilities.dndTasks.step3'] },
  { icon: Layers, titleKey: 'capabilities.inlineEdit.title', descKey: 'capabilities.inlineEdit.desc', color: 'bg-indigo-600',
    stepsKeys: ['capabilities.inlineEdit.step1', 'capabilities.inlineEdit.step2'] },
  { icon: Eye, titleKey: 'capabilities.quickPreview.title', descKey: 'capabilities.quickPreview.desc', color: 'bg-cyan-600',
    stepsKeys: ['capabilities.quickPreview.step1', 'capabilities.quickPreview.step2', 'capabilities.quickPreview.step3'] },
  { icon: ListChecks, titleKey: 'capabilities.taskGroups.title', descKey: 'capabilities.taskGroups.desc', color: 'bg-violet-600',
    stepsKeys: ['capabilities.taskGroups.step1', 'capabilities.taskGroups.step2'] },
  { icon: Palette, titleKey: 'capabilities.themes.title', descKey: 'capabilities.themes.desc', color: 'bg-gray-600',
    stepsKeys: ['capabilities.themes.step1', 'capabilities.themes.step2', 'capabilities.themes.step3'] },
];

function FeatureCard({ feature, t, isExtra }: { feature: Feature | ExtraFeature; t: (k: string) => string; isExtra?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const f = feature;
  const hasHref = 'href' in f;

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/20"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0', f.color)}>
          <f.icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm">{t(f.titleKey)}</h3>
            <div className={cn('transition-transform duration-200', expanded && 'rotate-180')}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-border/50 pt-4 animate-in slide-in-from-top-2 duration-200">
          {/* Steps */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" />
              {t('capabilities.howTo')}
            </h4>
            <ol className="space-y-2.5">
              {f.stepsKeys.map((key, i) => (
                <li key={key} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground/80 leading-relaxed">{t(key)}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {'tipsKeys' in f && f.tipsKeys && f.tipsKeys.length > 0 && (
            <div className="bg-primary/5 rounded-lg p-3.5 mb-4">
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {t('capabilities.tips')}
              </h4>
              <ul className="space-y-1.5">
                {f.tipsKeys.map((key) => (
                  <li key={key} className="flex gap-2 items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground/70 leading-relaxed">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Link */}
          {hasHref && (
            <Link
              href={(f as Feature).href}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition"
            >
              {t('capabilities.goToSection')} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function CapabilitiesPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight">{t('capabilities.title')}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t('capabilities.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Main modules */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Database className="w-5 h-5 text-primary" />
        {t('capabilities.modulesTitle')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {FEATURES.map((f) => (
          <FeatureCard key={f.id} feature={f} t={t} />
        ))}
      </div>

      {/* Additional features */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        {t('capabilities.extraTitle')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {EXTRA_FEATURES.map((f) => (
          <FeatureCard key={f.titleKey} feature={f} t={t} isExtra />
        ))}
      </div>
    </div>
  );
}
