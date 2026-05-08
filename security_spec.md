# Firestore Security Specification

## 1. Data Invariants
- **User Integrity**: Users can only read/write their own profile (/users/{uid}).
- **Tenant Isolation**: Contacts and Channels belong to a tenant. Users can only access them if they share the same `tenantId`.
- **Identity Integrity**: All writes for resources with `agentId` or `userId` MUST match the authenticated user's UID.
- **Relational Integrity**: 
  - To create a `Listing`, the user must be authenticated.
  - To create a `Lead`, the user must be authenticated.
  - Sub-resources (if any) must be validated against their parents.
- **Schema Safety**: All strings must have length limits (e.g., 500 chars).
- **Temporal Integrity**: `createdAt` must match `request.time` on create. `updatedAt` must match `request.time` on update.

## 2. The "Dirty Dozen" Payloads

### P1: Account Takeover (Identity Spoofing)
- **Target**: `users/other_user_id`
- **Payload**: `{ "name": "Fake Name" }`
- **Goal**: Write to a profile not owned by the user.
- **Expectation**: `PERMISSION_DENIED`

### P2: Global Data Scraping
- **Target**: `contacts` (list)
- **Query**: `getDocs(collection(db, 'contacts'))` without where clause.
- **Goal**: Read all contacts from all tenants.
- **Expectation**: `PERMISSION_DENIED`

### P3: Tenant ID Poisoning
- **Target**: `contacts` (create)
- **Payload**: `{ "name": "Target Contact", "tenantId": "other_tenant_id" }`
- **Goal**: Inject data into another tenant.
- **Expectation**: `PERMISSION_DENIED` (if rules check user's tenantId)

### P4: Resource Exhaustion (Denial of Wallet)
- **Target**: `listings` (create)
- **Payload**: `{ "address": "A".repeat(1024 * 1024), "price": "1B" }`
- **Goal**: Write a huge document.
- **Expectation**: `PERMISSION_DENIED` (size check)

### P5: Agent Identity Hijacking
- **Target**: `listings` (create)
- **Payload**: `{ "address": "123 Main St", "agentId": "not_me", "price": "500k", "status": "Active" }`
- **Goal**: Attribute a listing to another agent.
- **Expectation**: `PERMISSION_DENIED`

### P6: Status Skipping (Workflow Bypass)
- **Target**: `listings` (create)
- **Payload**: `{ "address": "123 Main St", "agentId": "me", "price": "500k", "status": "Sold" }`
- **Goal**: Create a listing directly as sold.
- **Expectation**: `PERMISSION_DENIED` (if rules enforce status flow)

### P7: ID Injection
- **Target**: `listings/../../../etc/passwd` (or similar junk id)
- **Payload**: `{ ... }`
- **Goal**: Test ID validation.
- **Expectation**: `PERMISSION_DENIED`

### P8: Field Mutation (Immutable Fields)
- **Target**: `listings/my_listing` (update)
- **Payload**: `{ "agentId": "new_agent" }`
- **Goal**: Transfer ownership of a listing.
- **Expectation**: `PERMISSION_DENIED`

### P9: Privilege Escalation
- **Target**: `users/me` (update)
- **Payload**: `{ "isAdmin": true }`
- **Goal**: Set a private admin flag.
- **Expectation**: `PERMISSION_DENIED`

### P10: PII Leak
- **Target**: `leads/someone_elses_lead` (get)
- **Goal**: Read private contact info of a lead managed by another agent.
- **Expectation**: `PERMISSION_DENIED`

### P11: Sync Bypass (Atomicity)
- **Target**: `transactions/txn1` (create)
- **Goal**: Create a transaction without updating the related deal status.
- **Expectation**: `PERMISSION_DENIED` (if using `existsAfter`)

### P12: Unverified Auth Access
- **Target**: `leads` (create)
- **Goal**: Write data with an unverified email account.
- **Expectation**: `PERMISSION_DENIED`

## 3. The Test Runner

*Note: In the AI Studio environment, we use eslint-plugin-security-rules for validation.*

```typescript
// firestore.rules.test.ts
// (Conceptual test suite for CI/CD)
// ... tests for each payload above ...
```
