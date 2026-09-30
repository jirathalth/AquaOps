<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Development mode

Work in concise, production-ready full-stack development mode. Maximize signal and minimize tokens.

- For coding tasks, make the requested changes directly and output code or patches first. Show only relevant changed sections unless the full file is requested.
- Give direct answers first; keep simple answers to 1–3 sentences. Provide no preamble, closing remarks, request restatement, unsolicited explanation, or change summary.
- Do not offer multiple solutions unless asked. Choose the simplest solution that meets current requirements; mention only materially important tradeoffs.
- For debugging, briefly identify the likely root cause, fix it directly, and explain further only when asked.

## Editing and architecture

- Inspect relevant files and established patterns before making assumptions. Search for reusable components, utilities, services, APIs, models, and patterns before creating anything.
- Make the smallest necessary change. Preserve existing behavior, code, structure, naming, architecture, and style unless the task requires otherwise.
- Do not refactor or modify unrelated code or files. Do not introduce dependencies, abstractions, or duplicate functionality unless necessary or explicitly requested.
- Respect the existing project structure. Keep components, services, utilities, APIs, database access, and business logic appropriately separated without over-engineering.
- Keep code concise, maintainable, and production-ready. Avoid unnecessary comments.
- When changing shared code, consider effects on existing features.

## AquaOps UI/UX

For every task involving UI, UX, pages, layouts, components, dashboards, forms, tables, navigation, responsive behavior, or visual improvements, use `.agents/skills/ui-ux-pro-max/SKILL.md` as the primary UI/UX skill and read `design.md` before implementation. Apply guidance in this order:

1. Existing AquaOps architecture, functionality, business behavior, data flow, and routing.
2. AquaOps `design.md`.
3. Existing reusable AquaOps components and patterns.
4. `ui-ux-pro-max` guidance.

Preserve a sound established AquaOps pattern unless it has a clear usability, accessibility, or responsive problem. Preserve the semantic tokens, IBM Plex Sans Thai typography, shadcn/ui foundation, and Lucide icon system; do not introduce a second design system or replace suitable libraries.

AquaOps is an internal drinking-water factory operations platform, not a marketing site. Build clean, practical, accessible interfaces for efficient repeated use:

- Prioritize clarity, predictable interactions, strong hierarchy, readable data density, consistent spacing, typography, controls, and feedback over decoration.
- Use semantic HTML, readable component structure, modern CSS, and Flexbox/Grid. Avoid excessive markup, wrappers, gradients, glassmorphism, shadows, oversized cards, decorative effects, and unnecessary animation.
- Reuse or extend existing components and patterns before creating new ones. Keep buttons, inputs, selects, dialogs, tables, cards, badges, filters, pagination, and loading, empty, error, disabled, and success states consistent.
- Keep common actions easy to find, validate forms clearly, provide appropriate action feedback, and guard destructive actions when appropriate.
- Treat desktop operational workflows as primary and keep tablet fully usable. Support mobile when required without weakening desktop productivity. Prevent overflow, clipping, overlap, inaccessible actions, and broken tables; use contained horizontal scrolling or intentional column reduction when needed.
- Improve existing screens rather than rebuilding them or redesigning unrelated areas. For substantial new screens, understand the workflow, establish hierarchy, reuse components, and verify desktop/tablet responsiveness and accessibility.

Write every CSS rule on one line regardless of declaration count. Preserve other existing CSS conventions.

```css
.foo { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; }
```

## Backend, API, and data

- Follow the existing backend architecture. Keep routes/controllers thin and business logic separate from transport logic.
- Validate and sanitize all external input; never trust client validation alone. Handle errors consistently, use appropriate HTTP status codes, and keep API responses predictable.
- Prefer clear RESTful APIs unless the project uses another convention. Validate parameters, queries, and bodies; support pagination, filtering, sorting, and search when relevant.
- Preserve existing API contracts and behavior unless explicitly asked to change them.
- Follow the existing schema, ORM, and database conventions. Avoid unnecessary schema changes; use migrations, preserve integrity, and use transactions when related writes must succeed or fail together.
- Avoid obvious N+1 queries, unnecessary network/database calls, and unjustified indexes. Never alter or delete production data unless explicitly instructed.

## Security

- Never hardcode or expose secrets, passwords, tokens, API keys, stack traces, internal errors, or sensitive data. Use environment variables for sensitive configuration.
- Enforce authentication and authorization server-side for protected operations.
- Use parameterized queries or the project ORM safely. Account for XSS, CSRF, SQL injection, IDOR, and improper authorization where relevant.
- Do not expose sensitive information in logs or API responses.

## Debugging and testing

- Inspect relevant code, identify and fix the root cause, and avoid changing unrelated behavior or masking symptoms.
- Preserve existing tests. Update affected tests when behavior intentionally changes and add focused tests for important new business logic; avoid tests for trivial implementation details.
- Run the most relevant practical checks. Do not claim a result works unless verified or clearly supported by reasoning.

Use the cheapest reliable verification method in this order:

1. Static/code-level checks.
2. `npm run lint`.
3. `npm run typecheck`.
4. Relevant unit or integration tests.
5. `npm run build`.
6. Playwright when browser-level verification is materially necessary.

Use Playwright for authentication, protected routes, RBAC/permission navigation, cross-page or multi-step flows, important browser form interactions, dialogs/dropdowns/overlays, critical business workflows, responsive behavior that static inspection cannot establish, and browser-only bugs. It is normally unnecessary for schemas, Prisma models, documentation, types, server utilities, pure logic, or simple isolated styling.

When Playwright is necessary, start with the smallest relevant flow in the primary configured browser, test only representative affected screens/viewports, inspect artifacts only as needed, and re-run only affected tests before broadening coverage. Do not weaken correctness to reduce execution time.

In completion reports, mention Playwright only when it ran, was intentionally skipped despite potential relevance, or browser verification remains necessary. When it was not needed, report exactly: `Playwright: Not required for this task.`
