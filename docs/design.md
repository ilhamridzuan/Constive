# Constive Design System & UI/UX Specification

> **Document Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-23  
> **Source Documents:** PRD v0.2 (Approved), TDD v1.0.0 (Approved)  
> **Target Implementation:** Next.js 14+ App Router · Tailwind CSS v3.4+ · shadcn/ui · TypeScript  

---

## 1. High-Level Vision & UI Architecture

### 1.1 Target Platform & Framework

| Dimension | Specification |
|:---|:---|
| **Primary Platform** | Responsive Web Application (Desktop + Mobile Browser) |
| **Desktop Viewport** | ≥1024px — Full dashboard, sidebar, Gantt Chart canvas |
| **Tablet Viewport** | 768px–1023px — Collapsible sidebar, stacked panels |
| **Mobile Viewport** | 320px–767px — Single-column layout, bottom navigation, touch-optimized forms |
| **Framework** | Next.js 14+ App Router (React Server Components, Client Components) |
| **CSS Engine** | Tailwind CSS v3.4+ with design tokens as CSS custom properties |
| **Component Library** | shadcn/ui primitives (Radix UI) with Constive theme overlay |
| **Gantt Chart Renderer** | `gantt-task-react` wrapped in `<GanttWrapper />` custom component |
| **Browser Support** | Chrome 110+, Firefox 115+, Edge 110+, Safari 16+ (last 2 years) |

### 1.2 Visual Style Summary

- **Palette Character:** **Light-Mode First Enterprise Construction Aesthetics.** High-contrast Slate/Zinc-based neutral light surface optimized for high legibility in sunlit field environments and corporate dashboards. Primary brand color: **Construction Safety Amber** (`#D97706` / HSL `38 92% 44%`) with **Safety Orange** (`#EA580C`) accents, industrial charcoal darks (`#0F172A`), and clean slate borders (`#E2E8F0`). Dark mode supported as an opt-in fallback via `next-themes`.
- **Aesthetic:** High-density data dashboard (Jira/Linear inspired) tuned for civil engineering and construction workflows. Clean borders, subtle shadows, layered surfaces, and micro-animations for state transitions.
- **Typography:** Inter (UI) + JetBrains Mono (code/monospace). System fallbacks for performance.
- **Iconography:** Lucide React icon set (consistent stroke weight: 1.5px, default size: 16px body / 20px headers).
- **Data Density:** Compact row heights (48px data tables, 40px Gantt rows), condensed card padding, maximized viewport utilization. No excessive whitespace on desktop.

