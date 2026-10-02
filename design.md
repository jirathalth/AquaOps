# AquaOps UI Design System

Status: **approved baseline**. This document records the visual system currently implemented in AquaOps and is the required starting point for future UI work. Do not reinterpret or redesign this direction without an explicit product decision.

The implementation is the source of truth. Canonical tokens live in `src/app/globals.css`; canonical patterns live in `src/components/ui`, `src/components/shared`, and `src/components/layout`. If documentation and implementation drift, verify the approved implementation first and update this document in the same change.

## Visual direction

AquaOps is a soft, modern enterprise operations interface:

- cool neutral application background with clear white or dark surfaces;
- restrained blue primary emphasis;
- small pastel semantic accents;
- subtle borders and very soft shadows;
- medium rounded corners;
- generous page-level whitespace with compact operational controls and data;
- clear typography hierarchy and low visual noise.

It is an internal drinking-water factory operations platform, not a marketing site. Clarity, scanning, predictable placement, and repeated daily use take priority over decoration.

## Source-of-truth rules

1. Preserve application architecture, business behavior, data flow, routing, permissions, and information architecture.
2. Reuse semantic tokens and existing shared components before adding styles or components.
3. Preserve IBM Plex Sans Thai and the existing Lucide icon system.
4. Do not add one-off colors, shadows, radii, or spacing when an existing token or pattern applies.
5. Keep operational tables and forms compact. Use whitespace and hierarchy instead of extra containers.
6. Every change must retain keyboard behavior, focus visibility, semantic markup, contrast, and responsive behavior.
7. Light and dark themes are separately calibrated systems. Do not derive dark mode by mechanically inverting light values.

## Tokens

### Semantic colors

Use the semantic Tailwind utilities backed by the CSS variables below, such as `bg-background`, `bg-card`, `text-foreground`, `border-border`, and `text-danger`. Feature code must not introduce raw status colors.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `background` | `oklch(0.972 0.008 250)` | `oklch(0.15 0.018 255)` | Cool neutral application canvas |
| `foreground` | `oklch(0.22 0.026 255)` | `oklch(0.94 0.01 247)` | Primary text |
| `card` | `oklch(1 0 0)` | `oklch(0.195 0.022 255)` | Cards, controls, and major content surfaces |
| `card-foreground` | `oklch(0.22 0.026 255)` | `oklch(0.94 0.01 247)` | Text on cards |
| `popover` | `oklch(1 0 0)` | `oklch(0.215 0.024 255)` | Elevated menus and select content |
| `popover-foreground` | `oklch(0.22 0.026 255)` | `oklch(0.94 0.01 247)` | Text on popovers |
| `primary` | `oklch(0.55 0.18 258)` | `oklch(0.7 0.15 255)` | Primary actions, active emphasis, focus |
| `primary-foreground` | `oklch(0.99 0 0)` | `oklch(0.16 0.03 255)` | Text and icons on primary |
| `secondary` | `oklch(0.955 0.014 248)` | `oklch(0.26 0.026 252)` | Quiet secondary controls and badges |
| `secondary-foreground` | `oklch(0.3 0.045 252)` | `oklch(0.92 0.01 247)` | Text on secondary |
| `muted` | `oklch(0.958 0.009 250)` | `oklch(0.24 0.02 255)` | Subdued regions, disabled/read-only fields |
| `muted-foreground` | `oklch(0.47 0.028 255)` | `oklch(0.71 0.025 247)` | Secondary text and metadata |
| `accent` | `oklch(0.945 0.028 255)` | `oklch(0.275 0.052 252)` | Hover and selected backgrounds |
| `accent-foreground` | `oklch(0.36 0.11 258)` | `oklch(0.94 0.01 247)` | Text on accent |
| `border` | `oklch(0.895 0.014 250)` | `oklch(1 0 0 / 11%)` | Structural dividers and surface borders |
| `input` | `oklch(0.875 0.016 250)` | `oklch(1 0 0 / 17%)` | Control borders and switch tracks |
| `ring` | `oklch(0.55 0.18 258)` | `oklch(0.7 0.15 255)` | Keyboard focus |

