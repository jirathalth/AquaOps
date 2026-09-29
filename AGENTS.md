<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## AquaOps UI/UX instructions

For every task involving UI, UX, pages, layouts, components, dashboards, forms, tables, navigation, responsive behavior, or visual improvements, use the project-local `ui-ux-pro-max` skill at `.agents/skills/ui-ux-pro-max/SKILL.md` as the primary UI/UX guidance.

Repository instructions and the existing AquaOps design system take precedence over generic skill recommendations. Preserve the current architecture, components, functionality, visual language, semantic tokens, IBM Plex Sans Thai typography, shadcn/ui foundation, and Lucide icon system. Do not introduce a second design system or replace a suitable existing library or pattern.

### UI implementation priority

Read `design.md` before implementing UI. Apply UI guidance in this order:

1. Existing AquaOps architecture, functionality, business behavior, data flow, and routing.
2. AquaOps `design.md`.
3. Existing reusable AquaOps components and established patterns.
4. `ui-ux-pro-max` expertise and recommendations.

If `ui-ux-pro-max` conflicts with a sound established AquaOps pattern, preserve consistency unless the existing pattern has a clear usability, accessibility, or responsive problem.

### Product and visual direction

AquaOps is an internal drinking-water factory operations platform covering dashboards, customers, products, retail and wholesale orders, cash and credit billing, invoicing, payments, delivery, inventory, production, reports, and settings. It must feel like a professional operations platform, not a marketing website.

- Prioritize clarity, usability, predictable interactions, strong information hierarchy, high readability, consistent spacing and alignment, and efficient repeated daily use.
- Maintain useful information density without making screens feel crowded.
- Prefer clean, modern SaaS/internal-tool patterns.
- Avoid generic AI-generated dashboard aesthetics, excessive gradients, glassmorphism, shadows, oversized cards, decorative effects, and unnecessary animation.
- Use IBM Plex Sans Thai for Thai and English. Thai readability and mixed-language typography are priorities.
- Improve existing UI instead of rebuilding it. Do not redesign unrelated areas.

### Components and implementation

Before creating a component, search for an existing reusable AquaOps component. Reuse or extend it when appropriate; create a new component only when necessary. Maintain consistency across buttons, inputs, selects, dialogs, tables, cards, status badges, filters, pagination, empty states, loading states, error states, and navigation.

- Make the smallest necessary change and preserve existing functionality.
- Follow existing architecture and coding conventions.
- Do not refactor or modify unrelated files.
- Do not introduce dependencies unless necessary.
- Reuse existing utilities and components.
- Keep implementations concise, maintainable, accessible, and production-ready.

### Responsive design

Desktop operational workflows are primary and tablet must remain fully usable. Support mobile when required, but do not weaken desktop productivity to optimize for mobile unless explicitly requested. Prevent horizontal page overflow, clipped content, broken tables, overlapping controls, and inaccessible actions. Use an intentional table strategy such as contained horizontal scrolling or reduced columns rather than indiscriminately shrinking data.

### Design workflow

For a substantial new screen:

1. Understand the operational workflow and inspect existing AquaOps components and patterns.
2. Apply `ui-ux-pro-max` guidance while keeping the AquaOps design system authoritative.
3. Establish information hierarchy and reuse existing components.
4. Implement the UI and check desktop/tablet responsive behavior and accessibility.
5. Use Playwright only when browser-level verification is materially useful.

For an existing screen, preserve functionality, identify the specific UI/UX issue, change only what is necessary, and maintain consistency with the rest of AquaOps.

### Playwright policy

Use the cheapest reliable verification method first, in this order:

1. Static/code-level checks.
2. `npm run lint`.
3. `npm run typecheck`.
4. Relevant unit or integration tests.
5. `npm run build`.
6. Playwright only when browser-level behavior needs verification.

Do not run Playwright automatically after every task. Use it when changes affect authentication, login/logout, protected routes, RBAC or permission-based navigation, cross-page or multi-step workflows, important browser form interactions, dialogs/dropdowns/overlays, critical business workflows, responsive behavior that cannot be verified confidently through static inspection, or browser-only bugs.

Playwright is normally unnecessary for database schemas, Prisma models, documentation, type definitions, server utilities, pure calculation or formatting logic, and simple isolated styling changes.

When Playwright is necessary:

- Start with the smallest relevant test file or affected flow.
- Use the primary configured browser unless the task requires cross-browser coverage or evidence indicates a browser-specific regression.
- Test only representative affected screens and viewports when responsive behavior changes.
- Inspect screenshots, traces, DOM, or browser logs only when needed to diagnose a failure.
- Re-run only the affected test after a fix; broaden regression coverage only when justified.
- Keep output concise and do not repeatedly run already-passing unrelated tests.
- Do not weaken correctness or skip necessary E2E verification merely to reduce execution time.

In completion reports, mention Playwright only when it ran, was intentionally skipped despite potential relevance, or browser verification remains necessary. When it was not needed, report exactly: `Playwright: Not required for this task.`
