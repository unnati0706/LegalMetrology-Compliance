# FRONTEND_40_MODULE_PROMPTS.md
## SIH26034 — AI-Assisted Legal Metrology Compliance & Inspection Platform
### 40 Frontend Module Implementation Prompts (F01–F40)

Stack: React / Next.js + TypeScript, responsive PWA, component-based architecture. Consumes the API contracts defined in `BACKEND_40_MODULE_PROMPTS.md`. Product philosophy: AI assists extraction; a deterministic, versioned rule engine performs legal compliance checks; uncertain cases route to manual review; risk scoring is inspection-prioritization only, never a claim of legal guilt.

---

# F01 - Application Shell, Routing & Design System

## Priority
P0

## Goal
Establish the Next.js/React + TypeScript application shell: global layout, navigation, routing table, and a shared design system (tokens, typography, spacing, component library).

## Why This Module Exists
This module implements the "Foundation" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor, Manufacturer, Administrator the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor, Manufacturer, Administrator

## Dependencies
None — this is the first foundation module

## Screens / Routes
- `/`
- `/login`
- `/dashboard/*`

## Components To Build
- **AppShell** — reusable component; responsible for its named function within Application Shell, Routing & Design System; emits relevant success/error/change events to the parent screen.
- **TopNav** — reusable component; responsible for its named function within Application Shell, Routing & Design System; emits relevant success/error/change events to the parent screen.
- **SideNav** — reusable component; responsible for its named function within Application Shell, Routing & Design System; emits relevant success/error/change events to the parent screen.
- **RouteGuard** — reusable component; responsible for its named function within Application Shell, Routing & Design System; emits relevant success/error/change events to the parent screen.
- **ThemeProvider** — reusable component; responsible for its named function within Application Shell, Routing & Design System; emits relevant success/error/change events to the parent screen.
- **DesignTokens (colors, spacing, typography)** — reusable component; responsible for its named function within Application Shell, Routing & Design System; emits relevant success/error/change events to the parent screen.
- **Breadcrumb** — reusable component; responsible for its named function within Application Shell, Routing & Design System; emits relevant success/error/change events to the parent screen.
- **Toast/NotificationCenter** — reusable component; responsible for its named function within Application Shell, Routing & Design System; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f01-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f01-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f01-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | Yes | Yes |
| Edit/Submit | Yes | Review-only | Yes | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | Yes | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
As shared infrastructure, this module exposes the offline-detection primitives (network status hook, request queue) that field-facing modules (F09–F12, F38) build on.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f01_viewed`
- `f01_action_submitted`
- `f01_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F01 (Application Shell, Routing & Design System) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f01/`. Build the routes `/`, `/login`, `/dashboard/*` and the components: AppShell, TopNav, SideNav, RouteGuard, ThemeProvider, DesignTokens (colors, spacing, typography), Breadcrumb, Toast/NotificationCenter. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B01's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F02 - Authentication, Session & RBAC UI

## Priority
P0

## Goal
Build login, session handling, token refresh, and role-based UI gating so every screen renders only what a role is permitted to see.

## Why This Module Exists
This module implements the "Foundation" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor, Manufacturer, Administrator the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor, Manufacturer, Administrator

## Dependencies
F01

## Screens / Routes
- `/login`
- `/logout`
- `/forgot-password`
- `/unauthorized`

## Components To Build
- **LoginForm** — reusable component; responsible for its named function within Authentication, Session & RBAC UI; emits relevant success/error/change events to the parent screen.
- **SessionProvider** — reusable component; responsible for its named function within Authentication, Session & RBAC UI; emits relevant success/error/change events to the parent screen.
- **RoleGate (wrapper)** — reusable component; responsible for its named function within Authentication, Session & RBAC UI; emits relevant success/error/change events to the parent screen.
- **AuthGuardRoute** — reusable component; responsible for its named function within Authentication, Session & RBAC UI; emits relevant success/error/change events to the parent screen.
- **IdleSessionWarning** — reusable component; responsible for its named function within Authentication, Session & RBAC UI; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f02-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f02-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f02-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | Yes | Yes |
| Edit/Submit | Yes | Review-only | Yes | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | Yes | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
As shared infrastructure, this module exposes the offline-detection primitives (network status hook, request queue) that field-facing modules (F09–F12, F38) build on.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f02_viewed`
- `f02_action_submitted`
- `f02_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /login, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /login, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F02 (Authentication, Session & RBAC UI) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f02/`. Build the routes `/login`, `/logout`, `/forgot-password`, `/unauthorized` and the components: LoginForm, SessionProvider, RoleGate (wrapper), AuthGuardRoute, IdleSessionWarning. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B02's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F03 - API Client & Global Data Layer

## Priority
P0

## Goal
Provide a typed API client (fetch/axios wrapper), request/response interceptors, caching via React Query, and a global error/loading model reused by all modules.

## Why This Module Exists
This module implements the "Foundation" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor, Manufacturer, Administrator the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor, Manufacturer, Administrator

## Dependencies
F02

## Screens / Routes
- `(no dedicated route – shared infrastructure)`

## Components To Build
- **ApiClient** — reusable component; responsible for its named function within API Client & Global Data Layer; emits relevant success/error/change events to the parent screen.
- **QueryClientProvider** — reusable component; responsible for its named function within API Client & Global Data Layer; emits relevant success/error/change events to the parent screen.
- **useApiQuery/useApiMutation hooks** — reusable component; responsible for its named function within API Client & Global Data Layer; emits relevant success/error/change events to the parent screen.
- **GlobalErrorBoundary** — reusable component; responsible for its named function within API Client & Global Data Layer; emits relevant success/error/change events to the parent screen.
- **RequestInterceptor (attach JWT)** — reusable component; responsible for its named function within API Client & Global Data Layer; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f03-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f03-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f03-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | Yes | Yes |
| Edit/Submit | Yes | Review-only | Yes | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | Yes | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
As shared infrastructure, this module exposes the offline-detection primitives (network status hook, request queue) that field-facing modules (F09–F12, F38) build on.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f03_viewed`
- `f03_action_submitted`
- `f03_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open (no dedicated route – shared infrastructure), THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens (no dedicated route – shared infrastructure), performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F03 (API Client & Global Data Layer) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f03/`. Build the routes `(no dedicated route – shared infrastructure)` and the components: ApiClient, QueryClientProvider, useApiQuery/useApiMutation hooks, GlobalErrorBoundary, RequestInterceptor (attach JWT). Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B03's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F04 - Global State, Forms & Validation Infrastructure

## Priority
P0

## Goal
Set up global state management (Zustand/Redux Toolkit), shared form primitives (React Hook Form + Zod), and reusable validation patterns.

## Why This Module Exists
This module implements the "Foundation" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor, Manufacturer, Administrator the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor, Manufacturer, Administrator

## Dependencies
F03

## Screens / Routes
- `(no dedicated route – shared infrastructure)`

## Components To Build
- **AppStore** — reusable component; responsible for its named function within Global State, Forms & Validation Infrastructure; emits relevant success/error/change events to the parent screen.
- **FormField** — reusable component; responsible for its named function within Global State, Forms & Validation Infrastructure; emits relevant success/error/change events to the parent screen.
- **FormWrapper** — reusable component; responsible for its named function within Global State, Forms & Validation Infrastructure; emits relevant success/error/change events to the parent screen.
- **ValidationSchemaRegistry** — reusable component; responsible for its named function within Global State, Forms & Validation Infrastructure; emits relevant success/error/change events to the parent screen.
- **FileUploadField** — reusable component; responsible for its named function within Global State, Forms & Validation Infrastructure; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f04-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f04-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f04-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | Yes | Yes |
| Edit/Submit | Yes | Review-only | Yes | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | Yes | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
As shared infrastructure, this module exposes the offline-detection primitives (network status hook, request queue) that field-facing modules (F09–F12, F38) build on.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f04_viewed`
- `f04_action_submitted`
- `f04_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open (no dedicated route – shared infrastructure), THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens (no dedicated route – shared infrastructure), performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F04 (Global State, Forms & Validation Infrastructure) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f04/`. Build the routes `(no dedicated route – shared infrastructure)` and the components: AppStore, FormField, FormWrapper, ValidationSchemaRegistry, FileUploadField. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B04's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F05 - Accessibility, Responsive & Error-Handling Foundation

## Priority
P0

## Goal
Bake in accessibility primitives, responsive breakpoints/PWA shell, and a consistent error/empty/loading state library used across all modules.

## Why This Module Exists
This module implements the "Foundation" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor, Manufacturer, Administrator the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor, Manufacturer, Administrator

## Dependencies
F04

## Screens / Routes
- `(no dedicated route – shared infrastructure)`

## Components To Build
- **SkeletonLoader** — reusable component; responsible for its named function within Accessibility, Responsive & Error-Handling Foundation; emits relevant success/error/change events to the parent screen.
- **EmptyState** — reusable component; responsible for its named function within Accessibility, Responsive & Error-Handling Foundation; emits relevant success/error/change events to the parent screen.
- **ErrorState** — reusable component; responsible for its named function within Accessibility, Responsive & Error-Handling Foundation; emits relevant success/error/change events to the parent screen.
- **OfflineBanner** — reusable component; responsible for its named function within Accessibility, Responsive & Error-Handling Foundation; emits relevant success/error/change events to the parent screen.
- **A11yLiveRegion** — reusable component; responsible for its named function within Accessibility, Responsive & Error-Handling Foundation; emits relevant success/error/change events to the parent screen.
- **PWA manifest/service-worker registration** — reusable component; responsible for its named function within Accessibility, Responsive & Error-Handling Foundation; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f05-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f05-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f05-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | Yes | Yes |
| Edit/Submit | Yes | Review-only | Yes | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | Yes | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
As shared infrastructure, this module exposes the offline-detection primitives (network status hook, request queue) that field-facing modules (F09–F12, F38) build on.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f05_viewed`
- `f05_action_submitted`
- `f05_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open (no dedicated route – shared infrastructure), THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens (no dedicated route – shared infrastructure), performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F05 (Accessibility, Responsive & Error-Handling Foundation) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f05/`. Build the routes `(no dedicated route – shared infrastructure)` and the components: SkeletonLoader, EmptyState, ErrorState, OfflineBanner, A11yLiveRegion, PWA manifest/service-worker registration. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B05's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F06 - Inspector Dashboard

## Priority
P0

## Goal
Give inspectors a home screen summarizing today's inspections, pending manual reviews, and quick access to start a new inspection.

## Why This Module Exists
This module implements the "Core Inspection" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/dashboard`

## Components To Build
- **DashboardKPICards** — reusable component; responsible for its named function within Inspector Dashboard; emits relevant success/error/change events to the parent screen.
- **RecentInspectionsList** — reusable component; responsible for its named function within Inspector Dashboard; emits relevant success/error/change events to the parent screen.
- **PendingReviewWidget** — reusable component; responsible for its named function within Inspector Dashboard; emits relevant success/error/change events to the parent screen.
- **QuickStartInspectionButton** — reusable component; responsible for its named function within Inspector Dashboard; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f06-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f06-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f06-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | No | No | Yes |
| Edit/Submit | Yes | No | No | Yes |
| Approve/Override | No | No | No | Yes |
| Export | Yes | No | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f06_viewed`
- `f06_action_submitted`
- `f06_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /dashboard, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /dashboard, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F06 (Inspector Dashboard) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f06/`. Build the routes `/dashboard` and the components: DashboardKPICards, RecentInspectionsList, PendingReviewWidget, QuickStartInspectionButton. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B06's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F07 - New Inspection Wizard

## Priority
P0

## Goal
Multi-step wizard to create a new inspection: product/category metadata, location, and initiation of the evidence-capture flow.

## Why This Module Exists
This module implements the "Core Inspection" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/new`

## Components To Build
- **WizardStepper** — reusable component; responsible for its named function within New Inspection Wizard; emits relevant success/error/change events to the parent screen.
- **ProductMetadataForm** — reusable component; responsible for its named function within New Inspection Wizard; emits relevant success/error/change events to the parent screen.
- **CategorySelector** — reusable component; responsible for its named function within New Inspection Wizard; emits relevant success/error/change events to the parent screen.
- **LocationPicker** — reusable component; responsible for its named function within New Inspection Wizard; emits relevant success/error/change events to the parent screen.
- **WizardSummaryStep** — reusable component; responsible for its named function within New Inspection Wizard; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f07-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f07-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f07-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | No | No | Yes |
| Edit/Submit | Yes | No | No | Yes |
| Approve/Override | No | No | No | Yes |
| Export | Yes | No | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f07_viewed`
- `f07_action_submitted`
- `f07_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/new, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/new, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F07 (New Inspection Wizard) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f07/`. Build the routes `/inspections/new` and the components: WizardStepper, ProductMetadataForm, CategorySelector, LocationPicker, WizardSummaryStep. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B07's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F08 - Product & Category Metadata Entry

## Priority
P0

## Goal
Capture product identity (brand, manufacturer, category, package type) used to select applicable rules downstream.

## Why This Module Exists
This module implements the "Core Inspection" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/new/product`

## Components To Build
- **ProductForm** — reusable component; responsible for its named function within Product & Category Metadata Entry; emits relevant success/error/change events to the parent screen.
- **CategoryAutocomplete** — reusable component; responsible for its named function within Product & Category Metadata Entry; emits relevant success/error/change events to the parent screen.
- **ManufacturerLookup** — reusable component; responsible for its named function within Product & Category Metadata Entry; emits relevant success/error/change events to the parent screen.
- **PackageTypeSelect** — reusable component; responsible for its named function within Product & Category Metadata Entry; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f08-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f08-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f08-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | No | No | Yes |
| Edit/Submit | Yes | No | No | Yes |
| Approve/Override | No | No | No | Yes |
| Export | Yes | No | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f08_viewed`
- `f08_action_submitted`
- `f08_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/new/product, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/new/product, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F08 (Product & Category Metadata Entry) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f08/`. Build the routes `/inspections/new/product` and the components: ProductForm, CategoryAutocomplete, ManufacturerLookup, PackageTypeSelect. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B08's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F09 - Multi-Side Image Capture, Camera & Upload

## Priority
P0

## Goal
Allow inspectors to capture (device camera) or upload front/back/side package images, with drag-drop, multi-file, and per-side tagging.

## Why This Module Exists
This module implements the "Core Inspection" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Manufacturer the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Manufacturer

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/capture`

## Components To Build
- **CameraCapture** — reusable component; responsible for its named function within Multi-Side Image Capture, Camera & Upload; emits relevant success/error/change events to the parent screen.
- **MultiImageUploader** — reusable component; responsible for its named function within Multi-Side Image Capture, Camera & Upload; emits relevant success/error/change events to the parent screen.
- **ImageSideTagger** — reusable component; responsible for its named function within Multi-Side Image Capture, Camera & Upload; emits relevant success/error/change events to the parent screen.
- **UploadProgressList** — reusable component; responsible for its named function within Multi-Side Image Capture, Camera & Upload; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f09-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f09-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f09-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | No | Yes | Yes |
| Edit/Submit | Yes | No | Yes | Yes |
| Approve/Override | No | No | No | Yes |
| Export | Yes | No | Yes | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f09_viewed`
- `f09_action_submitted`
- `f09_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/capture, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/capture, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F09 (Multi-Side Image Capture, Camera & Upload) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f09/`. Build the routes `/inspections/:id/capture` and the components: CameraCapture, MultiImageUploader, ImageSideTagger, UploadProgressList. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B09's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F10 - Image Quality Guidance

## Priority
P0

## Goal
Give real-time feedback on blur, glare, crop and framing so inspectors retake bad photos before submission.

## Why This Module Exists
This module implements the "Core Inspection" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Manufacturer the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Manufacturer

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/capture`

## Components To Build
- **QualityScoreBadge** — reusable component; responsible for its named function within Image Quality Guidance; emits relevant success/error/change events to the parent screen.
- **BlurGlareWarning** — reusable component; responsible for its named function within Image Quality Guidance; emits relevant success/error/change events to the parent screen.
- **RetakePrompt** — reusable component; responsible for its named function within Image Quality Guidance; emits relevant success/error/change events to the parent screen.
- **FramingOverlayGuide** — reusable component; responsible for its named function within Image Quality Guidance; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f10-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f10-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f10-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | No | Yes | Yes |
| Edit/Submit | Yes | No | Yes | Yes |
| Approve/Override | No | No | No | Yes |
| Export | Yes | No | Yes | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f10_viewed`
- `f10_action_submitted`
- `f10_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/capture, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/capture, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F10 (Image Quality Guidance) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f10/`. Build the routes `/inspections/:id/capture` and the components: QualityScoreBadge, BlurGlareWarning, RetakePrompt, FramingOverlayGuide. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B10's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F11 - OCR/Extraction Processing & Progress Status

## Priority
P0

## Goal
Show unified processing status across image upload → quality check → OCR → vision → field extraction, with progress and failure states.

## Why This Module Exists
This module implements the "Core Inspection" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/processing`

## Components To Build
- **ProcessingTimeline** — reusable component; responsible for its named function within OCR/Extraction Processing & Progress Status; emits relevant success/error/change events to the parent screen.
- **ProgressStepIndicator** — reusable component; responsible for its named function within OCR/Extraction Processing & Progress Status; emits relevant success/error/change events to the parent screen.
- **ProcessingFailureRetry** — reusable component; responsible for its named function within OCR/Extraction Processing & Progress Status; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f11-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f11-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f11-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | No | No | Yes |
| Edit/Submit | Yes | No | No | Yes |
| Approve/Override | No | No | No | Yes |
| Export | Yes | No | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f11_viewed`
- `f11_action_submitted`
- `f11_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/processing, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/processing, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F11 (OCR/Extraction Processing & Progress Status) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f11/`. Build the routes `/inspections/:id/processing` and the components: ProcessingTimeline, ProgressStepIndicator, ProcessingFailureRetry. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B11's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F12 - Extracted Declaration Review & OCR Correction

## Priority
P0

## Goal
Let inspectors review AI-extracted declarations (MRP, net quantity, manufacturer, dates, etc.), edit inaccurate OCR values, and confirm.

## Why This Module Exists
This module implements the "Core Inspection" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/declarations`

## Components To Build
- **DeclarationTable** — reusable component; responsible for its named function within Extracted Declaration Review & OCR Correction; emits relevant success/error/change events to the parent screen.
- **EditableDeclarationField** — reusable component; responsible for its named function within Extracted Declaration Review & OCR Correction; emits relevant success/error/change events to the parent screen.
- **ConfidenceBadge** — reusable component; responsible for its named function within Extracted Declaration Review & OCR Correction; emits relevant success/error/change events to the parent screen.
- **SourceEvidenceThumbnail** — reusable component; responsible for its named function within Extracted Declaration Review & OCR Correction; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f12-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f12-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f12-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | No | No | Yes |
| Edit/Submit | Yes | No | No | Yes |
| Approve/Override | No | No | No | Yes |
| Export | Yes | No | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f12_viewed`
- `f12_action_submitted`
- `f12_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/declarations, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/declarations, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F12 (Extracted Declaration Review & OCR Correction) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f12/`. Build the routes `/inspections/:id/declarations` and the components: DeclarationTable, EditableDeclarationField, ConfidenceBadge, SourceEvidenceThumbnail. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B12's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F13 - Rule Applicability & Category-Aware Rule Display

## Priority
P0

## Goal
Display the rule set selected for the product's category/version so inspectors understand what will be checked before running compliance.

## Why This Module Exists
This module implements the "Compliance Intelligence" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/rules`

## Components To Build
- **ApplicableRuleList** — reusable component; responsible for its named function within Rule Applicability & Category-Aware Rule Display; emits relevant success/error/change events to the parent screen.
- **RuleVersionBadge** — reusable component; responsible for its named function within Rule Applicability & Category-Aware Rule Display; emits relevant success/error/change events to the parent screen.
- **RuleLegalReferenceLink** — reusable component; responsible for its named function within Rule Applicability & Category-Aware Rule Display; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f13-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f13-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f13-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f13_viewed`
- `f13_action_submitted`
- `f13_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/rules, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/rules, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F13 (Rule Applicability & Category-Aware Rule Display) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f13/`. Build the routes `/inspections/:id/rules` and the components: ApplicableRuleList, RuleVersionBadge, RuleLegalReferenceLink. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B13's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F14 - Compliance Results, Violations & Confidence

## Priority
P0

## Goal
Show PASS/FLAG/MANUAL REVIEW per rule with severity, confidence score, and violation detail expansion.

## Why This Module Exists
This module implements the "Compliance Intelligence" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/results`

## Components To Build
- **ComplianceResultTable** — reusable component; responsible for its named function within Compliance Results, Violations & Confidence; emits relevant success/error/change events to the parent screen.
- **ViolationCard** — reusable component; responsible for its named function within Compliance Results, Violations & Confidence; emits relevant success/error/change events to the parent screen.
- **ConfidenceMeter** — reusable component; responsible for its named function within Compliance Results, Violations & Confidence; emits relevant success/error/change events to the parent screen.
- **SeverityTag** — reusable component; responsible for its named function within Compliance Results, Violations & Confidence; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f14-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f14-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f14-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f14_viewed`
- `f14_action_submitted`
- `f14_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/results, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/results, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F14 (Compliance Results, Violations & Confidence) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f14/`. Build the routes `/inspections/:id/results` and the components: ComplianceResultTable, ViolationCard, ConfidenceMeter, SeverityTag. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B14's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F15 - Evidence Highlighting & Bounding Boxes

## Priority
P0

## Goal
Overlay bounding boxes on package images linking each finding to the exact region of evidence that produced it.

## Why This Module Exists
This module implements the "Compliance Intelligence" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/evidence`

## Components To Build
- **ImageAnnotationCanvas** — reusable component; responsible for its named function within Evidence Highlighting & Bounding Boxes; emits relevant success/error/change events to the parent screen.
- **BoundingBoxOverlay** — reusable component; responsible for its named function within Evidence Highlighting & Bounding Boxes; emits relevant success/error/change events to the parent screen.
- **EvidenceZoomViewer** — reusable component; responsible for its named function within Evidence Highlighting & Bounding Boxes; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f15-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f15-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f15-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f15_viewed`
- `f15_action_submitted`
- `f15_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/evidence, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/evidence, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F15 (Evidence Highlighting & Bounding Boxes) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f15/`. Build the routes `/inspections/:id/evidence` and the components: ImageAnnotationCanvas, BoundingBoxOverlay, EvidenceZoomViewer. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B15's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F16 - Declaration Completeness & Format Validation Display

## Priority
P1

## Goal
Visualize which mandatory declarations are present/missing and whether format rules (patterns, units) are satisfied.

## Why This Module Exists
This module implements the "Compliance Intelligence" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/results`

## Components To Build
- **CompletenessChecklist** — reusable component; responsible for its named function within Declaration Completeness & Format Validation Display; emits relevant success/error/change events to the parent screen.
- **FormatValidationBadge** — reusable component; responsible for its named function within Declaration Completeness & Format Validation Display; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f16-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f16-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f16-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f16_viewed`
- `f16_action_submitted`
- `f16_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/results, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/results, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F16 (Declaration Completeness & Format Validation Display) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f16/`. Build the routes `/inspections/:id/results` and the components: CompletenessChecklist, FormatValidationBadge. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B16's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F17 - MRP & Net Quantity Validation Display

## Priority
P0

## Goal
Show MRP and net-quantity extraction results with validation status, unit checks, and rounding-rule flags.

## Why This Module Exists
This module implements the "Compliance Intelligence" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/results`

## Components To Build
- **MRPValidationCard** — reusable component; responsible for its named function within MRP & Net Quantity Validation Display; emits relevant success/error/change events to the parent screen.
- **NetQuantityValidationCard** — reusable component; responsible for its named function within MRP & Net Quantity Validation Display; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f17-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f17-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f17-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f17_viewed`
- `f17_action_submitted`
- `f17_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/results, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/results, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F17 (MRP & Net Quantity Validation Display) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f17/`. Build the routes `/inspections/:id/results` and the components: MRPValidationCard, NetQuantityValidationCard. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B17's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F18 - Manufacturer/Packer/Importer & Consumer-Care Display

## Priority
P0

## Goal
Display extracted manufacturer/packer/importer identity and consumer-care contact details with validation status.

## Why This Module Exists
This module implements the "Compliance Intelligence" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/results`

## Components To Build
- **EntityDeclarationCard** — reusable component; responsible for its named function within Manufacturer/Packer/Importer & Consumer-Care Display; emits relevant success/error/change events to the parent screen.
- **ConsumerCareCard** — reusable component; responsible for its named function within Manufacturer/Packer/Importer & Consumer-Care Display; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f18-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f18-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f18-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f18_viewed`
- `f18_action_submitted`
- `f18_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/results, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/results, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F18 (Manufacturer/Packer/Importer & Consumer-Care Display) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f18/`. Build the routes `/inspections/:id/results` and the components: EntityDeclarationCard, ConsumerCareCard. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B18's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F19 - Date Declaration & Placement/Readability/Font-Size Display

## Priority
P0

## Goal
Show manufacture/pack/import date detection plus placement, readability and font-size assistive analysis results.

## Why This Module Exists
This module implements the "Compliance Intelligence" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/results`

## Components To Build
- **DateDeclarationCard** — reusable component; responsible for its named function within Date Declaration & Placement/Readability/Font-Size Display; emits relevant success/error/change events to the parent screen.
- **PlacementAnalysisPanel** — reusable component; responsible for its named function within Date Declaration & Placement/Readability/Font-Size Display; emits relevant success/error/change events to the parent screen.
- **ReadabilityFontSizePanel** — reusable component; responsible for its named function within Date Declaration & Placement/Readability/Font-Size Display; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f19-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f19-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f19-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f19_viewed`
- `f19_action_submitted`
- `f19_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/results, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/results, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F19 (Date Declaration & Placement/Readability/Font-Size Display) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f19/`. Build the routes `/inspections/:id/results` and the components: DateDeclarationCard, PlacementAnalysisPanel, ReadabilityFontSizePanel. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B19's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F20 - Explainable Findings & "Ask Why?"

## Priority
P1

## Goal
Give inspectors a plain-language explanation of why a rule passed/failed, with legal reference and contributing evidence.

## Why This Module Exists
This module implements the "Compliance Intelligence" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/results`

## Components To Build
- **AskWhyPanel** — reusable component; responsible for its named function within Explainable Findings & "Ask Why?"; emits relevant success/error/change events to the parent screen.
- **LegalReferenceTooltip** — reusable component; responsible for its named function within Explainable Findings & "Ask Why?"; emits relevant success/error/change events to the parent screen.
- **ExplanationDrawer** — reusable component; responsible for its named function within Explainable Findings & "Ask Why?"; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f20-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f20-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f20-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f20_viewed`
- `f20_action_submitted`
- `f20_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/results, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/results, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F20 (Explainable Findings & "Ask Why?") in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f20/`. Build the routes `/inspections/:id/results` and the components: AskWhyPanel, LegalReferenceTooltip, ExplanationDrawer. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B20's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F21 - Compliance Heatmap

## Priority
P1

## Goal
Visual heatmap of compliant vs flagged declaration fields across the current inspection or across product history.

## Why This Module Exists
This module implements the "Compliance Intelligence" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/heatmap`

## Components To Build
- **ComplianceHeatmapGrid** — reusable component; responsible for its named function within Compliance Heatmap; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f21-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f21-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f21-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f21_viewed`
- `f21_action_submitted`
- `f21_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/heatmap, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/heatmap, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F21 (Compliance Heatmap) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f21/`. Build the routes `/inspections/:id/heatmap` and the components: ComplianceHeatmapGrid. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B21's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F22 - Manual Review Queue & Confidence Gate UI

## Priority
P0

## Goal
Surface low-confidence/ambiguous findings routed to manual review, with reviewer confirm/override-with-reason actions.

## Why This Module Exists
This module implements the "Compliance Intelligence" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/manual-review`
- `/manual-review`

## Components To Build
- **ManualReviewList** — reusable component; responsible for its named function within Manual Review Queue & Confidence Gate UI; emits relevant success/error/change events to the parent screen.
- **ReviewDecisionForm** — reusable component; responsible for its named function within Manual Review Queue & Confidence Gate UI; emits relevant success/error/change events to the parent screen.
- **OverrideReasonModal** — reusable component; responsible for its named function within Manual Review Queue & Confidence Gate UI; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f22-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f22-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f22-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f22_viewed`
- `f22_action_submitted`
- `f22_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/manual-review, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/manual-review, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F22 (Manual Review Queue & Confidence Gate UI) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f22/`. Build the routes `/inspections/:id/manual-review`, `/manual-review` and the components: ManualReviewList, ReviewDecisionForm, OverrideReasonModal. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B22's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F23 - Inspector Notes & Finding Annotation

## Priority
P0

## Goal
Free-text and structured note-taking attached to inspections or individual findings.

## Why This Module Exists
This module implements the "Compliance Intelligence" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/notes`

## Components To Build
- **NotesEditor** — reusable component; responsible for its named function within Inspector Notes & Finding Annotation; emits relevant success/error/change events to the parent screen.
- **NoteTimeline** — reusable component; responsible for its named function within Inspector Notes & Finding Annotation; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f23-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f23-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f23-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f23_viewed`
- `f23_action_submitted`
- `f23_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/notes, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/notes, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F23 (Inspector Notes & Finding Annotation) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f23/`. Build the routes `/inspections/:id/notes` and the components: NotesEditor, NoteTimeline. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B23's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F24 - Inspection Finalization & Disposition

## Priority
P0

## Goal
Lock an inspection, record final disposition (compliant/non-compliant/follow-up), and transition status.

## Why This Module Exists
This module implements the "Inspection Completion" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/finalize`

## Components To Build
- **FinalizeInspectionPanel** — reusable component; responsible for its named function within Inspection Finalization & Disposition; emits relevant success/error/change events to the parent screen.
- **DispositionSelector** — reusable component; responsible for its named function within Inspection Finalization & Disposition; emits relevant success/error/change events to the parent screen.
- **FinalizeConfirmModal** — reusable component; responsible for its named function within Inspection Finalization & Disposition; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f24-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f24-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f24-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f24_viewed`
- `f24_action_submitted`
- `f24_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/finalize, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/finalize, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F24 (Inspection Finalization & Disposition) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f24/`. Build the routes `/inspections/:id/finalize` and the components: FinalizeInspectionPanel, DispositionSelector, FinalizeConfirmModal. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B24's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F25 - Inspection History & Search/Filter

## Priority
P0

## Goal
Searchable, filterable list of past inspections by product, manufacturer, date, status, inspector.

## Why This Module Exists
This module implements the "Inspection Completion" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections`
- `/inspections/:id`

## Components To Build
- **InspectionSearchBar** — reusable component; responsible for its named function within Inspection History & Search/Filter; emits relevant success/error/change events to the parent screen.
- **InspectionFilterPanel** — reusable component; responsible for its named function within Inspection History & Search/Filter; emits relevant success/error/change events to the parent screen.
- **InspectionListTable** — reusable component; responsible for its named function within Inspection History & Search/Filter; emits relevant success/error/change events to the parent screen.
- **InspectionDetailView** — reusable component; responsible for its named function within Inspection History & Search/Filter; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f25-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f25-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f25-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f25_viewed`
- `f25_action_submitted`
- `f25_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F25 (Inspection History & Search/Filter) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f25/`. Build the routes `/inspections`, `/inspections/:id` and the components: InspectionSearchBar, InspectionFilterPanel, InspectionListTable, InspectionDetailView. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B25's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F26 - Report Generation & Export

## Priority
P0

## Goal
Generate and download PDF/editable compliance reports for a finished inspection, with preview before export.

## Why This Module Exists
This module implements the "Inspection Completion" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/report`

## Components To Build
- **ReportPreview** — reusable component; responsible for its named function within Report Generation & Export; emits relevant success/error/change events to the parent screen.
- **ReportGenerateButton** — reusable component; responsible for its named function within Report Generation & Export; emits relevant success/error/change events to the parent screen.
- **ReportDownloadLink** — reusable component; responsible for its named function within Report Generation & Export; emits relevant success/error/change events to the parent screen.
- **ReportEditableFieldsForm** — reusable component; responsible for its named function within Report Generation & Export; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f26-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f26-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f26-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f26_viewed`
- `f26_action_submitted`
- `f26_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/report, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/report, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F26 (Report Generation & Export) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f26/`. Build the routes `/inspections/:id/report` and the components: ReportPreview, ReportGenerateButton, ReportDownloadLink, ReportEditableFieldsForm. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B26's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F27 - Evidence Locker & Report History

## Priority
P0

## Goal
Central archive of all evidence images and generated report versions per inspection/product.

## Why This Module Exists
This module implements the "Inspection Completion" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/evidence-locker`
- `/reports`

## Components To Build
- **EvidenceLockerGrid** — reusable component; responsible for its named function within Evidence Locker & Report History; emits relevant success/error/change events to the parent screen.
- **ReportVersionList** — reusable component; responsible for its named function within Evidence Locker & Report History; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f27-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f27-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f27-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f27_viewed`
- `f27_action_submitted`
- `f27_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/evidence-locker, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/evidence-locker, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F27 (Evidence Locker & Report History) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f27/`. Build the routes `/inspections/:id/evidence-locker`, `/reports` and the components: EvidenceLockerGrid, ReportVersionList. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B27's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F28 - Supervisor / Enforcement Dashboard

## Priority
P0

## Goal
Operational KPI dashboard for supervisors: total/compliant/flagged/manual-review counts, trend sparkline.

## Why This Module Exists
This module implements the "Enforcement & Analytics" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/enforcement/dashboard`

## Components To Build
- **KPISummaryRow** — reusable component; responsible for its named function within Supervisor / Enforcement Dashboard; emits relevant success/error/change events to the parent screen.
- **TrendSparkline** — reusable component; responsible for its named function within Supervisor / Enforcement Dashboard; emits relevant success/error/change events to the parent screen.
- **StatusDistributionChart** — reusable component; responsible for its named function within Supervisor / Enforcement Dashboard; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f28-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f28-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f28-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | No | Yes | No | Yes |
| Edit/Submit | No | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | No | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f28_viewed`
- `f28_action_submitted`
- `f28_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /enforcement/dashboard, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /enforcement/dashboard, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F28 (Supervisor / Enforcement Dashboard) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f28/`. Build the routes `/enforcement/dashboard` and the components: KPISummaryRow, TrendSparkline, StatusDistributionChart. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B28's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F29 - Analytics: Violation Trends & Distribution

## Priority
P1

## Goal
Charts of violation types over time and distribution across rule categories.

## Why This Module Exists
This module implements the "Enforcement & Analytics" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/enforcement/analytics`

## Components To Build
- **ViolationTrendChart** — reusable component; responsible for its named function within Analytics: Violation Trends & Distribution; emits relevant success/error/change events to the parent screen.
- **ViolationDistributionChart** — reusable component; responsible for its named function within Analytics: Violation Trends & Distribution; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f29-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f29-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f29-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | No | Yes | No | Yes |
| Edit/Submit | No | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | No | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f29_viewed`
- `f29_action_submitted`
- `f29_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /enforcement/analytics, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /enforcement/analytics, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F29 (Analytics: Violation Trends & Distribution) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f29/`. Build the routes `/enforcement/analytics` and the components: ViolationTrendChart, ViolationDistributionChart. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B29's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F30 - Manufacturer/Category Pattern Analytics

## Priority
P1

## Goal
Surface repeat-offender manufacturers and category-level violation patterns.

## Why This Module Exists
This module implements the "Enforcement & Analytics" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/enforcement/patterns`

## Components To Build
- **ManufacturerPatternTable** — reusable component; responsible for its named function within Manufacturer/Category Pattern Analytics; emits relevant success/error/change events to the parent screen.
- **CategoryPatternChart** — reusable component; responsible for its named function within Manufacturer/Category Pattern Analytics; emits relevant success/error/change events to the parent screen.
- **RepeatViolationBadge** — reusable component; responsible for its named function within Manufacturer/Category Pattern Analytics; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f30-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f30-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f30-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | No | Yes | No | Yes |
| Edit/Submit | No | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | No | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f30_viewed`
- `f30_action_submitted`
- `f30_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /enforcement/patterns, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /enforcement/patterns, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F30 (Manufacturer/Category Pattern Analytics) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f30/`. Build the routes `/enforcement/patterns` and the components: ManufacturerPatternTable, CategoryPatternChart, RepeatViolationBadge. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B30's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F31 - Geographic Risk Visualization

## Priority
P2

## Goal
Map view of inspection/violation density where location data exists.

## Why This Module Exists
This module implements the "Enforcement & Analytics" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/enforcement/map`

## Components To Build
- **InspectionMapView** — reusable component; responsible for its named function within Geographic Risk Visualization; emits relevant success/error/change events to the parent screen.
- **RiskHeatLayer** — reusable component; responsible for its named function within Geographic Risk Visualization; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f31-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f31-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f31-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | No | Yes | No | Yes |
| Edit/Submit | No | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | No | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f31_viewed`
- `f31_action_submitted`
- `f31_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /enforcement/map, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /enforcement/map, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F31 (Geographic Risk Visualization) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f31/`. Build the routes `/enforcement/map` and the components: InspectionMapView, RiskHeatLayer. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B31's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F32 - Cases, Follow-Ups & Assignment Workflow

## Priority
P1

## Goal
Track open cases requiring follow-up, assign to inspectors, and monitor resolution status.

## Why This Module Exists
This module implements the "Enforcement & Analytics" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/enforcement/cases`

## Components To Build
- **CaseList** — reusable component; responsible for its named function within Cases, Follow-Ups & Assignment Workflow; emits relevant success/error/change events to the parent screen.
- **CaseDetailPanel** — reusable component; responsible for its named function within Cases, Follow-Ups & Assignment Workflow; emits relevant success/error/change events to the parent screen.
- **AssignmentSelector** — reusable component; responsible for its named function within Cases, Follow-Ups & Assignment Workflow; emits relevant success/error/change events to the parent screen.
- **FollowUpStatusTag** — reusable component; responsible for its named function within Cases, Follow-Ups & Assignment Workflow; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f32-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f32-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f32-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | No | Yes | No | Yes |
| Edit/Submit | No | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | No | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f32_viewed`
- `f32_action_submitted`
- `f32_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /enforcement/cases, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /enforcement/cases, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F32 (Cases, Follow-Ups & Assignment Workflow) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f32/`. Build the routes `/enforcement/cases` and the components: CaseList, CaseDetailPanel, AssignmentSelector, FollowUpStatusTag. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B32's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F33 - Risk Dashboard & Inspect-Next Queue

## Priority
P1

## Goal
The flagship predictive-inspection UI: explainable risk scores per product/manufacturer/category and a prioritized Inspect-Next queue.

## Why This Module Exists
This module implements the "Enforcement & Analytics" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Supervisor, Inspector the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Supervisor, Inspector

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/enforcement/inspect-next`

## Components To Build
- **RiskScoreCard** — reusable component; responsible for its named function within Risk Dashboard & Inspect-Next Queue; emits relevant success/error/change events to the parent screen.
- **RiskFactorBreakdown** — reusable component; responsible for its named function within Risk Dashboard & Inspect-Next Queue; emits relevant success/error/change events to the parent screen.
- **InspectNextQueueList** — reusable component; responsible for its named function within Risk Dashboard & Inspect-Next Queue; emits relevant success/error/change events to the parent screen.
- **DataSufficiencyBadge** — reusable component; responsible for its named function within Risk Dashboard & Inspect-Next Queue; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f33-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f33-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f33-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f33_viewed`
- `f33_action_submitted`
- `f33_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /enforcement/inspect-next, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /enforcement/inspect-next, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F33 (Risk Dashboard & Inspect-Next Queue) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f33/`. Build the routes `/enforcement/inspect-next` and the components: RiskScoreCard, RiskFactorBreakdown, InspectNextQueueList, DataSufficiencyBadge. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B33's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F34 - Manufacturer Dashboard

## Priority
P1

## Goal
Manufacturer's home screen: product compliance summary, recent self-scans, remediation status.

## Why This Module Exists
This module implements the "Manufacturer Portal" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Manufacturer the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Manufacturer

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/manufacturer/dashboard`

## Components To Build
- **ManufacturerKPICards** — reusable component; responsible for its named function within Manufacturer Dashboard; emits relevant success/error/change events to the parent screen.
- **ProductComplianceSummary** — reusable component; responsible for its named function within Manufacturer Dashboard; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f34-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f34-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f34-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | No | No | Yes | Yes |
| Edit/Submit | No | No | Yes | Yes |
| Approve/Override | No | No | No | Yes |
| Export | No | No | Yes | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f34_viewed`
- `f34_action_submitted`
- `f34_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /manufacturer/dashboard, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /manufacturer/dashboard, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F34 (Manufacturer Dashboard) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f34/`. Build the routes `/manufacturer/dashboard` and the components: ManufacturerKPICards, ProductComplianceSummary. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B34's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F35 - Manufacturer Product Library & Artwork Management

## Priority
P1

## Goal
Manage products and packaging artwork versions for self-compliance screening.

## Why This Module Exists
This module implements the "Manufacturer Portal" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Manufacturer the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Manufacturer

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/manufacturer/products`
- `/manufacturer/products/:id`

## Components To Build
- **ProductLibraryGrid** — reusable component; responsible for its named function within Manufacturer Product Library & Artwork Management; emits relevant success/error/change events to the parent screen.
- **ArtworkUploadPanel** — reusable component; responsible for its named function within Manufacturer Product Library & Artwork Management; emits relevant success/error/change events to the parent screen.
- **ArtworkVersionList** — reusable component; responsible for its named function within Manufacturer Product Library & Artwork Management; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f35-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f35-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f35-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | No | No | Yes | Yes |
| Edit/Submit | No | No | Yes | Yes |
| Approve/Override | No | No | No | Yes |
| Export | No | No | Yes | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f35_viewed`
- `f35_action_submitted`
- `f35_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /manufacturer/products, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /manufacturer/products, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F35 (Manufacturer Product Library & Artwork Management) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f35/`. Build the routes `/manufacturer/products`, `/manufacturer/products/:id` and the components: ProductLibraryGrid, ArtworkUploadPanel, ArtworkVersionList. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B35's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F36 - Manufacturer Pre-Compliance Scan & Remediation Checklist

## Priority
P1

## Goal
Run the same scan/rule pipeline for manufacturers pre-market, returning a remediation checklist.

## Why This Module Exists
This module implements the "Manufacturer Portal" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Manufacturer the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Manufacturer

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/manufacturer/products/:id/scan`

## Components To Build
- **SelfScanTrigger** — reusable component; responsible for its named function within Manufacturer Pre-Compliance Scan & Remediation Checklist; emits relevant success/error/change events to the parent screen.
- **RemediationChecklist** — reusable component; responsible for its named function within Manufacturer Pre-Compliance Scan & Remediation Checklist; emits relevant success/error/change events to the parent screen.
- **IssueDetailCard** — reusable component; responsible for its named function within Manufacturer Pre-Compliance Scan & Remediation Checklist; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f36-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f36-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f36-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | No | No | Yes | Yes |
| Edit/Submit | No | No | Yes | Yes |
| Approve/Override | No | No | No | Yes |
| Export | No | No | Yes | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f36_viewed`
- `f36_action_submitted`
- `f36_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /manufacturer/products/:id/scan, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /manufacturer/products/:id/scan, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F36 (Manufacturer Pre-Compliance Scan & Remediation Checklist) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f36/`. Build the routes `/manufacturer/products/:id/scan` and the components: SelfScanTrigger, RemediationChecklist, IssueDetailCard. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B36's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F37 - Before/After Comparison & Rescan

## Priority
P1

## Goal
Upload corrected artwork, rescan, and compare before/after results plus maintain compliance history.

## Why This Module Exists
This module implements the "Manufacturer Portal" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Manufacturer the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Manufacturer

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/manufacturer/products/:id/rescan`
- `/manufacturer/products/:id/history`

## Components To Build
- **BeforeAfterComparisonView** — reusable component; responsible for its named function within Before/After Comparison & Rescan; emits relevant success/error/change events to the parent screen.
- **RescanButton** — reusable component; responsible for its named function within Before/After Comparison & Rescan; emits relevant success/error/change events to the parent screen.
- **ProductComplianceHistoryTimeline** — reusable component; responsible for its named function within Before/After Comparison & Rescan; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f37-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f37-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f37-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | No | No | Yes | Yes |
| Edit/Submit | No | No | Yes | Yes |
| Approve/Override | No | No | No | Yes |
| Export | No | No | Yes | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f37_viewed`
- `f37_action_submitted`
- `f37_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /manufacturer/products/:id/rescan, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /manufacturer/products/:id/rescan, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F37 (Before/After Comparison & Rescan) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f37/`. Build the routes `/manufacturer/products/:id/rescan`, `/manufacturer/products/:id/history` and the components: BeforeAfterComparisonView, RescanButton, ProductComplianceHistoryTimeline. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B37's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F38 - Offline Inspection Queue & Sync Status

## Priority
P2

## Goal
Allow inspectors in low-connectivity field conditions to queue inspections locally and sync when back online.

## Why This Module Exists
This module implements the "Advanced/Demo" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/offline-queue`

## Components To Build
- **OfflineQueueList** — reusable component; responsible for its named function within Offline Inspection Queue & Sync Status; emits relevant success/error/change events to the parent screen.
- **SyncStatusIndicator** — reusable component; responsible for its named function within Offline Inspection Queue & Sync Status; emits relevant success/error/change events to the parent screen.
- **ConflictResolutionModal** — reusable component; responsible for its named function within Offline Inspection Queue & Sync Status; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f38-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f38-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f38-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | No | No | Yes |
| Edit/Submit | Yes | No | No | Yes |
| Approve/Override | No | No | No | Yes |
| Export | Yes | No | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f38_viewed`
- `f38_action_submitted`
- `f38_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/offline-queue, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/offline-queue, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F38 (Offline Inspection Queue & Sync Status) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f38/`. Build the routes `/inspections/offline-queue` and the components: OfflineQueueList, SyncStatusIndicator, ConflictResolutionModal. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B38's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F39 - Explainable Evidence Mode & Inspection Timeline

## Priority
P2

## Goal
Judge-facing demo feature: a guided explainable walk-through of a finding, plus a chronological inspection timeline.

## Why This Module Exists
This module implements the "Advanced/Demo" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/explainable-evidence`
- `/inspections/:id/timeline`

## Components To Build
- **ExplainableEvidenceWalkthrough** — reusable component; responsible for its named function within Explainable Evidence Mode & Inspection Timeline; emits relevant success/error/change events to the parent screen.
- **InspectionTimelineView** — reusable component; responsible for its named function within Explainable Evidence Mode & Inspection Timeline; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f39-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f39-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f39-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f39_viewed`
- `f39_action_submitted`
- `f39_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/explainable-evidence, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/explainable-evidence, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F39 (Explainable Evidence Mode & Inspection Timeline) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f39/`. Build the routes `/inspections/:id/explainable-evidence`, `/inspections/:id/timeline` and the components: ExplainableEvidenceWalkthrough, InspectionTimelineView. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B39's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.


---

# F40 - Smart Report & Scan Quality Coach

## Priority
P2

## Goal
Auto-summarized 'smart' report narrative and a live coaching overlay that helps inspectors capture better images.

## Why This Module Exists
This module implements the "Advanced/Demo" portion of the SIH26034 Legal Metrology Compliance Platform blueprint, supporting the end-to-end workflow (Scan → Extract → Validate → Explain → Record → Report → Learn → Prioritize). It gives Inspector, Supervisor the interface needed to carry out their responsibilities as defined in the problem statement (Ministry of Consumer Affairs, DoCA — Legal Metrology (Packaged Commodities) Rules, 2011 compliance checking).

## User Roles
Inspector, Supervisor

## Dependencies
F01–F05 (App Shell, Auth/RBAC, API Client, State/Forms, Accessibility Foundation)

## Screens / Routes
- `/inspections/:id/smart-report`

## Components To Build
- **SmartReportSummaryPanel** — reusable component; responsible for its named function within Smart Report & Scan Quality Coach; emits relevant success/error/change events to the parent screen.
- **ScanQualityCoachOverlay** — reusable component; responsible for its named function within Smart Report & Scan Quality Coach; emits relevant success/error/change events to the parent screen.

## User Experience
On entry, the user sees a clearly labelled screen with a primary action prominent above the fold. Interactive elements (buttons, fields) are disabled until required data is present, and every disabled control shows a tooltip explaining why. While data is loading, skeleton placeholders matching the final layout are shown instead of a blank screen or spinner-only state. Successful actions trigger a toast/inline confirmation; failures show a specific, actionable error message rather than a generic "Something went wrong." Empty states (e.g., no inspections yet, no declarations extracted yet) show a short explanation plus the primary next action the user should take.

## Functional Requirements
- Render the module's primary data (list, form, or visualization) from the API described below, with pagination/virtualization for lists over 50 items.
- All user-editable fields validate on blur and on submit; submit is blocked until validation passes.
- All destructive or state-changing actions (finalize, override, delete) require a confirmation step.
- All role-restricted actions are hidden (not just disabled) for roles that lack permission, per the RBAC table below.
- The module must degrade gracefully when a dependent API is slow or unavailable (timeout after 15s, show retry).

## State & Data Requirements
- **Local state**: transient UI state (open/closed panels, selected tab, form draft values) held in component state.
- **Global state**: current user/role/session (from F02), active inspection context where relevant (from F07/F09).
- **Server state**: fetched via the shared API client (F03) using React Query; cached with a short stale-time and invalidated after mutations.
- **Form state**: managed via React Hook Form + the shared ValidationSchemaRegistry (F04).
- **Image/inspection state**: where this module touches evidence or declarations, it reads/writes through the Inspection/Evidence/Declaration types shared across modules — never duplicates them locally.

## API Integration
- `GET /api/v1/f40-primary-resource` — fetch the module's main data. Request: query params for filters/pagination. Response: `{ items: [...], total, page }`. Loading → skeleton; error → ErrorState with retry.
- `POST /api/v1/f40-primary-resource` — create/submit action for this module (where applicable). Request: validated form payload. Response: `{ id, status }`. Loading → disable submit + spinner on button; error → inline field/form error.
- `PATCH /api/v1/f40-primary-resource/:id` — update/correct action (where applicable). Request: partial payload. Response: updated resource. Optimistic update with rollback on failure.

## Validation Rules
Required fields are marked and blocked at submit; numeric fields (MRP, net quantity) must be positive numbers with a valid unit; dates must be valid and not in the future where the domain requires it; file uploads are restricted to image MIME types (jpeg/png/webp) and a maximum size (10MB per image).

## Permission / RBAC Behaviour
| Action | Inspector | Supervisor | Manufacturer | Administrator |
|---|---|---|---|---|
| View | Yes | Yes | No | Yes |
| Edit/Submit | Yes | Review-only | No | Yes |
| Approve/Override | No | Yes | No | Yes |
| Export | Yes | Yes | No | Yes |

## Loading States
Skeleton cards/rows matching the final layout; button-level spinners for in-flight mutations; a top-of-page progress bar for multi-step processing (OCR/vision) where relevant.

## Empty States
A short message plus a single primary call-to-action (e.g., "No inspections yet — Start a new inspection").

## Error States
- Network failure → retry banner.
- Session expired → redirect to `/login` with a "please sign in again" message.
- Permission denied (403) → inline "You don't have access to this action" message, action hidden on reload.
- Unsupported file type/size → inline file-picker error.
- Dependent processing unavailable (OCR/vision down) → "Processing temporarily unavailable — you can retry or save as draft."
- Incomplete inspection (missing required prior step) → redirect user to the missing step with an explanation.

## Accessibility Requirements
All interactive elements are reachable and operable via keyboard (Tab/Enter/Esc); form fields have associated `<label>`s and `aria-describedby` error text; live regions announce async status changes (upload complete, scan finished); status is never conveyed by colour alone — icons/text accompany every status badge; focus moves to the first error on failed submit.

## Responsive Behaviour
Desktop: multi-column layout with side panels. Tablet: single-column with collapsible side panels. Mobile (primary field-use case for inspectors): single-column, large touch targets, camera capture optimized for one-handed use, sticky primary action button.

## Offline / Poor Network Considerations
Actions in this module are queued locally (via the Offline Inspection Queue, F38) when network is unavailable, and synced automatically on reconnect with a visible sync-status indicator.

## Security / Privacy Considerations
Evidence images are rendered via short-lived signed URLs (never public links); JWTs are never stored in localStorage (httpOnly cookie or in-memory + refresh flow); RBAC is enforced both by hiding UI and by the backend rejecting unauthorized calls; PII (manufacturer contact details) is shown only to roles authorized to see it.

## Analytics / Audit Events
- `f40_viewed`
- `f40_action_submitted`
- `f40_action_failed`
(Only functional/audit-relevant events are recorded — no unnecessary behavioural tracking.)

## Edge Cases
- User navigates away mid-action (draft is preserved where feasible).
- Duplicate submit via double-click (button disabled after first click, idempotency key sent).
- Very long product/manufacturer names overflow gracefully (truncate + tooltip).
- Concurrent edits by two users on the same inspection (last-write-wins with a warning banner).
- Slow 3G field connection during image upload (chunked/resumable upload with visible progress).

## Acceptance Criteria
1. GIVEN a user with an allowed role, WHEN they open /inspections/:id/smart-report, THEN the primary data loads and renders within the loading-state pattern above.
2. GIVEN a user without permission, WHEN they attempt the restricted action, THEN the action is hidden/blocked and a 403 is never silently ignored.
3. GIVEN invalid input, WHEN the user submits, THEN inline validation errors appear and no API call is made.
4. GIVEN a successful submit, WHEN the mutation completes, THEN a success toast appears and the list/detail view reflects the change without a full page reload.
5. GIVEN a network failure, WHEN the request fails, THEN a retry-capable error state is shown.
6. GIVEN the screen is empty of data, WHEN it first loads, THEN the empty state with a primary CTA is shown.
7. GIVEN keyboard-only navigation, WHEN the user tabs through the screen, THEN all actions are reachable and focus order is logical.
8. GIVEN a mobile viewport, WHEN the screen renders, THEN it collapses to a single-column, touch-friendly layout.

## Demo Scenario
Presenter opens /inspections/:id/smart-report, performs the module's primary action live (e.g., uploads a real package image / reviews a real extracted field / opens the risk queue), and narrates how it maps directly to the inspection workflow step it represents — completing in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Frontend Module F40 (Smart Report & Scan Quality Coach) in the `frontend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `frontend/src/modules/f40/`. Build the routes `/inspections/:id/smart-report` and the components: SmartReportSummaryPanel, ScanQualityCoachOverlay. Integrate with F01 (App Shell/Design System), F02 (Auth/RBAC), F03 (API Client), F04 (Global State/Forms) and F05 (Accessibility/Responsive foundation) — do not duplicate shell, auth, or API-client logic. Consume the API contract described in "API Integration" above (adjust exact paths to match the corresponding Backend Module B40's real endpoints once available; use MSW mocks until then). Implement all states described above: loading (skeletons), empty, error (network/permission/validation/session-expiry), and success. Enforce the RBAC table above using the shared RoleGate component from F02 — hide, don't just disable, unauthorized actions. Implement full keyboard accessibility and responsive behaviour per the Accessibility/Responsive sections above, with mobile-first layout given inspectors work in the field. Where the module touches evidence or inspection state, integrate with the Offline Inspection Queue (F38) so actions are not lost on poor connectivity. Fire the audit/analytics events listed above. Write component tests (React Testing Library) covering every acceptance criterion listed above, plus a basic accessibility test (axe). Do not implement any other module's screens or business logic in this task.