### 1.3 Layout Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Top Header Bar (h-14 / 56px) — Logo · Workspace Switcher ·   │
│  Search · Notifications · User Avatar                          │
├──────────┬──────────────────────────────────────────────────────┤
│ Sidebar  │  Main Content Area                                  │
│ (w-60 /  │  ┌──────────────────────────────────────────────┐   │
│  240px)  │  │ Page Header (Breadcrumb · Title · Actions)    │   │
│          │  ├──────────────────────────────────────────────┤   │
│ Projects │  │                                              │   │
│ Daily Log│  │  Feature Content Zone                         │   │
│ Members  │  │  (Tables, Gantt Chart, Forms, Cards)          │   │
│ Settings │  │                                              │   │
│          │  │                                              │   │
│          │  └──────────────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────────────┘
```

- **Desktop (≥1024px):** Persistent sidebar (collapsible to 64px icon-only via toggle). Content area fills remaining width.
- **Tablet (768–1023px):** Sidebar collapsed to icon-only by default. Expand via hamburger overlay.
- **Mobile (<768px):** No sidebar. Bottom tab navigation bar (h-16 / 64px) with 4 tabs: Projects, Daily Log, Notifications, Profile. Top header shrinks to h-12.

---

## 2. Global Design Tokens (Quantitative Specifications)

### 2.1 Color Palette

All colors are specified as CSS custom properties for runtime theme switching. Values shown in HSL format for Tailwind CSS compatibility.

#### 2.1.1 Light Mode (Primary Default)

```css
:root {
  /* ── Brand / Primary (Construction Amber) ── */
  --primary:            38 92% 44%;      /* #D97706  — Construction Amber 600 */
  --primary-hover:      38 92% 38%;      /* #B45309  — Construction Amber 700 */
  --primary-active:     38 92% 32%;      /* #92400E  — Construction Amber 800 */
  --primary-foreground: 0 0% 100%;        /* #FFFFFF */
  --primary-muted:      48 96% 95%;      /* #FFFBEB  — Amber 50 */

  /* ── Secondary / Accent (Industrial Slate) ─ */
  --secondary:          215 20% 65%;     /* #94A3B8  — Slate 400 */
  --secondary-hover:    215 16% 57%;     /* #8492A6 */
  --secondary-foreground: 215 25% 27%;   /* #334155  — Slate 700 */

  /* ── Neutral / Surface (Light Mode First) ─ */
  --background:         0 0% 100%;       /* #FFFFFF  — Crisp White Base */
  --foreground:         222 47% 11%;     /* #0F172A  — Slate 900 Industrial Charcoal */
  --card:               210 40% 98%;     /* #F8FAFC  — Slate 50 Light Surface */
  --card-foreground:    222 47% 11%;     /* #0F172A */
  --muted:              210 40% 96%;     /* #F1F5F9  — Slate 100 */
  --muted-foreground:   215 16% 47%;     /* #64748B  — Slate 500 */
  --popover:            0 0% 100%;       /* #FFFFFF */
  --popover-foreground: 222 47% 11%;     /* #0F172A */

  /* ── Border / Divider ────────────────────── */
  --border:             214 32% 91%;     /* #E2E8F0  — Slate 200 */
  --input:              214 32% 91%;     /* #E2E8F0 */
  --ring:               38 92% 44%;      /* #D97706  — Focus ring matches primary */

  /* ── Status Indicators ───────────────────── */
  --success:            142 71% 45%;     /* #22C55E  — Green 500 */
  --success-muted:      142 77% 95%;     /* #F0FDF4  — Green 50 */
  --success-foreground: 143 64% 24%;     /* #166534  — Green 800 */

  --warning:            38 92% 50%;      /* #F59E0B  — Amber 500 */
  --warning-muted:      48 96% 95%;      /* #FFFBEB  — Amber 50 */
  --warning-foreground: 28 73% 26%;      /* #92400E  — Amber 800 */

  --danger:             0 84% 60%;       /* #EF4444  — Red 500 */
  --danger-muted:       0 86% 97%;       /* #FEF2F2  — Red 50 */
  --danger-foreground:  0 72% 31%;       /* #991B1B  — Red 800 */

  --info:               217 91% 60%;     /* #3B82F6  — Blue 500 */
  --info-muted:         214 95% 97%;     /* #EFF6FF  — Blue 50 */
  --info-foreground:    224 76% 30%;     /* #1E3A5F  — Blue 800 */

  /* ── Sidebar ─────────────────────────────── */
  --sidebar:            210 40% 98%;     /* #F8FAFC */
  --sidebar-foreground: 222 47% 11%;     /* #0F172A */
  --sidebar-border:     214 32% 91%;     /* #E2E8F0 */
  --sidebar-active:     48 96% 95%;      /* #FFFBEB  — Amber 50 */
  --sidebar-active-foreground: 38 92% 44%; /* #D97706 — Construction Amber */

  /* ── Gantt Chart Specific ────────────────── */
  --gantt-bar-todo:     215 20% 65%;     /* #94A3B8  — Slate 400 */
  --gantt-bar-progress: 38 92% 44%;      /* #D97706  — Primary Construction Amber */
  --gantt-bar-complete: 142 71% 45%;     /* #22C55E  — Green */
  --gantt-grid-line:    214 32% 91%;     /* #E2E8F0 */
  --gantt-today-line:   0 84% 60%;       /* #EF4444  — Red accent */
  --gantt-weekend-bg:   210 40% 97%;     /* #F9FAFB */

  /* ── Chart Radius & Misc ─────────────────── */
  --radius:             0.5rem;          /* 8px — Base radius */
}
```

#### 2.1.2 Dark Mode (Opt-In Fallback)

```css
.dark {
  --primary:            38 92% 50%;      /* #F59E0B — Amber 500 for dark contrast */
  --primary-hover:      38 92% 60%;      /* Lighter amber on hover */
  --primary-active:     38 92% 70%;
  --primary-foreground: 222 47% 11%;     /* #0F172A Dark text on bright amber */
  --primary-muted:      38 60% 15%;

  --secondary:          215 20% 40%;
  --secondary-hover:    215 16% 50%;
  --secondary-foreground: 210 40% 80%;

  --background:         222 47% 7%;      /* #080C14 */
  --foreground:         210 40% 96%;     /* #F1F5F9 */
  --card:               222 40% 10%;     /* #111827 */
  --card-foreground:    210 40% 96%;
  --muted:              222 35% 14%;     /* #1E293B */
  --muted-foreground:   215 16% 57%;     /* #8492A6 */
  --popover:            222 40% 10%;
  --popover-foreground: 210 40% 96%;

  --border:             222 20% 20%;     /* #1E293B lighter */
  --input:              222 20% 20%;
  --ring:               38 92% 50%;

  --success:            142 71% 45%;
  --success-muted:      142 50% 12%;
  --success-foreground: 142 80% 75%;

  --warning:            38 92% 50%;
  --warning-muted:      38 60% 12%;
  --warning-foreground: 38 90% 75%;

  --danger:             0 84% 60%;
  --danger-muted:       0 60% 12%;
  --danger-foreground:  0 80% 80%;

  --info:               217 91% 60%;
  --info-muted:         217 50% 12%;
  --info-foreground:    217 85% 80%;

  --sidebar:            222 40% 8%;
  --sidebar-foreground: 210 40% 88%;
  --sidebar-border:     222 20% 16%;
  --sidebar-active:     38 40% 14%;
  --sidebar-active-foreground: 38 92% 65%;

  --gantt-bar-todo:     215 20% 40%;
  --gantt-bar-progress: 38 92% 50%;
  --gantt-bar-complete: 142 71% 45%;
  --gantt-grid-line:    222 20% 18%;
  --gantt-today-line:   0 84% 60%;
  --gantt-weekend-bg:   222 40% 9%;
}
```

#### 2.1.3 Status Badge Color Map

| Entity Status | Badge Variant | Background (Light) | Text (Light) | Border |
|:---|:---|:---|:---|:---|
| `DRAFT` / `DRAFT_LOG` / `TODO` | `outline` | `var(--muted)` | `var(--muted-foreground)` | `var(--border)` |
| `ACTIVE` / `IN_PROGRESS` / `SUBMITTED` | `default` (primary) | `var(--info-muted)` | `var(--info-foreground)` | `var(--info)` |
| `COMPLETED` / `VERIFIED_PM` | `success` | `var(--success-muted)` | `var(--success-foreground)` | `var(--success)` |
| `ARCHIVED` | `secondary` | `var(--muted)` | `var(--muted-foreground)` | `var(--border)` |
| `REVISION_REQUESTED` | `warning` | `var(--warning-muted)` | `var(--warning-foreground)` | `var(--warning)` |
| `EXPIRED` / `REVOKED` | `destructive` | `var(--danger-muted)` | `var(--danger-foreground)` | `var(--danger)` |
| `PENDING` | `outline` | `var(--warning-muted)` | `var(--warning-foreground)` | `var(--warning)` |
| `ACCEPTED` | `success` | `var(--success-muted)` | `var(--success-foreground)` | `var(--success)` |

### 2.2 Typography Scale

| Token Name | Font Family | Font Size | Font Weight | Line Height | Letter Spacing | Use Case |
|:---|:---|:---|:---|:---|:---|:---|
| `display` | Inter | 30px / `text-3xl` | 700 `font-bold` | 36px / `leading-9` | `-0.025em` `tracking-tight` | Hero headings, landing page |
| `h1` | Inter | 24px / `text-2xl` | 600 `font-semibold` | 32px / `leading-8` | `-0.025em` `tracking-tight` | Page titles |
| `h2` | Inter | 20px / `text-xl` | 600 `font-semibold` | 28px / `leading-7` | `-0.01em` | Section headings |
| `h3` | Inter | 16px / `text-base` | 600 `font-semibold` | 24px / `leading-6` | `0em` | Card titles, dialog headings |
| `h4` | Inter | 14px / `text-sm` | 600 `font-semibold` | 20px / `leading-5` | `0em` | Sub-section labels |
| `body` | Inter | 14px / `text-sm` | 400 `font-normal` | 20px / `leading-5` | `0em` | Default body text, form labels |
| `body-small` | Inter | 13px / `text-[13px]` | 400 `font-normal` | 18px / `leading-[18px]` | `0em` | Table cell text, compact data |
| `caption` | Inter | 12px / `text-xs` | 400 `font-normal` | 16px / `leading-4` | `0.01em` | Timestamps, metadata, help text |
| `overline` | Inter | 11px / `text-[11px]` | 500 `font-medium` | 16px / `leading-4` | `0.05em` `tracking-wider` | Section labels, badge text (uppercase) |
| `mono` | JetBrains Mono | 13px / `text-[13px]` | 400 `font-normal` | 20px / `leading-5` | `0em` | UUIDs, API paths, code snippets |

**Font Loading (Next.js `next/font`):**
```typescript
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
```

### 2.3 Spacing & Layout Grid

Based on an **8px base grid** with 4px half-step for fine-tuning.

| Token | Value | Tailwind Class | Use Case |
|:---|:---|:---|:---|
| `space-0` | 0px | `p-0` / `m-0` | Reset |
| `space-0.5` | 2px | `p-0.5` | Micro gap (badge inner padding) |
| `space-1` | 4px | `p-1` / `gap-1` | Icon-to-text gap, tight inline spacing |
| `space-2` | 8px | `p-2` / `gap-2` | Default inner component padding |
| `space-3` | 12px | `p-3` / `gap-3` | Card inner padding (compact) |
| `space-4` | 16px | `p-4` / `gap-4` | Standard section padding, form field gap |
| `space-5` | 20px | `p-5` / `gap-5` | Dialog inner padding |
| `space-6` | 24px | `p-6` / `gap-6` | Page content horizontal padding (desktop) |
| `space-8` | 32px | `p-8` / `gap-8` | Section vertical separation |
| `space-10` | 40px | `p-10` | Page-level vertical padding |
| `space-12` | 48px | `p-12` | Large section separation |

**Content Max-Width Constraints:**

| Context | Max Width | Tailwind |
|:---|:---|:---|
| Auth pages (Login/Signup) | 420px | `max-w-[420px]` |
| Form content (Daily Log) | 640px | `max-w-[640px]` |
| Settings panels | 768px | `max-w-3xl` |
| Dashboard content | 100% (fluid) | `w-full` |
| Gantt Chart canvas | 100% (fluid, horizontal scroll) | `w-full overflow-x-auto` |

### 2.4 Borders, Radius & Shadows

#### Border Radius Scale

| Token | Value | Tailwind | Use Case |
|:---|:---|:---|:---|
| `radius-none` | 0px | `rounded-none` | Table cells, Gantt bars |
| `radius-sm` | 4px | `rounded-sm` | Badges, small pills |
| `radius-md` | 6px | `rounded-md` | Buttons, inputs, selects |
| `radius-lg` | 8px | `rounded-lg` | Cards, dialogs, popovers |
| `radius-xl` | 12px | `rounded-xl` | Modal overlays, large cards |
| `radius-full` | 9999px | `rounded-full` | Avatars, circular indicators |

#### Elevation / Shadow Scale

| Level | CSS Shadow Value | Tailwind | Use Case |
|:---|:---|:---|:---|
| `shadow-none` | `none` | `shadow-none` | Flat elements within cards |
| `shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `shadow-xs` | Subtle card lift |
| `shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | `shadow-sm` | Cards, sidebar |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | `shadow-md` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | `shadow-lg` | Modals, floating panels |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | `shadow-xl` | Command palette overlays |

#### Z-Index Layers

| Token | Value | Use Case |
|:---|:---|:---|
| `z-sidebar` | `30` | Sidebar overlay (mobile) |
| `z-header` | `40` | Top header bar |
| `z-dropdown` | `50` | Dropdowns, popovers, tooltips |
| `z-modal` | `60` | Modals, dialogs |
| `z-toast` | `70` | Toast notifications |
| `z-command` | `80` | Command palette |

---

## 3. Feature-by-Feature UI/UX Layout Specifications

### 3.1 [FT-004] Authentication & User Identity

#### 3.1.1 Page: Sign Up (`/signup`)

**Layout Structure:**
- Centered single-column card layout (`max-w-[420px]`), vertically centered (`min-h-screen flex items-center justify-center`).
- Left decorative panel (desktop only, ≥1024px): full-bleed gradient or construction imagery (`w-1/2`).
- Right panel: auth form (`w-1/2` desktop, `w-full` mobile).

**Form Fields:**

| Field | Input Type | Validation | shadcn Component |
|:---|:---|:---|:---|
| Full Name | `<Input>` text | Required, min 2 chars | `Input` |
| Email | `<Input>` email | Required, RFC 5322 format | `Input` |
| Password | `<Input>` password + visibility toggle | Required, min 8 chars, must contain uppercase, lowercase, digit | `Input` + `Button` (eye icon) |

**Password Strength Indicator:**
- 4-segment horizontal bar below password field.
- Segments fill from left-to-right: 1 = Weak (danger), 2 = Fair (warning), 3 = Good (info), 4 = Strong (success).
- Each segment: `h-1 rounded-full`, gap `2px`, transition `transition-all duration-300`.

**Interactive States:**
- **Default:** Neutral borders `var(--border)`, placeholder text `var(--muted-foreground)`.
- **Focus:** Ring `ring-2 ring-ring ring-offset-2`, border changes to `var(--primary)`.
- **Error:** Border `border-danger`, error text below field in `text-xs text-danger`, shake animation `animate-shake` (200ms).
- **Loading (Submit):** Button shows `<Loader2 className="animate-spin" />` spinner icon + text "Mendaftar…". Button disabled (`opacity-60 pointer-events-none`).
- **Success:** Redirect to email verification pending screen.

**Action Buttons:**
- Primary CTA: `<Button>` full-width, `h-10`, text "Daftar".
- OAuth Section: Horizontal rule with "atau lanjutkan dengan" label. Two secondary buttons: Google icon + "Google", Microsoft icon + "Microsoft". Each `variant="outline" h-10`.
- Footer link: "Sudah punya akun? **Masuk**" → navigates to `/login`.

**Invite Flow Variant (Pre-filled Email):**
- When URL contains `?invite_token=XYZ`, email field pre-filled and set to `readOnly` with `bg-muted cursor-not-allowed`.
- Banner at top of form: `<Alert variant="info">` — "Anda diundang ke workspace **{workspaceName}** sebagai **{roleName}**".

#### 3.1.2 Page: Login (`/login`)

**Layout:** Identical split-panel structure to Sign Up.

**Form Fields:**

| Field | Input Type | Validation |
|:---|:---|:---|
| Email | `<Input>` email | Required, valid format |
| Password | `<Input>` password + visibility toggle | Required |

**Additional Elements:**
- "Lupa password?" link: `text-sm text-primary hover:underline`, positioned right-aligned below password field.
- "Login via Magic Link" link: below the main form, styled as `text-sm text-muted-foreground hover:text-primary`.
- "Belum punya akun? **Daftar**" footer link.

**Error State: Unverified Email:**
- Alert banner `<Alert variant="warning">` — "Email Anda belum diverifikasi."
- Secondary action button: "Kirim Ulang Email Verifikasi" (`variant="outline" size="sm"`).

#### 3.1.3 Page: Forgot Password (`/forgot-password`)

**Layout:** Centered card (`max-w-[420px]`), no split panel.

**Flow:**
1. Email input field + Submit button "Kirim Tautan Reset".
2. On submit success → show confirmation UI: mail icon illustration + "Jika email terdaftar, instruksi reset password telah dikirim." + "Kembali ke Login" link.

#### 3.1.4 Page: Reset Password (`/reset-password`)

**Layout:** Centered card (`max-w-[420px]`).

**Form Fields:**
- New Password + Confirm Password fields with strength indicator.
- Submit: "Simpan Password Baru".
- **Expired Token State:** Error card with icon + "Tautan reset password telah kedaluwarsa." + Button "Minta Tautan Baru".

#### 3.1.5 Page: Accept Invite (`/accept-invite`)

**Layout:** Centered card (`max-w-[420px]`).

**Flow:**
1. Loading state: Skeleton card with spinner while validating token via `GET /api/v1/workspaces/invitations/:token`.
2. **Valid Token:** Display workspace name, logo placeholder, inviter name, assigned role. Two CTAs:
   - If email registered: "Masuk untuk Bergabung" → redirect `/login`
   - If email not registered: "Daftar untuk Bergabung" → redirect `/signup?invite_token=XYZ`
3. **Invalid/Expired Token:** Error card: "Tautan undangan tidak berlaku atau telah kedaluwarsa." + "Kembali ke Halaman Utama" button.

---

### 3.2 [FT-001] Workspace Management & Member Invitation

#### 3.2.1 Page: Workspace Switcher / Home (`/workspace`)

**Trigger:** Shown after login when user belongs to multiple workspaces, or via workspace switcher dropdown in header.

**Layout:** Grid of `<WorkspaceCard />` components (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`).

