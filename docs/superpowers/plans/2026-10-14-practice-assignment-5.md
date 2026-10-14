# Practice Assignment 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement MongoDB-backed accounts, JWT authentication/logout revocation, role infrastructure, and owner-aware protected Todos.

**Architecture:** Mongoose schemas persist accounts, todos, and revoked token JTIs. AccountService handles registration/login/logout, AuthGuard authenticates every todo request, and TodosService enforces owner/admin access rules.

**Tech Stack:** NestJS, TypeScript, MongoDB/Mongoose, bcrypt, JWT, class-validator, Jest.

**Spec:** `docs/superpowers/specs/2026-10-14-practice-assignment-5-design.md`

## Global Constraints
- Account email is required, unique, lowercase.
- Password is required, bcrypt-hashed, never returned.
- Registration role is always `user`.
- Login failure returns generic 401.
- Logout invalidates current token.
- `/todos` requires authentication; owner comes from authenticated account.

## Review Focus
- Duplicate email -> 409.
- Missing/invalid/revoked JWT -> 401.
- Existing todo owned by another user -> 403.
- Missing todo -> 404.
- Admin can access all todos while user sees only own.

---

### Task 1: Account persistence and registration/login
**Files:** `src/account/*`
- [x] Write failing account service tests.
- [x] Verify RED.
- [x] Implement Account schema, DTOs, service, controller, module.
- [x] Verify GREEN.

### Task 2: JWT authentication and logout revocation
**Files:** `src/auth/*`, `src/account/revoked-token.schema.ts`
- [x] Write failing AuthGuard tests.
- [x] Verify RED.
- [x] Implement token payload, revocation persistence, AuthGuard, Roles decorator/guard.
- [x] Verify GREEN.

### Task 3: Todo persistence and access rules
**Files:** `src/todos/*`
- [x] Write failing todo service tests.
- [x] Verify RED.
- [x] Implement Todo schema/service/controller/module with owner/admin rules.
- [x] Verify GREEN.

### Task 4: Application configuration and verification
**Files:** `src/app.module.ts`, `src/main.ts`, `.env.example`, `README.md`
- [x] Wire MongoDB, modules, validation.
- [x] Run full test suite.
- [x] Run production build.
