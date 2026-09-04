# BACKEND_40_MODULE_PROMPTS.md
## SIH26034 — AI-Assisted Legal Metrology Compliance & Inspection Platform
### 40 Backend Module Implementation Prompts (B01–B40)

Stack: Node.js + Express.js + TypeScript, REST APIs, PostgreSQL, S3-compatible object storage for evidence/reports. Product philosophy: AI/OCR/Vision are assistive only; a deterministic, versioned rule engine performs legal compliance checks; low-confidence/ambiguous findings route to manual review; risk scoring is explainable inspection-prioritization, never a claim of legal guilt or proof of wrongdoing. External AI/storage providers are always accessed through adapter interfaces so vendors can be swapped.

---

# B01 - Application Bootstrap & Configuration

## Priority
P0

## Goal
Set up the Node.js/Express + TypeScript service skeleton, environment-based configuration, and startup lifecycle.

## Why This Module Exists
This module implements the "Foundation" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
None — this is the first foundation module

## Domain Entities
User, Config

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b01` — list/query resource. Roles: all authenticated roles with view permission on User.
- `POST /api/v1/b01` — create resource / trigger action. Roles: role(s) authorized to write User (see Authentication/Authorization).
- `GET /api/v1/b01/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b01/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (set up the node.js/express + typescript service skeleton, environment-based configuration, and startup lifecycle).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `01_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B01 (Application Bootstrap & Configuration) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b01/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for User, Config per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B02 - Database & Schema Foundation (PostgreSQL)

## Priority
P0

## Goal
Provision PostgreSQL, connection pooling, migration tooling, and base schema conventions (timestamps, soft delete, UUID PKs).

## Why This Module Exists
This module implements the "Foundation" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01

## Domain Entities
All entities (base schema)

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b02` — list/query resource. Roles: all authenticated roles with view permission on All entities (base schema).
- `POST /api/v1/b02` — create resource / trigger action. Roles: role(s) authorized to write All entities (base schema) (see Authentication/Authorization).
- `GET /api/v1/b02/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b02/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (provision postgresql, connection pooling, migration tooling, and base schema conventions (timestamps, soft delete, uuid pks)).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `02_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B02 (Database & Schema Foundation (PostgreSQL)) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b02/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for All entities (base schema) per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B03 - Security Middleware & Request Validation

## Priority
P0

## Goal
Global security middleware: helmet, CORS, rate limiting, payload size limits, and request schema validation (Zod).

## Why This Module Exists
This module implements the "Foundation" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B02

## Domain Entities
N/A (cross-cutting)

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b03` — list/query resource. Roles: all authenticated roles with view permission on N/A (cross-cutting).
- `POST /api/v1/b03` — create resource / trigger action. Roles: role(s) authorized to write N/A (cross-cutting) (see Authentication/Authorization).
- `GET /api/v1/b03/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b03/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (global security middleware: helmet, cors, rate limiting, payload size limits, and request schema validation (zod)).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `03_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B03 (Security Middleware & Request Validation) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b03/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for N/A (cross-cutting) per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B04 - Authentication & Session Security

## Priority
P0

## Goal
JWT-based authentication, refresh tokens, password hashing, and secure session/token storage.

## Why This Module Exists
This module implements the "Foundation" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B03

## Domain Entities
User, Session

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b04` — list/query resource. Roles: all authenticated roles with view permission on User.
- `POST /api/v1/b04` — create resource / trigger action. Roles: role(s) authorized to write User (see Authentication/Authorization).
- `GET /api/v1/b04/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b04/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (jwt-based authentication, refresh tokens, password hashing, and secure session/token storage).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `04_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B04 (Authentication & Session Security) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b04/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for User, Session per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B05 - RBAC & Authorization Engine

## Priority
P0

## Goal
Role/permission model (Inspector, Supervisor, Manufacturer, Administrator) and a reusable authorization guard.

## Why This Module Exists
This module implements the "Foundation" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B04

## Domain Entities
User, Role, Permission

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b05` — list/query resource. Roles: all authenticated roles with view permission on User.
- `POST /api/v1/b05` — create resource / trigger action. Roles: role(s) authorized to write User (see Authentication/Authorization).
- `GET /api/v1/b05/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b05/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (role/permission model (inspector, supervisor, manufacturer, administrator) and a reusable authorization guard).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `05_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B05 (RBAC & Authorization Engine) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b05/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for User, Role, Permission per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B06 - Error Handling & Audit Logging Core

## Priority
P0

## Goal
Centralized error-response format, machine-readable error codes, and the AuditLog write pipeline used by every module.

## Why This Module Exists
This module implements the "Foundation" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B05

## Domain Entities
AuditLog

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b06` — list/query resource. Roles: all authenticated roles with view permission on AuditLog.
- `POST /api/v1/b06` — create resource / trigger action. Roles: role(s) authorized to write AuditLog (see Authentication/Authorization).
- `GET /api/v1/b06/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b06/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (centralized error-response format, machine-readable error codes, and the auditlog write pipeline used by every module).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `06_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B06 (Error Handling & Audit Logging Core) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b06/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for AuditLog per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B07 - User Management Service