**WorkspaceCard Anatomy:**
```
┌────────────────────────────────────┐
│  [Logo/Initial Avatar]  WS Name   │  ← h3 + badge (subscription plan)
│  slug: pt-konstruksi-jaya         │  ← caption, monospace
│  12 members · 5 projects          │  ← body-small, muted
│  Your Role: Admin                 │  ← badge variant
│                          [Enter →]│  ← ghost button with arrow
└────────────────────────────────────┘
```

- Hover: `border-primary/50 shadow-md transition-all duration-200`.
- Click: Navigate to `/workspace/[workspaceId]`.

**Create Workspace CTA:** Dashed border card (`border-dashed border-2`) with "+" icon and "Buat Workspace Baru" text.

#### 3.2.2 Page: Workspace Dashboard (`/workspace/[workspaceId]`)

**Layout:** Standard sidebar + main content.

**Content Zones:**
1. **Quick Stats Row:** 3–4 metric cards (`grid grid-cols-2 lg:grid-cols-4 gap-4`):
   - "Proyek Aktif" — count + icon
   - "Total Anggota" — count + icon
   - "Laporan Hari Ini" — count + icon
   - "Tugas Berjalan" — count + icon
2. **Recent Activity Feed:** Vertical timeline list of recent actions (log submissions, task updates, member joins). Max 10 items, "Lihat Semua" link.
3. **Active Projects Grid:** Compact project cards with progress bars.