Semantic state tokens are `success`, `warning`, `danger`, and `info`. Pair them with their `*-foreground` token when content is placed directly on the solid color.

| State | Light | Light foreground | Dark | Dark foreground |
| --- | --- | --- | --- | --- |
| Success | `oklch(0.56 0.145 153)` | `oklch(0.98 0.01 153)` | `oklch(0.67 0.16 153)` | `oklch(0.15 0.03 153)` |
| Warning | `oklch(0.72 0.15 77)` | `oklch(0.28 0.06 60)` | `oklch(0.78 0.15 78)` | `oklch(0.2 0.04 60)` |
| Danger | `oklch(0.56 0.21 27)` | `oklch(0.99 0 0)` | `oklch(0.64 0.2 27)` | `oklch(0.98 0 0)` |
| Info | `oklch(0.58 0.16 252)` | `oklch(0.99 0 0)` | `oklch(0.7 0.15 252)` | `oklch(0.15 0.03 252)` |

CSS-rendered charts use `chart-1`, `chart-2`, and `chart-3` for restrained blue, green, and amber series, with `chart-grid` for grid lines. Canvas charts cannot consume all CSS color forms reliably, so their equivalent palette is centralized in `src/config/charts.ts`; do not hardcode chart colors in feature components.

### Sidebar colors

The shell has dedicated tokens so navigation contrast can be calibrated separately from page surfaces.

| Token | Light | Dark |
| --- | --- | --- |
| `sidebar` | `oklch(0.995 0.003 250)` | `oklch(0.175 0.021 255)` |
| `sidebar-foreground` | `oklch(0.27 0.033 255)` | `oklch(0.92 0.012 247)` |
| `sidebar-muted` | `oklch(0.5 0.028 252)` | `oklch(0.68 0.025 247)` |
| `sidebar-accent` | `oklch(0.945 0.03 255)` | `oklch(0.245 0.045 252)` |
| `sidebar-border` | `oklch(0.9 0.014 250)` | `oklch(1 0 0 / 10%)` |

### Radius

The base radius is `0.625rem` (10px).

| Utility | Value | Use |
| --- | --- | --- |
| `rounded-sm` | 8px | Nested menu items, compact inner elements |
| `rounded-md` | 10px | Default controls, cards, filters, tables, shell buttons |
| `rounded-lg` | 12px | Reserved for components that require more separation |
| `rounded-xl` | 16px | Rare; do not use for routine operational surfaces |
| `rounded-full` | Fully rounded | Badges, avatars, indicators only |

### Borders and shadows

- Default structural border: `border-border`; approved soft surfaces commonly use `border-border/80`.
- Input boundaries use `border-input`; focus changes the border and visible outline to `ring`.
- Cards use `shadow-sm`; filter bars and table containers use `shadow-xs`.
- Neutral buttons and controls may use `shadow-xs` to remain legible against the cool background. Primary and destructive filled buttons use their dedicated semantic gradient and tinted shadow tokens.
- Dropdowns and select popovers use `shadow-md`; dialogs use `shadow-lg`.
- Do not stack shadows, add colored shadows outside the approved filled action button tokens, or use elevation as the only boundary.

| Token | Value |
| --- | --- |
| `shadow-xs` | `0 1px 2px oklch(0.28 0.035 255 / 6%)` |
| `shadow-sm` | `0 1px 3px oklch(0.28 0.035 255 / 8%), 0 1px 2px oklch(0.28 0.035 255 / 5%)` |
| `shadow-md` | `0 8px 24px -8px oklch(0.28 0.035 255 / 14%)` |
| `shadow-lg` | `0 16px 40px -12px oklch(0.2 0.035 255 / 18%)` |

## Typography

The only primary UI family is **IBM Plex Sans Thai**, loaded through `next/font` for Thai and Latin in weights 400, 500, 600, and 700. The fallback is `ui-sans-serif, system-ui, sans-serif`. Do not add a competing display or body font.

