# Modular Monolith Architecture

## Overview

This server is a modular monolith: one deployable runtime (Express app), isolated business modules, and shared infrastructure.

## Layers

### `src/app`
Application bootstrap, environment config, CORS, route composition.

### `src/common`
Shared technical building blocks:

- DI container (tsyringe)
- Prisma wrapper and base abstractions
- Event bus for module-to-module communication
- Shared error model + global middleware
- Auth middleware

### `src/modules/*`
Each business domain encapsulates:

- `controllers/` HTTP entrypoints
- `services/` use-cases and business logic
- `repositories/` persistence logic
- `models/` domain contracts + DTOs

## Implemented Modules

### IAM
- Registration and login with bcrypt password hashing.
- Session resolution via cookie JWT.
- Logout with cookie clearing.

### Leads
- Full CRUD operations.
- Auto-assignment using lead distribution rules.
- Event publishing on create/update (`leads.created`, `leads.updated`).

## Event-driven Integration

A lightweight in-process event bus (`EventBus`) allows modules to publish/subscribe to domain events without hard coupling.

## Scalability Path

The monolith can later evolve to services by extracting modules with minimal internal refactoring, because each module already owns controller/service/repository boundaries.