#### 3.2.3 Page: Team Members Settings (`/workspace/[workspaceId]/settings/members`)

**Layout:** Settings page with content `max-w-3xl`.

**Header Actions:**
- "Undang Anggota" primary button → opens `<InviteMemberModal />`.
- Member count badge.

**Member List Table (`<MemberListTable />`):**

| Column | Width | Content |
|:---|:---|:---|
| Member | 40% | Avatar (32px rounded-full) + Full Name + Email (caption) |
| Role | 20% | `<Select>` dropdown (for Admin) or `<Badge>` (for others). Values: OWNER, ADMIN, PROJECT_MANAGER, SUPERVISOR |
| Status | 15% | Badge: Active (green), Pending (amber) |
| Joined | 15% | Relative date ("3 hari lalu") |
| Actions | 10% | `<DropdownMenu>` — Change Role, Remove Member |

- **Row Height:** 56px (`h-14`).
- **Empty State:** Illustration + "Belum ada anggota. Mulai undang tim Anda." + CTA button.
- **Pending Invitations Section:** Separate collapsible section below member table showing pending invitations with "Batalkan" and "Kirim Ulang" actions.

#### 3.2.4 Component: Invite Member Modal (`<InviteMemberModal />`)

**Trigger:** "Undang Anggota" button.

**Structure:** `<Dialog>` (shadcn) with:
- Title: "Undang Anggota Baru"
- Description: "Kirim undangan email ke anggota tim Anda."
- Form:
  - Email input (`<Input type="email">`)
  - Role selector (`<Select>` — ADMIN, PROJECT_MANAGER, SUPERVISOR)
- Footer: "Batal" (ghost) + "Kirim Undangan" (primary).
- **Quota Warning:** If workspace near limit, show `<Alert variant="warning">` — "Workspace ini memiliki {n}/{max} anggota. Peran Admin/PM akan menghitung kuota Paid Seats."
- **Quota Exceeded:** Disable submit + `<Alert variant="destructive">` — "Kuota pengguna paket Free telah tercapai. Silakan lakukan upgrade ke paket Standard." + "Upgrade" link.

**Invite Link / QR Code Tab:**
- Secondary tab within the modal: "Tautan Undangan".
- Displays generated invite URL with "Salin" (copy) button.
- QR Code rendered below (128×128px) for field worker scanning.

---

### 3.3 [FT-002] Interactive Gantt Chart & Real-Time Collaboration

#### 3.3.1 Page: Project Gantt View (`/workspace/[workspaceId]/projects/[projectId]/gantt`)