| Role | Shared class | Specification |
| --- | --- | --- |
| Page title | `.type-page-title` | 22px / 700 / 1.4 / slight negative tracking |
| Section title | `.type-section-title` | 16px / 600 / 1.5 |
| Card title | `.type-card-title` | 14px / 600 / 1.5 |
| Body | `.type-body` | 14px / 400 / 1.6 |
| Secondary | `.type-secondary` | 13px / 400 / 1.6 / muted |
| Label | `.type-label` | 13px / 500 / 1.5 |
| Table header | `.type-table-header` | 12px / 600 / 1.5 |
| Table cell | `.type-table-cell` | 13px / 400 / 1.6 |
| Caption | `.type-caption` | 12px / 400 / 1.5 / muted |

Use `.tabular-nums` for amounts, quantities, percentages, dates, and document identifiers. Preserve sufficient Thai line height and never clip marks. Use weight for hierarchy sparingly; body copy should not become uniformly bold.

## Spacing and density

Use Tailwind's 4px spacing scale. Preferred increments are 4, 8, 12, 16, 20, 24, and 32px.

- Main page padding: 16px mobile, 20px from `sm`, 24px from `lg`.
- Page content maximum: 1800px (`.page-container`); operational pages remain full width within it.
- Page stack: 20px (`.page-stack`).
- Page header: 12px between breadcrumb and title/action row; description sits 4px below the title.
- Section separation: normally 24px; heading to section content: 16px.
- Standard card padding: 16px. Use 20px for spacious form surfaces where already established.
- Form grid gap: 16px; label to control: 6px.
- Inline controls and actions: 8px.
- Compactness belongs inside tables, controls, and repeated form fields; whitespace belongs between major page regions.
- Avoid arbitrary spacing values unless a measured layout constraint requires one.

## Application shell

### Sidebar

- Uses the dedicated sidebar tokens, a right border, and no decorative shadow.
- Width is 240px expanded and 64px collapsed.
- Desktop at 1200px and above may expand or collapse it; tablet from 768–1199px is intentionally collapsed; mobile uses a 240px sheet drawer.
- Navigation rows are 32px on desktop and 40px in the mobile drawer.
- Active navigation combines the pastel sidebar accent, medium weight, and primary-colored text. Hover uses the same accent family without competing emphasis.
- Group labels are quiet 11px text. Disabled and future items remain visible only with subdued contrast.
- Collapsed items require tooltips; permission filtering and route-aware active state must remain intact.

### Topbar

- Fixed height: 56px; sticky at the top with `z-40`.
- Surface: `bg-card/90`, `border-border/80`, `shadow-xs`, and restrained backdrop blur.
- Mobile shows the drawer trigger; the desktop collapse trigger appears at 1200px and above.
- Theme, notification, and user controls reuse bordered ghost buttons with `shadow-xs`.
- Page context stays on the left and account actions stay on the right. Do not add decorative content or duplicate page actions here.

## Shared component patterns

### Cards

- Use `Card`, `CardHeader`, `CardContent`, and `CardFooter` rather than recreating a bordered panel.
- Default card: `rounded-md border border-border/80 bg-card shadow-sm`.
- Default padding is 16px. Group related information; do not wrap every value in its own card.
- Dashboard KPI cards use `StatCard`: compact 112px minimum height, 24px value, muted 13px label, 12px helper, and one small pastel icon tile.
- Nested content may use a border or muted background, but should not add another full-elevation card without a clear grouping need.

### Buttons and controls

