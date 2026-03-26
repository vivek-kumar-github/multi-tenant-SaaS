# Multi-tenant SaaS Configuration Engine (College Mini Project)

## Overview
This project demonstrates a multi-tenant configuration system with strong isolation, permissions, and audit trails.

### Core features implemented
- JWT-based authentication (tenant + admin)
- Role-based authorization (`tenant` and `admin`)
- Per-tenant isolation in middleware and DB queries
- MongoDB tenant config storage with unique index
- Git audit logging on every config update
- Provisioning script with directory creation, permission hardening, and optional DB registration
- Config file sync to `data/tenants/<tenantId>/config.json`

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start MongoDB locally (or configure `MONGO_URI`).
3. Set optional environment vars:
   - `JWT_SECRET` (default: `super-secret-dev-key`)
   - `MONGO_URI` (default: `mongodb://127.0.0.1:27017/saas_db`)
   - `PORT` (default: `3000`)
4. Start server:
   ```bash
   npm start
   ```

## API endpoints
- `POST /auth/signup` { email, password, role, tenantId }
- `POST /auth/login` { email, password }
- `GET /tenant/config` (Bearer token)
- `POST /tenant/config` (Bearer token)
- `POST /admin/tenant` (Bearer token and admin role)

### Developer notes
- axios/Postman may be used to test authentication and tenant CRUD.
- Tenant operations use the authenticated user’s tenant ID and will reject mismatched `x-tenant-id`.

## Testing manually
1. Create an admin:
   ```bash
   curl -X POST http://localhost:3000/auth/signup -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"AdminPwd1","role":"admin"}'
   ```
2. Login as admin; copy token.
3. Create tenant:
   ```bash
   curl -X POST http://localhost:3000/admin/tenant -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' -d '{"tenantId":"acme","settings":{"theme":"blue"}}'
   ```
4. Create tenant user, login, set config.

## Security actions implemented
- OAuth-style bearer JWT with role and tenantId claims.
- Strict file permissions on config storage.
- Tenant-specific Redis keys and DB query filters.
- Audit git commits in `data` folder.