**Layout Structure:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Page Header: "Gantt Chart — {projectName}"                      │
│  [+ Tambah Tugas] [Zoom: Hari|Minggu|Bulan] [Filter▼] [⋮ More]  │
├───────────────────────┬──────────────────────────────────────────┤
│  Task List Panel      │  Gantt Timeline Canvas                   │
│  (w-[320px] min)      │  (flex-1, overflow-x-auto)               │
│                       │                                          │
│  ☐ Pekerjaan Pondasi  │  ████████████░░░░░░░  60%               │
│    ☐ Tiang Pancang    │    ██████████████████  100%              │
│    ☐ Pondasi Strip    │    ██████░░░░░░░░░░░  30%               │
│  ☐ Struktur Lantai 1  │         ████████████░░░░░  75%          │
│                       │                                          │
│                       │  ↕ Today line (red dashed)               │
├───────────────────────┴──────────────────────────────────────────┤
│  [Presence Avatars: "PM Ahmad sedang mengedit..."]               │
└──────────────────────────────────────────────────────────────────┘
```

**Task List Panel (Left):**
- Tree view with collapse/expand chevrons.
- Each row `h-40px`, border-bottom `var(--border)`.
- Columns: Checkbox (select), Task Name (ellipsis overflow), Status Badge, Progress %.
- Indentation: `pl-{level * 6}` per nesting depth (24px per level).
- Click row → opens `<TaskEditorDialog />`.

**Gantt Timeline Canvas (Right):**
- Rendered by `gantt-task-react` wrapped in `<GanttWrapper />`.
- **Bar Colors:** Status-driven (see `--gantt-bar-*` tokens).
- **Progress Fill:** Filled portion uses lighter shade, remaining uses muted.
- **Today Line:** Vertical dashed line (`border-l-2 border-dashed border-danger`).
- **Weekend Columns:** Background `var(--gantt-weekend-bg)`.
- **Dependency Arrows:** Thin line (`1px`) with arrowhead, color `var(--muted-foreground)`.

**Toolbar (`<GanttToolbar />`):**
- "+ Tambah Tugas" → primary button.
- Zoom level toggle: `<ToggleGroup>` — "Hari" | "Minggu" | "Bulan".
- Filter dropdown: By status (TODO, IN_PROGRESS, COMPLETED), by assignee.
- Fullscreen toggle icon button.

**Drag & Drop Interactions:**
- **Bar Resize (Drag End):** Cursor changes to `col-resize`. Optimistic UI updates duration/end_date. On failure → rollback + toast "Gagal menyinkronkan perubahan."
- **Bar Move (Drag Body):** Moves start_date and end_date together. Same rollback behavior.
- **Visual Feedback During Drag:** Bar gets `opacity-80 ring-2 ring-primary`. Drop target date column highlighted.

**Real-Time Presence (`<PresenceAvatars />`):**
- Horizontal avatar stack at bottom of Gantt page.
- Each avatar: 28px `rounded-full` with colored border ring indicating user color.
- Tooltip on hover: "{userName} sedang aktif".
- **Editing Lock Indicator:** When another PM is editing a task, the task bar shows a lock icon overlay + pulsing border. Tooltip: "Sedang diedit oleh {userName}".

#### 3.3.2 Component: Task Editor Dialog (`<TaskEditorDialog />`)

**Trigger:** Click task name in list or double-click Gantt bar.

**Structure:** `<Sheet>` side panel (from right, `w-[480px]`) or `<Dialog>` on mobile.

**Form Fields:**

| Field | Type | Notes |
|:---|:---|:---|
| Task Name | `<Input>` | Required, max 200 chars |
| Description | `<Textarea>` | Optional, max 2000 chars |
| Status | `<Select>` | TODO, IN_PROGRESS, COMPLETED |
| Start Date | `<DatePicker>` (shadcn) | Required |
| End Date | `<DatePicker>` | Required, must be ≥ start_date |
| Progress | `<Slider>` 0–100% | Step 5, label shows current % |
| Parent Task | `<Combobox>` searchable | List of existing tasks |
| Predecessor | `<Combobox>` searchable | Dependency link |

**Footer:** "Batal" (ghost) + "Simpan Perubahan" (primary) + "Hapus Tugas" (destructive, icon only, far right).

**Validation Error:** `end_date < start_date` → inline error text on End Date field.
**Circular Dependency:** If selecting a predecessor creates a cycle → inline error "Dependensi melingkar terdeteksi. Pilih tugas lain."

---

### 3.4 [FT-003] Daily Log Form & Visual Documentation (Mobile-Friendly)

#### 3.4.1 Page: Daily Logs List (`/workspace/[workspaceId]/projects/[projectId]/daily-logs`)

**Layout:** Desktop: data table. Mobile: card list.

**Desktop Table Columns:**

| Column | Width | Content |
|:---|:---|:---|
| Tanggal | 15% | Date formatted "22 Jul 2026" |
| Pengawas | 20% | Avatar + Name |
| Cuaca | 10% | Weather icon + label (☀️ Cerah, 🌧️ Hujan, ☁️ Berawan, 🌦️ Gerimis) |
| Pekerja | 10% | Number with person icon |
| Status | 15% | Status badge (per status map in §2.1.3) |
| Catatan | 20% | Truncated text (ellipsis at 80 chars) |
| Aksi | 10% | View, Verify (PM only), Request Revision (PM only) |

- **Row Height:** 48px.
- **Filters:** Date range picker, status filter, supervisor filter.
- **Empty State:** Illustration + "Belum ada laporan harian untuk proyek ini." + "Buat Laporan" CTA.

**Mobile Card List (`<LogCardList />`):**
```
┌──────────────────────────────────┐
│  22 Jul 2026         [SUBMITTED] │  ← date + status badge
│  ☀️ Cerah · 👷 12 pekerja        │  ← weather + labor
│  Pengecoran kolom lantai 1...    │  ← notes truncated
│  📷 3 foto                       │  ← media count
│  Oleh: Budi Pengawas             │  ← supervisor
└──────────────────────────────────┘
```
- Gap between cards: `gap-3`.
- Tap card → navigate to detail view.

#### 3.4.2 Page: New Daily Log Form (`/workspace/[workspaceId]/projects/[projectId]/daily-logs/new`)

**Layout:** Mobile-first single column (`max-w-[640px] mx-auto`). Generous touch targets (min 44×44px tap area).

**Form Sections (Vertical Stack, `gap-6`):**

**Section 1: Project & Date**
- Project: Read-only badge (derived from URL context).
- Date: `<DatePicker>` defaulting to today. Cannot select future dates.

**Section 2: Weather Condition (`<WeatherSelector />`)**
- 4-option grid (`grid grid-cols-4 gap-2` on mobile, `gap-3` on desktop).
- Each option: square card (`aspect-square`), large icon (32px), label below.
- Options: ☀️ Cerah | ☁️ Berawan | 🌦️ Gerimis | 🌧️ Hujan.
- Selected state: `border-2 border-primary bg-primary-muted`.
- Unselected: `border border-border bg-card`.

**Section 3: Labor Count**
- `<Input type="number">` with stepper (+/−) buttons flanking the input.
- Min value: 0. Placeholder: "0".
- Large text size on mobile (`text-xl` for the number).

**Section 4: Notes / Catatan**
- `<Textarea>` with `min-h-[100px]` and character counter ("0 / 2000").
- Placeholder: "Catatan pekerjaan hari ini, kendala yang dihadapi..."

**Section 5: Photo Upload (`<PhotoUploader />`)**
- Drop zone area: `border-2 border-dashed border-border rounded-lg p-6 text-center`.
- Mobile: Large "📷 Ambil Foto / Pilih dari Galeri" button (`h-12 w-full`). Triggers `<input type="file" accept="image/jpeg,image/png" capture="environment" multiple>`.
- Desktop: Drag-and-drop zone + browse button.
- **Preview Grid:** `grid grid-cols-3 gap-2`. Each preview:
  - Thumbnail (`aspect-square object-cover rounded-md`).
  - "×" remove button (top-right corner, `absolute`).
  - File size label below (`text-xs text-muted-foreground`).
  - Upload progress bar (animated, `h-1 bg-primary` beneath thumbnail).
- **Validation:**
  - File > 5MB: Toast error "File gambar terlalu besar (Maksimal 5 MB)". File rejected, not added to preview.
  - Invalid format: Toast error "Format file tidak didukung. Gunakan JPG atau PNG."
  - Max 10 photos per log (UI-enforced).

**Section 6: Submit Actions**
- "Simpan Draf" — secondary button (`variant="outline"`). Saves to `localStorage` via `useDailyLogDraft` hook.
- "Kirim Laporan" — primary button (`h-12 w-full text-base font-semibold`). Disabled until weather and labor_count are filled and at least 1 photo is attached.
- Auto-save draft indicator: "Draf tersimpan otomatis" caption with checkmark icon, debounced (2s interval).

**Offline / Draft Persistence:**
- All text field values auto-saved to `localStorage` keyed by `draft:dailylog:{projectId}:{date}`.
- On page load: check for existing draft and hydrate form. Show `<Alert variant="info">` — "Draf laporan ditemukan. Data sebelumnya telah dimuat."
- On successful submit: clear draft from `localStorage`.

#### 3.4.3 Component: Daily Log Detail / Review View

**Trigger:** PM clicks on a submitted log in the list.

**Layout:** `<Sheet>` side panel (right, `w-[560px]`) or full-page on mobile.

**Content Sections:**
1. **Header:** Date + Status badge + Supervisor name.
2. **Data Grid:** Weather | Labor Count | Submitted At — in a 3-column summary bar.
3. **Notes:** Full text rendering.
4. **Photo Gallery:** Grid of thumbnails (`grid grid-cols-3 gap-2`). Click opens lightbox (full-screen image viewer with prev/next navigation, close button).
5. **PM Actions (visible only to PM/Admin/Owner):**
   - "Verifikasi Laporan" — success button (`variant="default"` with green styling).
   - "Minta Revisi" — warning button. On click → expand text area for `revision_notes` (required, min 10 chars). Submit: "Kirim Permintaan Revisi".

**Revision State Display:**
- When status is `REVISION_REQUESTED`: Yellow banner at top with PM's revision notes.
- Supervisor sees: "Kirim Ulang" button that re-opens the form pre-filled with existing data.

---

### 3.5 Shared Layout Components

#### 3.5.1 Top Header Bar (`<Header />`)

**Dimensions:** `h-14` (56px), full width, `sticky top-0 z-header`.

**Layout:** `flex items-center justify-between px-4`.

**Left Section:**
- Sidebar toggle button (hamburger icon, `md:hidden`).
- Logo: "Constive" logomark (28px icon) + wordmark (hidden on mobile).
- `<WorkspaceSwitcher />`: Dropdown showing current workspace name + role. Chevron-down icon. Popover list of workspaces.

**Right Section:**
- Search trigger: `<Button variant="outline" size="icon">` magnifying glass icon. Opens `<CommandPalette />` (⌘+K).
- Notification bell icon with unread count badge (red dot, `absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full`).
- `<UserNav />`: Avatar (32px, `rounded-full`) with dropdown — Profile, Theme toggle (Sun/Moon icon), Sign Out.

#### 3.5.2 Sidebar (`<Sidebar />`)

**Dimensions:** `w-60` (240px) expanded, `w-16` (64px) collapsed. `h-[calc(100vh-56px)]`.

**Sections:**
1. **Workspace Section** (top):
   - Workspace name + plan badge.
   - "Proyek" label (overline).
2. **Navigation Items:**
   - Dashboard (Home icon)
   - Proyek (Folder icon) → nested list of active projects
   - Laporan Harian (FileText icon)
3. **Workspace Settings** (bottom, divider above):
   - Anggota Tim (Users icon)
   - Pengaturan (Settings icon)
   - Collapse toggle (ChevronLeft/ChevronRight icon)

**Nav Item States:**
- Default: `text-sidebar-foreground hover:bg-sidebar-active/50 px-3 py-2 rounded-md transition-colors duration-150`.
- Active: `bg-sidebar-active text-sidebar-active-foreground font-medium`.
- Icon-only mode: Tooltip on hover showing full label.

#### 3.5.3 Workspace Switcher (`<WorkspaceSwitcher />`)

**Trigger:** Click on workspace name in header.

**Popover Content:**
- Search input (filter workspaces).
- List of workspaces: Avatar/Initial + Name + Role badge.
- Divider.
- "+ Buat Workspace Baru" link.

---

## 4. Component Library & Anatomy Specifications

### 4.1 Buttons

**Variants (shadcn `<Button>`):**

| Variant | Background | Text | Border | Use Case |
|:---|:---|:---|:---|:---|
| `default` | `bg-primary` | `text-primary-foreground` | none | Primary actions: Submit, Save |
| `destructive` | `bg-danger` | `text-white` | none | Delete, Remove, Revoke |
| `outline` | `bg-transparent` | `text-foreground` | `border border-input` | Secondary: Cancel, Dismiss |
| `secondary` | `bg-secondary/20` | `text-secondary-foreground` | none | Tertiary actions |
| `ghost` | `bg-transparent` | `text-foreground` | none | Inline actions, icon buttons |
| `link` | `bg-transparent` | `text-primary` | none | Inline text links |

**Sizes:**

| Size | Height | Padding | Font Size | Icon Size |
|:---|:---|:---|:---|:---|
| `sm` | 32px / `h-8` | `px-3` | `text-xs` | 14px |
| `default` | 36px / `h-9` | `px-4` | `text-sm` | 16px |
| `lg` | 40px / `h-10` | `px-6` | `text-sm` | 16px |
| `icon` | 36px / `h-9 w-9` | `p-0` | — | 16px |

**States:**
- **Hover:** Darken 10% (`hover:bg-primary-hover`).
- **Active/Pressed:** Darken 15% + slight scale `active:scale-[0.98]`.
- **Focus:** `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- **Disabled:** `opacity-50 pointer-events-none`.
- **Loading:** Spinner icon replaces label or precedes it. Button disabled.