- Use `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Switch`, and the existing input wrappers.
- One primary action per local context. Use outline for clear secondary actions, ghost for low-emphasis actions, and destructive only for destructive operations.
- Primary and destructive filled variants use a restrained vertical gradient derived from their semantic color and a soft color-tinted shadow. Their component tokens use the `--button-primary-*` and `--button-danger-*` families. Hover may increase depth slightly; active reduces elevation; disabled removes the colored shadow. Do not apply this treatment to secondary, outline, ghost, link, or neutral icon buttons.
- Default controls are 40px high on mobile and 36px at `sm`; small buttons are 36px mobile and 32px at `sm`.
- Inputs, selects, and textareas use `bg-card`, `border-input`, `rounded-md`, and `shadow-xs` with an explicit focus outline.
- Date fields use the shared `DateInput`; do not render raw `Input type="date"` controls in feature code. Its AquaOps calendar popover—not the browser/system picker—is the canonical experience, with Thai month and weekday labels, month navigation, today/clear actions, min/max handling, keyboard navigation, and the same popover surface treatment as menus.
- Disabled controls use muted surfaces and reduced opacity. Read-only fields use `bg-muted/60`. Invalid fields use the danger border and focus color.
- Icon-only controls need an accessible name. Important mobile targets should approach 40–44px.

### Filters

- Use `FilterBar`; do not construct a new toolbar treatment per feature.
- The filter surface uses `bg-card`, `border-border/80`, `shadow-xs`, 12px padding, and 10px vertical grouping.
- Search remains visible when useful. Full inline filters appear at `xl` and above; below `xl`, filters move into the right-side `Sheet` while actions remain available.
- Show the active-filter count and a reset action when filters are applied.
- On the narrowest screens the filter bar may use edge-to-edge top/bottom borders; from `sm` it becomes a rounded bordered surface.

### Tables

- Prefer `DataTable` for searchable, sortable, pageable operational lists and the shared `Table` primitives for static/detail tables.
- Data table container: `rounded-md border border-border/80 bg-card shadow-xs` with contained horizontal scrolling.
- Header height is 36px. Rows have a 40px minimum height. Cells use 12px horizontal and 8px vertical padding.
- Header text is 12px semibold and muted; cell text is 13px with 1.6 line height.
- Header backgrounds use `bg-muted/70` with restrained blur. Row hover is `bg-accent/35`; selection is `bg-primary/5`.
- Align numeric amounts and quantities right and use tabular numerals. Keep identifiers and statuses scannable.
- Sorting exposes `aria-sort`; clickable rows must support Enter and Space. Secondary row actions belong in a dropdown menu.
- Pagination stays attached to the table surface and uses a quiet muted footer.
- On narrow screens, preserve table semantics and use contained horizontal scrolling instead of causing page-level overflow. Do not force dense operational tables into decorative mobile cards unless the workflow already requires a purpose-built mobile presentation.

### Forms

- Use `FormField`, `FormSection`, and `FormActions`.
- Multi-section workflows belong on pages. Use dialogs only for short, focused forms.
- Form pages use one primary `bg-card` panel with `border-border/80`, `rounded-md`, `shadow-sm`, 16px mobile padding, and 20px from `sm` where established.
- `FormSection` separates major groups with a bottom border and 24px bottom padding; field grids use one column, two from `sm`, and three from `xl` when labels remain readable.
- Required state, description, error, and control must remain programmatically associated. Required markers and errors use `danger`.
- Actions use a top divider, reverse-stack on mobile, and right-align from `sm`.
- Avoid extra inner cards. Use a subtle border or muted background only for meaningful subgroups, summaries, and repeated line items.

### Dialogs and menus

- Dialog overlay is `black/45` with a 1px blur. Content uses `bg-card`, `border-border/80`, `rounded-md`, `shadow-lg`, and a maximum height of `100dvh - 32px` with internal scrolling.
- Dialog width is viewport-safe with 16px margins and a default 512px maximum. Padding is 16px mobile and 20px from `sm`.
- Dialogs retain an explicit accessible title and close control; actions stack on mobile and align right from `sm`.
- Dropdown menus and select popovers use `bg-popover`, `border-border/80`, `rounded-md`, and `shadow-md`; select options mirror the dropdown item spacing, focus treatment, and density.
- Menu items use compact `rounded-sm` rows with 8px horizontal and 6px vertical padding. Focus uses `accent`; disabled items remain non-interactive and subdued.
- Use `Sheet` for mobile navigation and responsive filters. Preserve focus management, dismissal, and accessible labels supplied by Radix primitives.

