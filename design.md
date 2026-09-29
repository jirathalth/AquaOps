# AquaOps UI Design System

This document is the visual baseline for AquaOps. Preserve application behavior and reuse the shared components in `src/components` before adding new UI. AquaOps is a compact internal operations platform, not a marketing product.

## Principles

- Optimize for scanning, predictable placement, and repeated daily work.
- Keep desktop information-dense and tablet fully operational; adapt mobile without compressing complex tables into unreadable layouts.
- Use one primary accent and semantic colors only when they communicate state.
- Prefer borders and surface contrast over large shadows, decorative gradients, or extra containers.
- Keep motion short and functional; respect reduced-motion preferences.

## Typography

The only primary UI family is **IBM Plex Sans Thai**, loaded by `next/font` in weights 400, 500, 600, and 700. Thai and English use the same family. Body copy uses a minimum 1.6 line height where text can wrap; do not tighten Thai text enough to clip marks.

| Role | Utility / specification |
| --- | --- |
| Page title | `.type-page-title` — 22px / 700 / 1.4 |
| Section title | `.type-section-title` — 16px / 600 / 1.5 |
| Card title | `.type-card-title` — 14px / 600 / 1.5 |
| Body | `.type-body` — 14px / 400 / 1.6 |
| Secondary | `.type-secondary` — 13px / 400 / 1.6 |
| Label | `.type-label` — 13px / 500 / 1.5 |
| Table header | `.type-table-header` — 12px / 600 / 1.5 |
| Table cell | `.type-table-cell` — 13px / 400 / 1.6 |
| Caption | `.type-caption` — 12px / 400 / 1.5 |

Use `.tabular-nums` for amounts, quantities, percentages, dates, and document identifiers. Avoid uppercase English for long labels and avoid excessive bold text.

## Color and shape

Use semantic CSS variables from `src/app/globals.css`: `background`, `card`, `popover`, `foreground`, `muted`, `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `border`, `input`, and `ring`. Every state must work in light and dark themes. Do not add raw status colors inside feature pages.

- Default radius: 6px (`rounded-md`).
- Use `rounded-sm` for compact nested controls and `rounded-full` only for badges or avatars.
- Cards use a border and at most `shadow-xs`; overlays may use `shadow-md` or `shadow-lg`.
- Always pair semantic color with readable text or an icon; color alone must not communicate state.

## Spacing

Use Tailwind's 4px scale. Preferred increments are 4, 8, 12, 16, 20, 24, and 32px.

- Page edge: 16px mobile, 20px tablet, 24px desktop.
- Page stack: 20px via `.page-stack`.
- Page header internals: 12px between breadcrumb and title/action row.
- Section separation: 24px; section heading to content: 16px.
- Card padding: 12–16px for data cards, 20px only when the content benefits from it.
- Form field gap: 16px; label to control: 6px.
- Inline controls/actions: 8px.
- Avoid arbitrary spacing values unless required by a measured layout constraint.

## Layout

- Shell: fixed/sticky sidebar, 56px topbar, flexible main region, and `100dvh` minimum height.
- Sidebar: 240px expanded and 64px collapsed. Tablet uses collapsed navigation; mobile uses a drawer.
- Page container: full width with a maximum of 1800px. Do not center narrow operational lists unnecessarily.
- Page order: breadcrumb → page header/actions → filters → content.
- Use `PageHeader` for title, description, breadcrumbs, and actions. Primary actions sit at the upper right on desktop and wrap below the title on narrow screens.
- Use 1 column on mobile, 2 where appropriate on tablet, and add desktop columns only when information remains readable.
- Tables use contained horizontal scrolling on narrow screens. Never allow table width to create page-level horizontal overflow.

## Component baseline

### Controls

- `Button`: one clear primary action per local context; use outline or ghost for secondary actions and destructive styling only for destructive confirmation.
- `Input`, `Select`, `Textarea`: consistent border, focus ring, disabled/read-only state, and `aria-invalid`. Mobile text is at least 16px to avoid browser zoom; desktop controls remain compact.
- `Checkbox`, `Radio`, `Switch`: always pair with a visible label unless an accessible name is supplied. The hit target must be at least 24px.
- Date input: use the standard input treatment and locale-aware display; do not create a competing field style.
- Forms: use `FormField`, `FormSection`, and `FormActions`. Required, description, and error content must be programmatically associated with the control. Use pages for multi-section workflows and dialogs only for short forms.

### Content and feedback

- `Card`: group related information, not every individual value. Keep dashboard stat cards compact.
- `Badge` / `StatusBadge`: use the centralized semantic status mapping and readable text.
- `Alert`: reserve danger for failures, warning for risk, success for completion, and info for relevant guidance.
- `EmptyState`: explain whether the dataset is empty or filtered; show an action only when the user is authorized.
- `LoadingState` / `TableSkeleton`: preserve layout and avoid full-screen spinners for local operations.
- `ErrorState`: state the problem in user language and offer recovery when possible; never expose stack traces.
- Toasts: acknowledge meaningful completed/failed actions only; do not toast trivial interactions.

### Navigation and overlays

- Active navigation uses both background and text emphasis. Collapsed navigation requires tooltips.
- `Dialog`: confirmation and short forms only; it must fit within the dynamic viewport and scroll internally.
- `Sheet`: mobile navigation or filters; always provide an explicit close control unless the sheet contains an equivalent labeled close action.
- `DropdownMenu`: use for secondary row actions; avoid multiple visible action buttons per table row.
- `Tabs`: use for stable peer views such as detail-page sections, not as a replacement for primary navigation.

### Data tables and filters

- Default header height: 36px; row minimum: 40px; cell padding: 12px horizontal and 8px vertical.
- Align amounts and quantities right and use tabular numerals. Keep identifiers and statuses scannable.
- Sorting must expose `aria-sort`; pagination and filters must remain server-compatible.
- Use `FilterBar` for search, practical select filters, active-filter feedback, reset, and table actions.
- On mobile, move filters to the filter sheet and keep the search field visible when useful.
- Row click may open details; keyboard activation must provide the same behavior. Put secondary actions in the row action menu.

## Responsive and accessibility baseline

- Breakpoint intent: mobile under 768px, tablet 768–1199px, desktop 1200px and above.
- Verify no page-level horizontal overflow, clipped Thai marks, overlapping actions, or dialogs outside the viewport.
- Keep visible `focus-visible` outlines, semantic headings, explicit labels, keyboard-operable menus/dialogs, and sufficient contrast.
- Important mobile controls should approach a 40–44px target while compact desktop controls may remain 32–36px.
- Charts require a concise accessible label or text summary.
- Decorative icons must be hidden from assistive technology; icon-only controls require an accessible name.

## Implementation priority

For UI work, follow this order:

1. Existing AquaOps architecture, behavior, data flow, and routing.
2. This `design.md` baseline.
3. Existing reusable AquaOps components and patterns.
4. `ui-ux-pro-max` guidance.

When generic guidance conflicts with a sound existing AquaOps pattern, preserve consistency. Change the pattern only when there is a clear usability, accessibility, or responsive problem.