### 4.2 Data Tables

**Base Configuration (shadcn `<Table>`):**
- Row height: 48px (`h-12`).
- Header: `bg-muted/50 text-muted-foreground font-medium text-xs uppercase tracking-wider`.
- Body text: `text-sm text-foreground`.
- Row hover: `hover:bg-muted/30 transition-colors`.
- Row border: `border-b border-border`.
- Striped (optional): `even:bg-muted/20`.

**Pagination:**
- Bottom bar: "Menampilkan 1–10 dari 47 entri" text (left) + page controls (right).
- Page buttons: `<Button variant="outline" size="sm">`.
- Items-per-page selector: `<Select>` — 10, 25, 50.

**Loading State (Skeleton):**
- Replace each cell content with `<Skeleton className="h-4 w-3/4 rounded" />`.
- Show 5 skeleton rows.
- Subtle pulse animation (`animate-pulse`).

**Empty State:**
- Centered in table body: illustration SVG (64px) + text "Tidak ada data ditemukan." + optional CTA button.

### 4.3 Status Badges

**Base:** `<Badge>` (shadcn) with custom variants.

**Anatomy:** `inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium uppercase tracking-wider border`.

**Dot Indicator:** Small circle (`w-1.5 h-1.5 rounded-full`) preceding text, color matching the badge variant.

| Variant | Background | Text | Border | Dot Color |
|:---|:---|:---|:---|:---|
| `success` | `bg-success-muted` | `text-success-foreground` | `border-success/30` | `bg-success` |
| `warning` | `bg-warning-muted` | `text-warning-foreground` | `border-warning/30` | `bg-warning` |
| `destructive` | `bg-danger-muted` | `text-danger-foreground` | `border-danger/30` | `bg-danger` |
| `info` | `bg-info-muted` | `text-info-foreground` | `border-info/30` | `bg-info` |
| `outline` | `bg-transparent` | `text-muted-foreground` | `border-border` | `bg-muted-foreground` |

### 4.4 Form Controls

**Text Input (`<Input>`):**
- Height: `h-9` (36px) desktop, `h-11` (44px) mobile (min touch target).
- Padding: `px-3`.
- Border: `border border-input rounded-md`.
- Focus: `focus-visible:ring-2 focus-visible:ring-ring`.
- Error: `border-danger focus-visible:ring-danger`.
- Disabled: `bg-muted opacity-50 cursor-not-allowed`.

**Select (`<Select>`):**
- Same dimensions as Input.
- Chevron icon right-aligned.
- Popover dropdown with `shadow-md rounded-lg`.

**Textarea (`<Textarea>`):**
- Min height: `min-h-[80px]`.
- Resize: `resize-y` (vertical only).
- Character counter: positioned `absolute bottom-2 right-3 text-xs text-muted-foreground`.

**Date Picker (`<DatePicker>`):**
- Button trigger styled as Input.
- Calendar popover using shadcn `<Calendar>`.
- Selected date highlighted with `bg-primary text-primary-foreground rounded-md`.
- Today indicator: underline dot.

**Form Field Layout:**
```
┌───────────────────────────────┐
│  Label (text-sm font-medium)   │  ← gap-1.5 between label and input
│  ┌───────────────────────────┐ │
│  │  Input / Select / etc.    │ │
│  └───────────────────────────┘ │
│  Helper text or error message  │  ← text-xs, muted or danger
└───────────────────────────────┘
```
- Gap between fields: `gap-4` (16px).
- Label: `text-sm font-medium text-foreground`.
- Required indicator: red asterisk `<span className="text-danger ml-0.5">*</span>`.

### 4.5 Modals / Dialogs

**Base (`<Dialog>`):**
- Overlay: `bg-black/50 backdrop-blur-sm`.
- Container: `bg-popover rounded-xl shadow-xl p-0`.
- Max width: `max-w-md` (448px) for forms, `max-w-lg` (512px) for confirmations.
- Animation: `data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95`.

**Header:** `px-6 pt-6 pb-0`.
- Title: `h3` typography.
- Description: `body` text, `text-muted-foreground`.
- Close button: top-right corner, `<Button variant="ghost" size="icon">` with X icon.

**Body:** `px-6 py-4`.

**Footer:** `px-6 pb-6 pt-2 flex justify-end gap-2`.
- Left action (destructive): aligned left with `mr-auto`.

**Destructive Confirmation Dialog:**
- Red warning icon (triangle-alert, 48px, `text-danger`).
- Title: "Hapus {item}?"
- Description: "Tindakan ini tidak dapat dibatalkan."
- Type-to-confirm input: User types resource name to enable delete button.
- Footer: "Batal" + "Hapus Permanen" (destructive, disabled until confirmed).

### 4.6 Toast Notifications

**Position:** `bottom-right` (desktop), `top-center` (mobile).

**Variants:**

| Variant | Icon | Border-Left Color | Duration |
|:---|:---|:---|:---|
| `default` | Info circle | `var(--primary)` | 5s |
| `success` | Check circle | `var(--success)` | 4s |
| `warning` | Alert triangle | `var(--warning)` | 6s |
| `destructive` | X circle | `var(--danger)` | 8s (persistent until dismissed for critical errors) |