### Status badges and feedback

- Use `StatusBadge` with the centralized mapping in `src/config/statuses.ts`; do not style business statuses in feature components.
- Badges are compact pills: outline border, pastel 12% semantic background, semantic text, 12px medium type.
- Neutral states (`draft`, `inactive`) use muted styling. Waiting/partial states use warning. Confirmed/preparing/active use info. Ready/delivering use primary. Delivered/completed/paid use success. Failed/overdue/cancelled use danger.
- Color must never be the only status cue; always render the text label.
- Use `Alert` for actionable guidance or failures, `EmptyState` for empty/filtered datasets, and `TableSkeleton` or local loading states that preserve layout. Never expose stack traces.

## Responsive behavior

Breakpoint intent follows the implemented shell:

- Mobile: below 768px (`md`). Sidebar becomes a sheet drawer; controls and actions may stack; mobile target sizes increase; tables scroll within their container.
- Tablet: 768–1199px. Sidebar remains visible but collapsed to 64px; filters use the sheet until 1200px; forms normally use two columns.
- Desktop: 1200px and above (`xl`). Sidebar can expand to 240px; full filter rows appear; form grids may use three columns.

Always verify desktop and tablet first for operational productivity, then mobile. Required checks:

- no page-level horizontal overflow, clipped Thai marks, overlapping actions, or inaccessible off-screen controls;
- drawer, menus, dialogs, filters, and tables remain keyboard-operable;
- sticky shell elements do not cover focused content;
- primary actions remain discoverable after wrapping or stacking;
- loading, empty, error, disabled, read-only, and status states remain legible.

## Light and dark themes

- Both themes use the same component architecture, hierarchy, density, radius, and semantic meaning.
- Light mode uses a cool blue-gray canvas and clean white surfaces.
- Dark mode uses a deep blue-black canvas with slightly lighter blue-neutral cards and popovers. Borders are low-alpha white rather than light-mode colors.
- Dark primary and semantic colors are intentionally lighter to preserve contrast. Warning badge text switches to the warning token in dark mode.
- Shadows remain restrained in both themes; dark-mode separation depends primarily on calibrated surface and border contrast.
- Never use hardcoded light backgrounds, black body text, or opacity combinations that only work in one theme.
- New visual states must be checked in both themes and added as semantic tokens when they are reusable.

## Accessibility baseline

- Preserve the skip link, semantic headings, explicit labels, `aria-current`, `aria-sort`, and Radix focus management.
- Maintain visible `focus-visible` outlines using `ring`; never remove focus styling without an equivalent.
- Decorative icons use `aria-hidden`; icon-only buttons have meaningful accessible names.
- Status, validation, selection, and progress cannot rely on color alone.
- Respect reduced-motion preferences and keep motion short and functional.
- Charts require a concise accessible label or text summary.

## Creating future screens

1. Start with `PageHeader` and `.page-stack` inside the existing shell.
2. Choose the existing shared pattern for the workflow: `DataTable`, `FilterBar`, form layout primitives, detail cards, or settings sections.
3. Use semantic tokens only. If no token fits, confirm that the need is truly system-wide before proposing one.
4. Keep surfaces minimal: page canvas, one primary content surface, and only necessary nested grouping.
5. Preserve compact controls, rows, and field grids while keeping 20–24px separation between major regions.
6. Reuse centralized statuses, empty/loading/error states, dialogs, menus, and sheets.
7. Validate desktop, tablet, and mobile in both themes, including keyboard and focus behavior.

Avoid gradients outside the approved filled action buttons, glassmorphism, oversized cards, decorative shadows, excessive animation, ornamental illustrations, duplicate toolbars, and feature-specific visual languages. A new screen should look native to AquaOps because it reuses the system, not because it imitates a screenshot.

## Change control

This baseline is locked for future development. Small extensions are acceptable only when an existing token or shared pattern cannot express a real product need. Any intentional system-level change must update the implementation and this document together, include light/dark and responsive behavior, and avoid silently creating a parallel design system.
