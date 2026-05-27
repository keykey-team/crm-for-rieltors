## Layout

The root layout, `app/layout.tsx`, is the single place for app-wide providers and global infrastructure.

**Do not remove any existing entries without a reason.** Current infrastructure in the layout:

| Entry | Purpose |
|-------|---------|
| `ThemeProvider` | Light/dark mode via `next-themes` |
| `Toaster` | Global toast notifications via Sonner |
| `ChunkLoadErrorHandler` | Required — prevents known ChunkLoadError race condition bug |

---

## Typography

| Role | Font | Tailwind Class | Default Usage |
|------|------|---------------|-------|
| Body | DM Sans | `font-sans` | All body text, labels, descriptions |
| Display | Plus Jakarta Sans | `font-display` | Page titles, hero headings, section headers |
| Mono | JetBrains Mono | `font-mono` | Code snippets, numeric data, IDs, timestamps |

**Size hierarchy:** Use Tailwind's scale. Headings: `text-4xl`→`text-3xl`→`text-2xl`→`text-xl`. Body: `text-base`→`text-sm`. Captions: `text-xs`.

Always use `tracking-tight` on large headings (`text-2xl` and above).

---

## Color System (Design Tokens)

All colors use CSS variables — **never hardcode color values**.

| Token | Purpose |
|-------|---------|
| `background` / `foreground` | Page-level bg and text |
| `card` / `card-foreground` | Card surfaces |
| `primary` / `primary-foreground` | Brand buttons, links, accents |
| `secondary` / `secondary-foreground` | Secondary buttons, subtle highlights |
| `muted` / `muted-foreground` | Disabled states, helper text, subtle backgrounds |
| `accent` / `accent-foreground` | Hover states, active nav items |
| `destructive` / `destructive-foreground` | Errors, delete actions |
| `border` | Borders and dividers |
| `input` | Form input borders |
| `ring` | Focus rings |

Usage: `bg-primary`, `text-muted-foreground`, `border-border`, etc.

---

## Spacing Scale

Based on an 8px grid. Use these CSS variables or Tailwind equivalents:

| Token | Value | Tailwind |
|-------|-------|----------|
| `--spacing-xs` | 4px | `p-1`, `gap-1` |
| `--spacing-sm` | 8px | `p-2`, `gap-2` |
| `--spacing-md` | 16px | `p-4`, `gap-4` |
| `--spacing-lg` | 24px | `p-6`, `gap-6` |
| `--spacing-xl` | 32px | `p-8`, `gap-8` |
| `--spacing-2xl` | 48px | `p-12`, `gap-12` |
| `--spacing-3xl` | 64px | `p-16`, `gap-16` |

**Vary spacing rhythm** — don't use the same gap everywhere. Hero → large gap → content → medium gap → footer.

---

## Shadow Scale

| Token | Default Usage |
|-------|-------|
| `--shadow-sm` | Subtle card lift, input focus |
| `--shadow-md` | Cards, dropdowns, popovers |
| `--shadow-lg` | Modals, elevated panels |

These are CSS variables only — use them directly in inline styles or custom CSS as `var(--shadow-sm)` etc. They are not mapped to Tailwind's `shadow-*` utilities.

---

## Border Radius

| Token | Value | Default Usage |
|-------|-------|-------|
| `--radius` | 0.625rem | Default (buttons, inputs, cards) |
| `--radius-sm` | calc(var(--radius) - 4px) | Small elements (badges, chips) |
| `--radius-lg` | calc(var(--radius) + 4px) | Large containers, hero cards |
| `--radius-full` | 9999px | Avatars, pills, circular buttons |

---

## Animation Timing

| Token | Value | Tailwind Class | Default Usage |
|-------|-------|---------------|-------|
| `--duration-fast` | 150ms | `duration-fast` | Hover states, toggles |
| `--duration-normal` | 250ms | `duration-normal` | Page transitions, reveals |
| `--duration-slow` | 350ms | `duration-slow` | Complex animations, modals |

---

## Layout Components

### `Container` — `@/shared/layout/container`
Centers content with responsive padding. Props: `size` (`sm`|`md`|`lg`|`xl`|`full`).
```tsx
<Container size="lg">{children}</Container>
```

### `Section` — `@/shared/layout/section`
Vertical spacing wrapper for page sections. Props: `id`, `className`.
```tsx
<Section id="features">{children}</Section>
```

### `PageHeader` — `@/shared/layout/page-header`
Title + description + action buttons. Use at top of every app page.
```tsx
<PageHeader title="Dashboard" description="Overview of your account" actions={<Button>Export</Button>} />
```

### `AppShell` — `@/shared/layout/app-shell`
Sidebar + header + main content. The standard layout for dashboards and admin panels.
```tsx
<AppShell sidebar={<nav>...</nav>} header={<div>...</div>}>{children}</AppShell>
```

### `AuthLayout` — `@/shared/layout/auth-layout`
Centered card on gradient background. Use for login, signup, onboarding flows.
```tsx
<AuthLayout title="Welcome back" description="Sign in to continue">{form}</AuthLayout>
```

---