**Anatomy:**
```
┌───────────────────────────────────────┐
│ [Icon]  Title (font-semibold text-sm) │
│         Description (text-xs muted)   │
│                              [× Close]│
└───────────────────────────────────────┘
```
- Max width: 420px. Min width: 320px.
- Animation: slide-in from right + fade-in.
- Stack: max 3 visible, older toasts pushed up.

### 4.7 Cards

**Base (`<Card>`):**
- Background: `bg-card`.
- Border: `border border-border`.
- Radius: `rounded-lg`.
- Padding: `p-4` (compact) or `p-6` (standard).
- Shadow: `shadow-xs` default, `shadow-sm hover:shadow-md transition-shadow` for interactive cards.

**Metric/Stat Card:**
```
┌────────────────────────────┐
│  📊 Proyek Aktif           │  ← caption, icon + label
│  12                        │  ← h2, font-bold
│  ↑ 3 dari bulan lalu       │  ← caption, text-success
└────────────────────────────┘
```

### 4.8 Loading States

**Skeleton Screens:**
- Use `<Skeleton>` component with `animate-pulse bg-muted rounded`.
- Match exact dimensions and layout of the loaded content.
- Show skeletons for: page content, table rows (5 rows), cards (3–4 cards), form fields.

**Spinner:**
- Use `<Loader2>` from Lucide with `animate-spin`.
- Sizes: 16px (inline), 24px (button), 32px (page-level).
- Color: `text-primary` for primary context, `text-muted-foreground` for neutral.

**Full Page Loading:**
- Centered spinner + "Memuat…" text.
- Background: `bg-background`.

### 4.9 Empty States

Every data-driven view MUST have an empty state:

**Pattern:**
```
┌──────────────────────────────────────┐
│           [Illustration]             │  ← 96px SVG/illustration
│                                      │
│     {contextual title}               │  ← h3
│     {helpful description text}       │  ← body, text-muted-foreground
│                                      │
│     [Primary CTA Button]            │  ← e.g., "Buat Proyek Pertama"
└──────────────────────────────────────┘
```

| View | Title | Description | CTA |
|:---|:---|:---|:---|
| Projects list | "Belum ada proyek" | "Buat proyek konstruksi pertama untuk memulai." | "Buat Proyek Baru" |
| Gantt tasks | "Belum ada tugas" | "Tambahkan tugas pertama ke jadwal proyek." | "Tambah Tugas" |
| Daily logs | "Belum ada laporan" | "Laporan harian dari lapangan akan muncul di sini." | "Buat Laporan Baru" |
| Members | "Belum ada anggota" | "Undang tim Anda untuk mulai berkolaborasi." | "Undang Anggota" |
| Notifications | "Tidak ada notifikasi" | "Anda sudah up-to-date!" | — |

---

## 5. Accessibility (A11y) & Usability Guardrails

### 5.1 WCAG 2.1 AA Compliance

| Requirement | Specification | Implementation |
|:---|:---|:---|
| **Color Contrast (Text)** | Minimum 4.5:1 ratio for body text, 3:1 for large text (≥18px bold / ≥24px regular) | All token pairs validated. `--foreground` on `--background` = 15.4:1. `--muted-foreground` on `--background` = 4.6:1. |
| **Color Contrast (UI Components)** | Minimum 3:1 ratio for interactive component boundaries | Button borders, form input borders, focus rings all validated. |
| **Color Independence** | Never use color as the sole indicator of state | All status badges include text label + optional dot indicator. Error states include icon + text, not just red border. |
| **Motion Sensitivity** | Respect `prefers-reduced-motion` | All animations wrapped in `motion-safe:` Tailwind modifier. Provide `@media (prefers-reduced-motion: reduce)` CSS fallback. |
| **Touch Targets** | Minimum 44×44px tap target on mobile | All buttons, links, and interactive elements on mobile use `min-h-[44px] min-w-[44px]`. |

### 5.2 Keyboard Navigation

| Context | Key | Action |
|:---|:---|:---|
| **Global** | `⌘/Ctrl + K` | Open Command Palette / Search |
| **Global** | `Escape` | Close active modal, dropdown, or popover |
| **Global** | `Tab` | Move focus to next focusable element |
| **Global** | `Shift + Tab` | Move focus to previous focusable element |
| **Modal** | `Tab` (within modal) | Focus trap: cycles within modal boundaries |
| **Modal** | `Enter` on primary CTA | Submit / Confirm action |
| **Table** | `Arrow Up/Down` | Navigate between rows |
| **Select / Dropdown** | `Arrow Up/Down` | Navigate options |
| **Select / Dropdown** | `Enter` | Select highlighted option |
| **Select / Dropdown** | `Escape` | Close dropdown |
| **Gantt Chart** | `Arrow Left/Right` | Pan timeline view |
| **Gantt Chart** | `+` / `−` | Zoom in / out |
| **Toast** | `Escape` | Dismiss active toast |

**Focus Indicators:**
- All interactive elements MUST show `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none`.
- Focus ring color: `var(--ring)` (matches primary).
- Focus ring offset: `2px` from element boundary.

### 5.3 ARIA Labels & Semantic HTML

| Component | ARIA Requirement |
|:---|:---|
| **Navigation Sidebar** | `<nav aria-label="Navigasi Utama">` |
| **Workspace Switcher** | `aria-haspopup="listbox"`, `aria-expanded`, `aria-label="Pilih Workspace"` |
| **Data Tables** | `<table role="table">`, `<th scope="col">`, `aria-sort` on sortable columns |
| **Status Badges** | `aria-label="{status label}"` (e.g., `aria-label="Status: Submitted"`) |
| **Modals** | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title, `aria-describedby` pointing to description |
| **Toast** | `role="alert"`, `aria-live="assertive"` for errors, `aria-live="polite"` for info/success |
| **Loading Spinner** | `aria-label="Memuat"`, `role="status"` |
| **Form Fields** | `<label htmlFor>` linked to input `id`, `aria-invalid="true"` on error, `aria-describedby` linking to error message element |
| **Photo Upload** | `aria-label="Unggah foto progres"`, uploaded file list as `role="list"` with `role="listitem"` per file |
| **Gantt Chart** | `aria-label="Jadwal Gantt Chart Proyek"`, each bar as `role="button"` with `aria-label="{taskName}: {startDate} hingga {endDate}, progress {n}%"` |
| **Icon-Only Buttons** | Must always have `aria-label` describing the action (e.g., `aria-label="Hapus"`, `aria-label="Tutup"`) |

### 5.4 Responsive Behavior Summary

| Breakpoint | Sidebar | Header | Content Layout | Special Notes |
|:---|:---|:---|:---|:---|
| Mobile (<768px) | Hidden. Bottom tab nav instead. | `h-12`, simplified. | Single column, full-width cards. | Touch-optimized form inputs (`h-11`). Photo capture button prominent. |
| Tablet (768–1023px) | Icon-only (64px), expandable overlay. | `h-14`. | Fluid, narrower cards. | Gantt Chart horizontal scrollable, task list collapsible. |
| Desktop (≥1024px) | Full (240px), collapsible. | `h-14`. | Fluid, multi-column where appropriate. | Full Gantt Chart experience, side panels for detail views. |

---

## 6. Anti-Patterns & Constraints (DOs and DON'Ts)

### 6.1 STRICT RULES — AI Code Generators MUST Follow

#### ❌ DON'TS (Prohibited Practices)

