---
name: nestjs-backend
description: >-
  Expert workflows, architectural design, and clean code standards for NestJS backend applications.
  Use this skill whenever creating, refactoring, or reviewing NestJS modules, controllers, services,
  DTOs, guards, interceptors, middleware, and database ORM integrations.
---

# NestJS Backend Engineering Skill

This skill enforces strict Clean Architecture, Dependency Injection, and enterprise design patterns for NestJS applications.

---

## 1. Modular Directory Layout

Structure NestJS by domain features, keeping each module self-contained:

```text
src/
├── common/               # Cross-cutting concerns
│   ├── decorators/       # Custom param / method decorators
│   ├── filters/          # Global exception filters (HttpExceptionFilter)
│   ├── guards/           # Auth, Role, Rate-limit guards
│   ├── interceptors/     # Logging, Transform response interceptors
│   └── pipes/            # Validation & Parse UUID pipes
├── config/               # Environment configuration & validation
├── modules/              # Feature modules
│   ├── auth/
│   ├── products/
│   │   ├── dto/          # Data Transfer Objects (create, update, query)
│   │   ├── entities/     # DB entities / schemas
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── products.module.ts
│   └── orders/
├── app.module.ts         # Root application module
└── main.ts               # Entry point (bootstrap)
```

---

## 2. Core Architectural Principles

1. **Strict Controller Separation**:
   - Controllers handle HTTP transport ONLY (request routing, status codes, DTO validation).
   - **ZERO business logic** or database queries inside Controllers. Delegate everything to Services.
2. **Fat Services, Skinny Controllers**:
   - Services contain pure business logic and coordinate repositories.
   - If a service exceeds 200 lines, break it into smaller domain services or command handlers.
3. **DTOs & Strict Validation**:
   - Every input payload MUST have a DTO class decorated with `class-validator` (`@IsString()`, `@IsNotEmpty()`, etc.).
   - Enforce `ValidationPipe` globally in `main.ts` with `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`.
4. **Error Handling**:
   - Throw standard NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, `ConflictException`).
   - Use a global `HttpExceptionFilter` to format errors consistently for the frontend.

---

## 3. Anti-Spaghetti Checklist for NestJS

- [ ] **No Circular Dependencies**: Use `forwardRef()` only as an absolute last resort; redesign module boundaries first.
- [ ] **Dependency Injection**: Always inject services and repositories via constructor; never instantiate services with `new Service()`.
- [ ] **Environment Security**: Use `@nestjs/config` with Joi or Zod validation to ensure missing env variables fail at boot time.
- [ ] **Verification**: Run `npm run lint` and `npm run test` / `npm run build` before completing backend tasks.