## Animation Components — `@/shared/ui/animate`

| Component | Default Usage | Key Props |
|-----------|-------|-----------|
| `FadeIn` | Reveal content on scroll | `delay`, `duration` |
| `ScaleIn` | Pop-in effect | `delay` |
| `SlideIn` | Directional entrance | `from` (`top`\|`bottom`\|`left`\|`right`), `delay` |
| `Stagger` + `StaggerItem` | Sequential reveal for lists/grids | `staggerDelay` |
| `HoverLift` | Lift effect on hover (cards, links) | — |
| `PressScale` | Press-down feedback for buttons | — |
| `SkeletonPulse` | Loading placeholder | `className` (set width/height) |

**Pattern:** Wrap page sections in `FadeIn`, list items in `Stagger`/`StaggerItem`, interactive cards in `HoverLift`.

---

## UI Components — `@/shared/ui/`

### Core
| Component | Import | Key Props |
|-----------|--------|-----------|
| `Button` | `@/shared/ui/button` | `variant` (`default`\|`secondary`\|`outline`\|`ghost`\|`destructive`\|`link`\|`glass-dark`\|`glass-light`), `size` (`default`\|`xs`\|`sm`\|`lg`\|`icon`\|`icon-sm`), `loading` (boolean). **`glass-dark`**: for dark/vivid backgrounds. **`glass-light`**: for light/pale backgrounds. **Link**: focus uses underline, not ring. |
| `Badge` | `@/shared/ui/badge` | `variant` (`default`\|`secondary`\|`outline`\|`destructive`) |
| `Card` | `@/shared/ui/card` | `variant` (`default`\|`interactive`\|`glass-dark`\|`glass-dark-interactive`\|`glass-light`\|`glass-light-interactive`\|`ghost`). Composed: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. **Interactive**: always wrap in `<a>` or `<button>` for keyboard access. |
| `Separator` | `@/shared/ui/separator` | `orientation` (`horizontal`\|`vertical`) |

### Forms
| Component | Import |
|-----------|--------|
| `Input` | `@/shared/ui/input` | `variant` (`default`\|`error`\|`success`\|`ghost`), `size` (`default`\|`sm`\|`lg`) |
| `Textarea` | `@/shared/ui/textarea` | `variant` (`default`\|`error`\|`success`\|`ghost`) |
| `Label` | `@/shared/ui/label` |
| `Select` | `@/shared/ui/select` |
| `Checkbox` | `@/shared/ui/checkbox` |
| `RadioGroup` | `@/shared/ui/radio-group` |
| `Switch` | `@/shared/ui/switch` |
| `Slider` | `@/shared/ui/slider` |
| `Calendar` | `@/shared/ui/calendar` |
| `DateRangePicker` | `@/shared/ui/date-range-picker` |
| `InputOTP` | `@/shared/ui/input-otp` |
| `Form` | `@/shared/ui/form` (react-hook-form integration) |

### Navigation & Layout
| Component | Import |
|-----------|--------|
| `Tabs` | `@/shared/ui/tabs` — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| `Accordion` | `@/shared/ui/accordion` — `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| `NavigationMenu` | `@/shared/ui/navigation-menu` |
| `Breadcrumb` | `@/shared/ui/breadcrumb` |
| `Pagination` | `@/shared/ui/pagination` |
| `Menubar` | `@/shared/ui/menubar` |
| `ScrollArea` | `@/shared/ui/scroll-area` |
| `Resizable` | `@/shared/ui/resizable` |

### Overlays & Feedback
| Component | Import |
|-----------|--------|
| `Dialog` | `@/shared/ui/dialog` |
| `AlertDialog` | `@/shared/ui/alert-dialog` |
| `Sheet` | `@/shared/ui/sheet` — side-panel overlay |
| `Drawer` | `@/shared/ui/drawer` — bottom sheet (great for mobile) |
| `Popover` | `@/shared/ui/popover` |
| `Tooltip` | `@/shared/ui/tooltip` |
| `HoverCard` | `@/shared/ui/hover-card` |
| `ContextMenu` | `@/shared/ui/context-menu` |
| `DropdownMenu` | `@/shared/ui/dropdown-menu` |
| `Command` | `@/shared/ui/command` — command palette / searchable list |
| `Alert` | `@/shared/ui/alert` |
| `toast` | `import { toast } from 'sonner'` — `toast.success()`, `toast.error()` |

### Data Display
| Component | Import |
|-----------|--------|
| `Table` | `@/shared/ui/table` — `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` |
| `Avatar` | `@/shared/ui/avatar` |
| `Progress` | `@/shared/ui/progress` |
| `Skeleton` | `@/shared/ui/skeleton` |
| `AspectRatio` | `@/shared/ui/aspect-ratio` |
| `Carousel` | `@/shared/ui/carousel` |

### Misc
| Component | Import |
|-----------|--------|
| `Toggle` | `@/shared/ui/toggle` |
| `ToggleGroup` | `@/shared/ui/toggle-group` |
| `Collapsible` | `@/shared/ui/collapsible` |
| `ThemeToggle` | `@/shared/layout/theme-toggle` — light/dark mode switch |