| ID | Rule | Rationale |
|:---|:---|:---|
| `AP-01` | **DO NOT** use inline styles (`style={{ }}`) on any component. | All styling must use Tailwind CSS utility classes or CSS custom properties for maintainability and consistency. |
| `AP-02` | **DO NOT** use pure black `#000000` or pure white `#FFFFFF` for text or backgrounds. | Use the design token palette (Slate-based neutrals). Pure black/white creates harsh contrast and looks unprofessional. Use `--foreground` and `--background` tokens. |
| `AP-03` | **DO NOT** omit empty state UI for any data-driven view. | Every list, table, and grid MUST render a meaningful empty state with illustration, text, and CTA when no data exists. |
| `AP-04` | **DO NOT** omit loading skeleton/spinner states for async data fetches. | Every page and component that fetches data MUST show a skeleton or spinner during loading. No blank screens. |
| `AP-05` | **DO NOT** omit error state handling for API failures. | Every API call MUST have error handling UI (toast notification or inline error message). Never fail silently. |
| `AP-06` | **DO NOT** store Access Token (JWT) in `localStorage` or `sessionStorage`. | Access Token MUST be stored in-memory only (React state/context). Refresh Token in HTTP-Only Secure Cookie. Per TDD §6.1. |
| `AP-07` | **DO NOT** make database queries without `workspace_id` context. | All data access MUST be scoped to `workspace_id` for multi-tenant isolation. Per PRD Negative Constraints. |
| `AP-08` | **DO NOT** store binary file data (photos) in the database. | Photo files MUST be uploaded to Supabase Storage. Only the URL string is stored in `daily_log_media.file_url`. Per PRD Negative Constraints. |
| `AP-09` | **DO NOT** use generic browser `alert()`, `confirm()`, or `prompt()` dialogs. | Use shadcn `<Dialog>`, `<AlertDialog>`, and `<Toast>` components for all user communications. |
| `AP-10` | **DO NOT** use `<img>` tags without `alt` attributes. | Every image MUST have a descriptive `alt` text for screen readers. Use `alt=""` ONLY for purely decorative images. |
| `AP-11` | **DO NOT** create buttons or links without visible focus indicators. | All interactive elements MUST show `focus-visible` ring styles. Never apply `outline-none` without replacement focus styling. |
| `AP-12` | **DO NOT** hardcode color values in component code. | Always reference CSS custom properties or Tailwind theme tokens. E.g., use `text-primary` not `text-[#0891B2]`. |
| `AP-13` | **DO NOT** use `any` type in TypeScript interfaces for API data. | All API response data MUST be typed using interfaces from `src/types/domain/`. |
| `AP-14` | **DO NOT** disable the form submit button without providing a visual reason. | If a button is disabled, show a tooltip or adjacent text explaining why (e.g., "Isi semua field wajib untuk mengirim"). |
| `AP-15` | **DO NOT** allow double-submission on any form. | Disable submit button after first click + show loading spinner. Re-enable only on error/failure. |

#### ✅ DOs (Required Practices)

| ID | Rule | Rationale |
|:---|:---|:---|
| `DO-01` | **DO** use CSS custom properties (`var(--token)`) for all theme-dependent values. | Enables light/dark mode switching via `next-themes` without code changes. |
| `DO-02` | **DO** implement `prefers-reduced-motion` media query for all animations. | Accessibility requirement. Users with motion sensitivity must not see animations. |
| `DO-03` | **DO** use semantic HTML elements (`<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`). | Screen readers and SEO depend on semantic structure. |
| `DO-04` | **DO** debounce all search/filter inputs (300ms minimum). | Prevent excessive API calls and improve performance. Use `useDebounce` hook. |
| `DO-05` | **DO** show optimistic UI updates for Gantt Chart drag-and-drop with automatic rollback on failure. | Per PRD FT-002 acceptance criteria. UI must update instantly, then rollback if server rejects. |
| `DO-06` | **DO** persist daily log form drafts to `localStorage`. | Per PRD FT-003 edge case — field workers in low-connectivity areas must not lose data on accidental page refresh. |
| `DO-07` | **DO** validate file type and size on the client side BEFORE initiating upload. | Per PRD FT-003 — reject files > 5MB and non-JPG/PNG formats before upload begins. Show clear error message. |
| `DO-08` | **DO** use `<label>` elements linked to every form input via `htmlFor`/`id`. | Accessibility requirement. Clicking label should focus the associated input. |
| `DO-09` | **DO** implement focus traps inside all modal dialogs. | Keyboard users must not be able to Tab out of an open modal. |
| `DO-10` | **DO** use the standardized API error response format for all error displays. | Parse `details[].field` and `details[].issue` from API errors to show field-level validation messages. |
| `DO-11` | **DO** display connection status indicator when WebSocket connection is lost. | Show a subtle top banner: "Koneksi terputus. Perubahan tidak akan tersinkronisasi." with reconnect attempt indicator. |
| `DO-12` | **DO** use `next/image` for all images with proper `width`, `height`, and `sizes` props. | Performance optimization (lazy loading, responsive sizing, format optimization). |
| `DO-13` | **DO** scope all Zustand stores to workspace context where applicable. | Prevents data leakage between workspaces when switching via Workspace Switcher. |

---

### 6.2 Animation & Transition Standards

| Animation | Duration | Easing | Tailwind Class | Use Case |
|:---|:---|:---|:---|:---|
| Fade in/out | 150ms | `ease-out` / `ease-in` | `transition-opacity duration-150` | Dropdowns, tooltips |
| Slide in (sidebar) | 200ms | `ease-out` | `transition-transform duration-200` | Sidebar expand/collapse |
| Scale (modal open) | 200ms | `ease-out` | `transition-all duration-200` | Dialog open/close |
| Color change (hover) | 150ms | `ease-in-out` | `transition-colors duration-150` | Buttons, nav items |
| Skeleton pulse | 2000ms | `ease-in-out` | `animate-pulse` | Loading placeholders |
| Spinner rotation | 1000ms | `linear` | `animate-spin` | Loading indicators |
| Toast slide-in | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Custom keyframe | Toast entry |
| Shake (error) | 200ms | `ease-in-out` | Custom `animate-shake` | Form validation error |

**Custom Keyframes (add to `tailwind.config.ts`):**
```typescript
keyframes: {
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-4px)' },
    '50%': { transform: 'translateX(4px)' },
    '75%': { transform: 'translateX(-4px)' },
  },
},
animation: {
  shake: 'shake 200ms ease-in-out',
},
```

---

### 6.3 Responsive Design Breakpoint Rules

```typescript
// tailwind.config.ts — screens (default Tailwind, documented here for clarity)
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet portrait
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Wide desktop
  '2xl': '1536px', // Ultra-wide
}
```

**Mobile-First Approach:** All styles are mobile-first. Use `md:`, `lg:`, `xl:` prefixes for larger viewport overrides.

**Critical Responsive Rules:**
- Sidebar: `hidden md:block` (shown on tablet+), `md:w-16 lg:w-60` (icon-only on tablet, full on desktop).
- Gantt Chart: `overflow-x-auto` on all viewports. Task list panel: `hidden lg:block` (hidden on tablet/mobile, shown as separate page).
- Tables → Cards: Data tables switch to card lists on mobile (`hidden md:table` for table, `md:hidden` for card list).
- Bottom Navigation: `md:hidden fixed bottom-0 w-full h-16 z-30` — only on mobile.
- Form input heights: `h-9 md:h-9` desktop, `h-11` mobile (larger touch targets).

---

*End of Constive Design System & UI/UX Specification v1.0.0*