## Priority
P0

## Goal
CRUD and lifecycle management for users across all roles, invitation flow, and status management.

## Why This Module Exists
This module implements the "Core Domain" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
User

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b07` — list/query resource. Roles: all authenticated roles with view permission on User.
- `POST /api/v1/b07` — create resource / trigger action. Roles: role(s) authorized to write User (see Authentication/Authorization).
- `GET /api/v1/b07/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b07/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (crud and lifecycle management for users across all roles, invitation flow, and status management).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `07_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B07 (User Management Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b07/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for User per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B08 - Product Management Service

## Priority
P0

## Goal
CRUD for products/categories, brand/manufacturer linkage, package-type metadata used for rule selection.

## Why This Module Exists
This module implements the "Core Domain" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Product

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b08` — list/query resource. Roles: all authenticated roles with view permission on Product.
- `POST /api/v1/b08` — create resource / trigger action. Roles: role(s) authorized to write Product (see Authentication/Authorization).
- `GET /api/v1/b08/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b08/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (crud for products/categories, brand/manufacturer linkage, package-type metadata used for rule selection).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `08_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B08 (Product Management Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b08/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Product per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B09 - Inspection Lifecycle Service

## Priority
P0

## Goal
Create/read/update inspection records and manage state transitions (draft → processing → reviewed → finalized).

## Why This Module Exists
This module implements the "Core Domain" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Inspection

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b09` — list/query resource. Roles: all authenticated roles with view permission on Inspection.
- `POST /api/v1/b09` — create resource / trigger action. Roles: role(s) authorized to write Inspection (see Authentication/Authorization).
- `GET /api/v1/b09/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b09/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (create/read/update inspection records and manage state transitions (draft → processing → reviewed → finalized)).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `09_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B09 (Inspection Lifecycle Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b09/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Inspection per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B10 - Evidence & Object Storage Service

## Priority
P0

## Goal
Secure upload, storage and retrieval of package images/evidence in object storage (S3-compatible), with signed URLs.

## Why This Module Exists
This module implements the "Core Domain" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Evidence

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b10` — list/query resource. Roles: all authenticated roles with view permission on Evidence.
- `POST /api/v1/b10` — create resource / trigger action. Roles: role(s) authorized to write Evidence (see Authentication/Authorization).
- `GET /api/v1/b10/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b10/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (secure upload, storage and retrieval of package images/evidence in object storage (s3-compatible), with signed urls).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `10_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
This module MUST NOT call any OCR/Vision/LLM/storage vendor SDK directly from domain logic. All such calls go through the provider-adapter interfaces defined in B14 (OCR), B15 (Vision) and B10 (Object Storage), so the vendor can be swapped without touching business logic. Any LLM usage here is limited to generating human-readable explanations of already-computed deterministic results — the LLM never decides PASS/FLAG/REVIEW.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B10 (Evidence & Object Storage Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b10/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Evidence per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B11 - Image Management & Metadata Service

## Priority
P0

## Goal
Track per-image metadata: package side, timestamp, dimensions, checksum, linkage to inspection/evidence.

## Why This Module Exists
This module implements the "Core Domain" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Evidence

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b11` — list/query resource. Roles: all authenticated roles with view permission on Evidence.
- `POST /api/v1/b11` — create resource / trigger action. Roles: role(s) authorized to write Evidence (see Authentication/Authorization).
- `GET /api/v1/b11/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b11/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (track per-image metadata: package side, timestamp, dimensions, checksum, linkage to inspection/evidence).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `11_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B11 (Image Management & Metadata Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b11/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Evidence per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B12 - Audit Trail Query Service

## Priority
P0

## Goal
Read/query API over AuditLog for supervisors/administrators, with filtering by actor/object/date.

## Why This Module Exists
This module implements the "Core Domain" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
AuditLog

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b12` — list/query resource. Roles: all authenticated roles with view permission on AuditLog.
- `POST /api/v1/b12` — create resource / trigger action. Roles: role(s) authorized to write AuditLog (see Authentication/Authorization).
- `GET /api/v1/b12/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b12/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (read/query api over auditlog for supervisors/administrators, with filtering by actor/object/date).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `12_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
This foundation module does not itself run background jobs, but the error/audit conventions it defines are used by all async job handlers.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B12 (Audit Trail Query Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b12/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for AuditLog per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B13 - Image Quality Analysis Service

## Priority
P0

## Goal
Analyze uploaded images for blur, glare, crop and framing issues and return a quality score before OCR runs.

## Why This Module Exists
This module implements the "AI/OCR Pipeline" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Evidence

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b13` — list/query resource. Roles: all authenticated roles with view permission on Evidence.
- `POST /api/v1/b13` — create resource / trigger action. Roles: role(s) authorized to write Evidence (see Authentication/Authorization).
- `GET /api/v1/b13/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b13/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (analyze uploaded images for blur, glare, crop and framing issues and return a quality score before ocr runs).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `13_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B13 (Image Quality Analysis Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b13/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Evidence per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B14 - OCR Orchestration & Provider Abstraction

## Priority
P0

## Goal
Provider-agnostic OCR interface (adapter pattern) orchestrating calls to an OCR engine/API and normalizing raw text output.

## Why This Module Exists
This module implements the "AI/OCR Pipeline" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Evidence, Declaration

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b14` — list/query resource. Roles: all authenticated roles with view permission on Evidence.
- `POST /api/v1/b14` — create resource / trigger action. Roles: role(s) authorized to write Evidence (see Authentication/Authorization).
- `GET /api/v1/b14/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b14/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (provider-agnostic ocr interface (adapter pattern) orchestrating calls to an ocr engine/api and normalizing raw text output).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `14_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: OCR extraction.

## External Service Abstraction
This module MUST NOT call any OCR/Vision/LLM/storage vendor SDK directly from domain logic. All such calls go through the provider-adapter interfaces defined in B14 (OCR), B15 (Vision) and B10 (Object Storage), so the vendor can be swapped without touching business logic. Any LLM usage here is limited to generating human-readable explanations of already-computed deterministic results — the LLM never decides PASS/FLAG/REVIEW.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B14 (OCR Orchestration & Provider Abstraction) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b14/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Evidence, Declaration per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B15 - Vision Orchestration & Provider Abstraction

## Priority
P0

## Goal
Provider-agnostic computer-vision interface for label-region detection and bounding-box generation.

## Why This Module Exists
This module implements the "AI/OCR Pipeline" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Evidence, Declaration

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b15` — list/query resource. Roles: all authenticated roles with view permission on Evidence.
- `POST /api/v1/b15` — create resource / trigger action. Roles: role(s) authorized to write Evidence (see Authentication/Authorization).
- `GET /api/v1/b15/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b15/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (provider-agnostic computer-vision interface for label-region detection and bounding-box generation).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `15_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: vision analysis.

## External Service Abstraction
This module MUST NOT call any OCR/Vision/LLM/storage vendor SDK directly from domain logic. All such calls go through the provider-adapter interfaces defined in B14 (OCR), B15 (Vision) and B10 (Object Storage), so the vendor can be swapped without touching business logic. Any LLM usage here is limited to generating human-readable explanations of already-computed deterministic results — the LLM never decides PASS/FLAG/REVIEW.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B15 (Vision Orchestration & Provider Abstraction) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b15/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Evidence, Declaration per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B16 - Field Extraction Service

## Priority
P0

## Goal
Convert raw OCR/vision output into structured candidate declaration fields (MRP, net quantity, dates, entities, etc.).

## Why This Module Exists
This module implements the "AI/OCR Pipeline" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Declaration

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b16` — list/query resource. Roles: all authenticated roles with view permission on Declaration.
- `POST /api/v1/b16` — create resource / trigger action. Roles: role(s) authorized to write Declaration (see Authentication/Authorization).
- `GET /api/v1/b16/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b16/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (convert raw ocr/vision output into structured candidate declaration fields (mrp, net quantity, dates, entities, etc.)).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `16_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B16 (Field Extraction Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b16/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Declaration per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B17 - Declaration Normalization Service

## Priority
P0

## Goal
Normalize extracted values (currency, units, date formats) into canonical structured form for rule evaluation.

## Why This Module Exists
This module implements the "AI/OCR Pipeline" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Declaration

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b17` — list/query resource. Roles: all authenticated roles with view permission on Declaration.
- `POST /api/v1/b17` — create resource / trigger action. Roles: role(s) authorized to write Declaration (see Authentication/Authorization).
- `GET /api/v1/b17/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b17/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (normalize extracted values (currency, units, date formats) into canonical structured form for rule evaluation).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `17_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B17 (Declaration Normalization Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b17/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Declaration per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B18 - Confidence Scoring & Manual Correction Service

## Priority
P0

## Goal
Attach confidence scores to extracted fields and accept inspector corrections, recording verification status.

## Why This Module Exists
This module implements the "AI/OCR Pipeline" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Declaration

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b18` — list/query resource. Roles: all authenticated roles with view permission on Declaration.
- `POST /api/v1/b18` — create resource / trigger action. Roles: role(s) authorized to write Declaration (see Authentication/Authorization).
- `GET /api/v1/b18/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b18/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (attach confidence scores to extracted fields and accept inspector corrections, recording verification status).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `18_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B18 (Confidence Scoring & Manual Correction Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b18/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Declaration per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B19 - Rule Library & Versioning Service

## Priority
P0

## Goal
Store and version Legal Metrology rules with effective dates, legal references, and category applicability.

## Why This Module Exists
This module implements the "Compliance Engine" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Rule

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b19` — list/query resource. Roles: all authenticated roles with view permission on Rule.
- `POST /api/v1/b19` — create resource / trigger action. Roles: role(s) authorized to write Rule (see Authentication/Authorization).
- `GET /api/v1/b19/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b19/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (store and version legal metrology rules with effective dates, legal references, and category applicability).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `19_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B19 (Rule Library & Versioning Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b19/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Rule per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B20 - Rule Applicability Engine

## Priority
P0

## Goal
Select the applicable, currently-effective rule set for a given product/category at inspection time.

## Why This Module Exists
This module implements the "Compliance Engine" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Rule, Product

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b20` — list/query resource. Roles: all authenticated roles with view permission on Rule.
- `POST /api/v1/b20` — create resource / trigger action. Roles: role(s) authorized to write Rule (see Authentication/Authorization).
- `GET /api/v1/b20/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b20/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (select the applicable, currently-effective rule set for a given product/category at inspection time).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `20_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B20 (Rule Applicability Engine) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b20/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Rule, Product per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B21 - Declaration Completeness & Format Validation Engine

## Priority
P0

## Goal
Deterministic checks for mandatory-field presence and format/pattern validity.

## Why This Module Exists
This module implements the "Compliance Engine" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Declaration, Rule, CheckResult

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b21` — list/query resource. Roles: all authenticated roles with view permission on Declaration.
- `POST /api/v1/b21` — create resource / trigger action. Roles: role(s) authorized to write Declaration (see Authentication/Authorization).
- `GET /api/v1/b21/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b21/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (deterministic checks for mandatory-field presence and format/pattern validity).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `21_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B21 (Declaration Completeness & Format Validation Engine) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b21/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Declaration, Rule, CheckResult per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B22 - MRP & Net Quantity Validation Engine

## Priority
P0

## Goal
Deterministic checks specific to MRP declaration and net-quantity/unit correctness.

## Why This Module Exists
This module implements the "Compliance Engine" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Declaration, Rule, CheckResult

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b22` — list/query resource. Roles: all authenticated roles with view permission on Declaration.
- `POST /api/v1/b22` — create resource / trigger action. Roles: role(s) authorized to write Declaration (see Authentication/Authorization).
- `GET /api/v1/b22/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b22/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (deterministic checks specific to mrp declaration and net-quantity/unit correctness).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `22_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B22 (MRP & Net Quantity Validation Engine) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b22/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Declaration, Rule, CheckResult per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B23 - Manufacturer/Packer/Importer & Consumer-Care Validation Engine

## Priority
P0

## Goal
Deterministic checks for entity declarations (manufacturer/packer/importer) and consumer-care details.

## Why This Module Exists
This module implements the "Compliance Engine" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Declaration, Rule, CheckResult

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b23` — list/query resource. Roles: all authenticated roles with view permission on Declaration.
- `POST /api/v1/b23` — create resource / trigger action. Roles: role(s) authorized to write Declaration (see Authentication/Authorization).
- `GET /api/v1/b23/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b23/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (deterministic checks for entity declarations (manufacturer/packer/importer) and consumer-care details).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `23_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B23 (Manufacturer/Packer/Importer & Consumer-Care Validation Engine) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b23/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Declaration, Rule, CheckResult per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B24 - Date & Placement/Readability/Font-Size Validation Engine

## Priority
P0

## Goal
Deterministic date-declaration checks plus assistive placement/readability/font-size scoring from vision output.

## Why This Module Exists
This module implements the "Compliance Engine" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Declaration, Rule, CheckResult

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b24` — list/query resource. Roles: all authenticated roles with view permission on Declaration.
- `POST /api/v1/b24` — create resource / trigger action. Roles: role(s) authorized to write Declaration (see Authentication/Authorization).
- `GET /api/v1/b24/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b24/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (deterministic date-declaration checks plus assistive placement/readability/font-size scoring from vision output).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `24_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B24 (Date & Placement/Readability/Font-Size Validation Engine) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b24/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Declaration, Rule, CheckResult per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B25 - Violation Generation & Evidence Mapping Service

## Priority
P0

## Goal
Convert failed/uncertain CheckResults into Violation records linked to supporting evidence and bounding boxes.

## Why This Module Exists
This module implements the "Compliance Engine" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
CheckResult, Violation, Evidence

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b25` — list/query resource. Roles: all authenticated roles with view permission on CheckResult.
- `POST /api/v1/b25` — create resource / trigger action. Roles: role(s) authorized to write CheckResult (see Authentication/Authorization).
- `GET /api/v1/b25/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b25/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (convert failed/uncertain checkresults into violation records linked to supporting evidence and bounding boxes).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `25_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B25 (Violation Generation & Evidence Mapping Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b25/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for CheckResult, Violation, Evidence per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B26 - Manual Review & Override Workflow Service

## Priority
P0

## Goal
Route low-confidence/ambiguous CheckResults to a manual-review queue; record inspector confirm/override with reason.

## Why This Module Exists
This module implements the "Compliance Engine" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
CheckResult, Violation

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b26` — list/query resource. Roles: all authenticated roles with view permission on CheckResult.
- `POST /api/v1/b26` — create resource / trigger action. Roles: role(s) authorized to write CheckResult (see Authentication/Authorization).
- `GET /api/v1/b26/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b26/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (route low-confidence/ambiguous checkresults to a manual-review queue; record inspector confirm/override with reason).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `26_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B26 (Manual Review & Override Workflow Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b26/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for CheckResult, Violation per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B27 - Inspection Search & History Service

## Priority
P0

## Goal
Query API for searching/filtering historical inspections by product, manufacturer, date, status, inspector.

## Why This Module Exists
This module implements the "Reports & History" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Inspection

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b27` — list/query resource. Roles: all authenticated roles with view permission on Inspection.
- `POST /api/v1/b27` — create resource / trigger action. Roles: role(s) authorized to write Inspection (see Authentication/Authorization).
- `GET /api/v1/b27/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b27/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (query api for searching/filtering historical inspections by product, manufacturer, date, status, inspector).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `27_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B27 (Inspection Search & History Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b27/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Inspection per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B28 - Evidence Locker Service

## Priority
P0

## Goal
Aggregate and serve all evidence for an inspection/product for locker-style browsing.

## Why This Module Exists
This module implements the "Reports & History" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Evidence

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b28` — list/query resource. Roles: all authenticated roles with view permission on Evidence.
- `POST /api/v1/b28` — create resource / trigger action. Roles: role(s) authorized to write Evidence (see Authentication/Authorization).
- `GET /api/v1/b28/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b28/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (aggregate and serve all evidence for an inspection/product for locker-style browsing).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `28_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B28 (Evidence Locker Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b28/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Evidence per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B29 - Report Generation & PDF/Editable Export Service

## Priority
P0

## Goal
Generate PDF and editable-format compliance reports from finalized inspection data.

## Why This Module Exists
This module implements the "Reports & History" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Report

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b29` — list/query resource. Roles: all authenticated roles with view permission on Report.
- `POST /api/v1/b29` — create resource / trigger action. Roles: role(s) authorized to write Report (see Authentication/Authorization).
- `GET /api/v1/b29/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b29/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (generate pdf and editable-format compliance reports from finalized inspection data).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `29_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: report generation.

## External Service Abstraction
This module MUST NOT call any OCR/Vision/LLM/storage vendor SDK directly from domain logic. All such calls go through the provider-adapter interfaces defined in B14 (OCR), B15 (Vision) and B10 (Object Storage), so the vendor can be swapped without touching business logic. Any LLM usage here is limited to generating human-readable explanations of already-computed deterministic results — the LLM never decides PASS/FLAG/REVIEW.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B29 (Report Generation & PDF/Editable Export Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b29/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Report per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B30 - Report Versioning & History Service

## Priority
P0

## Goal
Track multiple report versions per inspection and serve report history queries.

## Why This Module Exists
This module implements the "Reports & History" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Report

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b30` — list/query resource. Roles: all authenticated roles with view permission on Report.
- `POST /api/v1/b30` — create resource / trigger action. Roles: role(s) authorized to write Report (see Authentication/Authorization).
- `GET /api/v1/b30/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b30/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (track multiple report versions per inspection and serve report history queries).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `30_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: report generation.

## External Service Abstraction
This module MUST NOT call any OCR/Vision/LLM/storage vendor SDK directly from domain logic. All such calls go through the provider-adapter interfaces defined in B14 (OCR), B15 (Vision) and B10 (Object Storage), so the vendor can be swapped without touching business logic. Any LLM usage here is limited to generating human-readable explanations of already-computed deterministic results — the LLM never decides PASS/FLAG/REVIEW.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B30 (Report Versioning & History Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b30/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Report per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B31 - Analytics Aggregation Service

## Priority
P1

## Goal
Aggregate raw inspection/violation data into dashboard-ready KPI and trend datasets.

## Why This Module Exists
This module implements the "Analytics & Predictive Inspection" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Inspection, Violation

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b31` — list/query resource. Roles: all authenticated roles with view permission on Inspection.
- `POST /api/v1/b31` — create resource / trigger action. Roles: role(s) authorized to write Inspection (see Authentication/Authorization).
- `GET /api/v1/b31/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b31/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (aggregate raw inspection/violation data into dashboard-ready kpi and trend datasets).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `31_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: analytics aggregation.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B31 (Analytics Aggregation Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b31/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Inspection, Violation per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B32 - Violation Trend & Pattern Detection Service

## Priority
P1

## Goal
Detect manufacturer/category violation patterns and repeat-violation signals over time.

## Why This Module Exists
This module implements the "Analytics & Predictive Inspection" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Violation, Product

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b32` — list/query resource. Roles: all authenticated roles with view permission on Violation.
- `POST /api/v1/b32` — create resource / trigger action. Roles: role(s) authorized to write Violation (see Authentication/Authorization).
- `GET /api/v1/b32/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b32/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (detect manufacturer/category violation patterns and repeat-violation signals over time).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `32_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B32 (Violation Trend & Pattern Detection Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b32/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Violation, Product per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B33 - Geographic Analysis Service

## Priority
P2

## Goal
Aggregate inspection/violation data by location for map-based visualization.

## Why This Module Exists
This module implements the "Analytics & Predictive Inspection" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Inspection

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b33` — list/query resource. Roles: all authenticated roles with view permission on Inspection.
- `POST /api/v1/b33` — create resource / trigger action. Roles: role(s) authorized to write Inspection (see Authentication/Authorization).
- `GET /api/v1/b33/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b33/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (aggregate inspection/violation data by location for map-based visualization).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `33_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B33 (Geographic Analysis Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b33/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Inspection per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B34 - Risk Scoring Engine

## Priority
P1

## Goal
Compute explainable risk scores per product/category/manufacturer from historical inspection outcomes.

## Why This Module Exists
This module implements the "Analytics & Predictive Inspection" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
RiskProfile

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b34` — list/query resource. Roles: all authenticated roles with view permission on RiskProfile.
- `POST /api/v1/b34` — create resource / trigger action. Roles: role(s) authorized to write RiskProfile (see Authentication/Authorization).
- `GET /api/v1/b34/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b34/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (compute explainable risk scores per product/category/manufacturer from historical inspection outcomes).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `34_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: risk-score recomputation.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B34 (Risk Scoring Engine) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b34/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for RiskProfile per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B35 - Inspect-Next Queue Service

## Priority
P1

## Goal
Rank entities by risk score into a prioritized Inspect-Next queue, refreshed as new outcomes are recorded.

## Why This Module Exists
This module implements the "Analytics & Predictive Inspection" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
RiskProfile

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b35` — list/query resource. Roles: all authenticated roles with view permission on RiskProfile.
- `POST /api/v1/b35` — create resource / trigger action. Roles: role(s) authorized to write RiskProfile (see Authentication/Authorization).
- `GET /api/v1/b35/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b35/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (rank entities by risk score into a prioritized inspect-next queue, refreshed as new outcomes are recorded).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `35_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: risk-score recomputation.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B35 (Inspect-Next Queue Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b35/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for RiskProfile per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B36 - Manufacturer Account & Product Portal Service

## Priority
P1

## Goal
Manufacturer-scoped account management, product library, and artwork submission APIs.

## Why This Module Exists
This module implements the "Manufacturer & Enforcement" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Product, User

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b36` — list/query resource. Roles: all authenticated roles with view permission on Product.
- `POST /api/v1/b36` — create resource / trigger action. Roles: role(s) authorized to write Product (see Authentication/Authorization).
- `GET /api/v1/b36/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b36/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (manufacturer-scoped account management, product library, and artwork submission apis).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `36_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B36 (Manufacturer Account & Product Portal Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b36/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Product, User per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B37 - Manufacturer Self-Compliance Scan & Remediation Service

## Priority
P1

## Goal
Run the extraction/compliance pipeline against manufacturer-submitted artwork and produce a remediation checklist plus before/after comparison.

## Why This Module Exists
This module implements the "Manufacturer & Enforcement" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Declaration, CheckResult, Violation

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b37` — list/query resource. Roles: all authenticated roles with view permission on Declaration.
- `POST /api/v1/b37` — create resource / trigger action. Roles: role(s) authorized to write Declaration (see Authentication/Authorization).
- `GET /api/v1/b37/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b37/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (run the extraction/compliance pipeline against manufacturer-submitted artwork and produce a remediation checklist plus before/after comparison).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `37_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B37 (Manufacturer Self-Compliance Scan & Remediation Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b37/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Declaration, CheckResult, Violation per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B38 - Case, Follow-Up & Notification Service

## Priority
P1

## Goal
Manage enforcement cases, follow-up assignments, and (where appropriate) notifications.

## Why This Module Exists
This module implements the "Manufacturer & Enforcement" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Inspection, Violation

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b38` — list/query resource. Roles: all authenticated roles with view permission on Inspection.
- `POST /api/v1/b38` — create resource / trigger action. Roles: role(s) authorized to write Inspection (see Authentication/Authorization).
- `GET /api/v1/b38/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b38/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (manage enforcement cases, follow-up assignments, and (where appropriate) notifications).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `38_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B38 (Case, Follow-Up & Notification Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b38/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Inspection, Violation per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B39 - Background Jobs, Queues & Idempotency Service

## Priority
P1

## Goal
Job/queue infrastructure for OCR, vision, report generation and analytics, with idempotency keys and retry/backoff.

## Why This Module Exists
This module implements the "Reliability & Operations" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
N/A (infrastructure)

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b39` — list/query resource. Roles: all authenticated roles with view permission on N/A (infrastructure).
- `POST /api/v1/b39` — create resource / trigger action. Roles: role(s) authorized to write N/A (infrastructure) (see Authentication/Authorization).
- `GET /api/v1/b39/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b39/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (job/queue infrastructure for ocr, vision, report generation and analytics, with idempotency keys and retry/backoff).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `39_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B39 (Background Jobs, Queues & Idempotency Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b39/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for N/A (infrastructure) per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.


---

# B40 - Offline Sync, Observability & Performance Service

## Priority
P2

## Goal
Server-side support for offline inspection sync/conflict resolution, plus logging, metrics and performance tuning.

## Why This Module Exists
This module implements the "Reliability & Operations" layer of the SIH26034 Legal Metrology Compliance Platform backend, supporting the deterministic pipeline mandated by the blueprint: IMAGE → QUALITY ANALYSIS → OCR/VISION → FIELD EXTRACTION → STRUCTURED DECLARATIONS → RULE APPLICABILITY → VERSIONED RULE ENGINE → VISUAL ANALYSIS → CONFIDENCE GATE → PASS/FLAG/MANUAL REVIEW → EVIDENCE → REPORT → HISTORY → ANALYTICS → RISK-BASED PRIORITIZATION. AI/OCR/vision outputs are always treated as assistive input to a deterministic, versioned rule engine — never as the final legal authority.

## Dependencies
B01–B06 (Foundation: bootstrap, DB, security middleware, auth, RBAC, error/audit)

## Domain Entities
Inspection, Evidence

## Database Requirements
- Tables map 1:1 to the domain entities above, using UUID primary keys, `created_at`/`updated_at` timestamps, and `deleted_at` for soft deletion where records must be retained for audit.
- Foreign keys enforce referential integrity (e.g., Declaration.inspectionId → Inspection.id; Violation.inspectionId → Inspection.id; CheckResult.ruleId → Rule.id).
- Indexes on all foreign keys plus commonly filtered columns (status, category, createdAt, manufacturerId).
- Version fields (`ruleVersion`, `reportVersion`) are immutable once written; corrections create new versions rather than mutating history.
- No unnecessary normalization beyond what keeps declarations/evidence/rules independently queryable and auditable.

## API / Service Interface
- `GET /api/v1/b40` — list/query resource. Roles: all authenticated roles with view permission on Inspection.
- `POST /api/v1/b40` — create resource / trigger action. Roles: role(s) authorized to write Inspection (see Authentication/Authorization).
- `GET /api/v1/b40/:id` — fetch single resource by id, including related sub-resources needed by the frontend module of the same number.
- `PATCH /api/v1/b40/:id` — update/correct resource (e.g., manual correction, override, status transition).
Request/response bodies follow the entity shape defined in Section 11 (Data Model) of the blueprint, serialized as JSON; all endpoints require a valid bearer JWT except `/auth/login`.

## Core Business Logic
1. Validate the authenticated user's role/permission against the requested action.
2. Validate and normalize the incoming payload.
3. Execute the module's core responsibility (server-side support for offline inspection sync/conflict resolution, plus logging, metrics and performance tuning).
4. Persist the result transactionally; on multi-step operations (e.g., OCR → extraction → normalization), each step's output is persisted independently so partial failures are resumable.
5. Write an AuditLog entry for any create/update/override action.
6. Return a structured response including status and, where relevant, confidence/version metadata.

## Validation
All input is validated server-side using schema validation (Zod/Joi) regardless of what the frontend already validated. Numeric fields are range/type checked; file uploads are checked for real MIME type (not just extension) and size limit; foreign-key references are verified to exist before insert; state-transition endpoints reject invalid transitions (e.g., cannot finalize an inspection with unresolved manual-review items).

## Authentication / Authorization
Every endpoint requires a valid JWT (from B04) and passes through the RBAC guard (from B05). Role requirements are scoped to the entities this module owns — e.g., write access to Rule records is Administrator-only; write access to Inspection records is Inspector/Supervisor; Manufacturer-scoped endpoints only ever return data belonging to that manufacturer's own account.

## Audit Logging
Every create, update, override, and export action on this module's entities writes an AuditLog record capturing: acting user, action type, object type/id, timestamp, and (where applicable) previous vs. new value. Manual overrides additionally capture the stated reason.

## Errors
- `VALIDATION_ERROR` — payload failed schema validation.
- `PERMISSION_DENIED` — authenticated but not authorized for this action.
- `40_NOT_FOUND` — requested resource does not exist.
- `INVALID_STATE_TRANSITION` — action not permitted in the resource's current status.
- `INVALID_IMAGE` — uploaded file is not a supported/valid image (raised by modules touching Evidence).
- `RULE_VERSION_NOT_FOUND` — referenced rule version does not exist (raised by Compliance Engine modules).
- `OCR_PROCESSING_FAILED` / `VISION_PROCESSING_FAILED` — upstream extraction provider error (raised by AI/OCR Pipeline modules).

## Idempotency / Retry Behaviour
Write endpoints that trigger external processing (image upload, OCR/vision jobs, report generation) accept an `Idempotency-Key` header; a repeated request with the same key returns the original result rather than reprocessing. Background job handlers use at-least-once delivery with idempotent upserts keyed on the source record id + job type, so retries never create duplicate Declarations/CheckResults/Reports.

## Background Jobs
Enqueues/consumes a background job (via the queue infrastructure from B39) for: processing.

## External Service Abstraction
Where this module depends on OCR/Vision/Storage, it consumes them only through the adapter interfaces defined in B10/B14/B15 — never a vendor SDK directly.

## Logging & Observability
Structured JSON logs per request (requestId, userId, route, latency, outcome); no image bytes, OCR raw text, or secrets are ever written to logs. Key metrics: request latency, error rate by error code, job queue depth/age (for async modules).

## Security Considerations
Parameterized queries only (no string-built SQL); strict file-type/size validation and MIME sniffing (not extension trust) for any upload path; object-storage access via short-lived signed URLs, never public buckets; rate limiting on write and auth-adjacent endpoints; authorization checked on every request, not cached client-side; secrets loaded from environment/secret manager, never hard-coded.

## Performance Considerations
Indexes on all filter/sort columns used by the corresponding list endpoints; pagination (cursor or offset+limit) on all list endpoints; expensive operations (OCR, vision, report PDF generation, analytics aggregation) run asynchronously via background jobs rather than blocking the request; read-heavy analytics endpoints may use a materialized/aggregated table refreshed by a background job rather than computing on every request.

## Edge Cases
- Duplicate/near-duplicate image upload for the same inspection.
- Rule version changes mid-inspection (the inspection must continue using the version it started with).
- Manufacturer account submitting data for a product they do not own (rejected).
- Extremely low OCR confidence across an entire image (routed wholesale to manual review rather than silently failing).
- Concurrent updates to the same inspection by two roles (optimistic locking / last-write-wins with audit trail).

## Testing Requirements
- Unit tests for all business-logic functions (especially any deterministic validation/rule logic in this module).
- Integration tests against a test database for all endpoints (happy path + each error code above).
- Authorization tests verifying every role-restricted action rejects unauthorized roles.
- Idempotency/retry tests for any job-triggering endpoint.
- For Compliance Engine modules specifically: rule-engine test fixtures covering PASS, FLAG, and MANUAL REVIEW outcomes.

## Acceptance Criteria
1. GIVEN a valid authenticated request, WHEN the primary endpoint is called with valid data, THEN the resource is created/updated and a 2xx response with the expected shape is returned.
2. GIVEN an unauthorized role, WHEN they call a restricted endpoint, THEN a `PERMISSION_DENIED` (403) is returned and no data changes.
3. GIVEN invalid payload data, WHEN submitted, THEN `VALIDATION_ERROR` (400) is returned with field-level detail.
4. GIVEN a repeated request with the same Idempotency-Key, WHEN resubmitted, THEN no duplicate side effects occur.
5. GIVEN a successful write action, WHEN it completes, THEN a corresponding AuditLog record exists.
6. GIVEN an invalid state transition, WHEN attempted, THEN `INVALID_STATE_TRANSITION` is returned.
7. GIVEN this module's async dependency (OCR/Vision/queue) is unavailable, WHEN triggered, THEN the request fails gracefully with a retryable error rather than corrupting state.
8. GIVEN the module's list endpoint, WHEN queried with filters/pagination, THEN results match the filters and respect the page size.

## Demo Scenario
Presenter triggers this module's primary action via the connected frontend module (or a Postman/CLI call), and the resulting state change is shown immediately in the frontend UI and in the audit log — demonstrating the deterministic, traceable pipeline in under 45 seconds.

## FINAL IMPLEMENTATION PROMPT

> Implement Backend Module B40 (Offline Sync, Observability & Performance Service) in the `backend/` workspace of the SIH26034 Legal Metrology Compliance Platform monorepo, under `backend/src/modules/b40/` (routes, controller, service, repository layers). Add/extend the PostgreSQL schema for Inspection, Evidence per "Database Requirements" above (write a migration, do not hand-edit existing tables). Implement the endpoints in "API / Service Interface" above, wired through the B03 security middleware, B04 authentication and B05 RBAC guards — reuse them, do not reimplement. Implement the Core Business Logic steps above with server-side validation per "Validation" (never trust frontend validation alone). Emit the error codes listed above using the shared error-response format from B06. Write an AuditLog entry (via B06/B12) for every create/update/override action. Support the `Idempotency-Key` header for any endpoint that triggers processing or job enqueue, using the queue/idempotency infrastructure from B39 where this module runs async work. If this module touches OCR, Vision, object storage, or LLM explanation text, integrate only through the B10/B14/B15 provider-adapter interfaces — never call a vendor SDK directly from this module's business logic, and never let an LLM output be treated as the final PASS/FLAG/REVIEW decision (that is always the deterministic rule engine's job, per B19–B26). Add the indexes and pagination described under "Performance Considerations." Write the tests described under "Testing Requirements," covering every acceptance criterion above. Do not implement any other module's endpoints or business logic in this task.
