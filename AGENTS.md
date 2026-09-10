# AGENT HARNESS CONSTITUTION & CODING STANDARDS

## 1. Operating Rules (Strict Guardrails)
- **Phase 1 is Read-Only**: Never edit files during analysis. Inspect codebase, map dependencies, and produce an implementation plan first.
- **Wait for Human Approval**: For tasks modifying >2 files, altering architectural boundaries, or introducing new patterns, explicitly stop and wait for user confirmation before writing code.
- **Minimal Atomic Diff**: Touch ONLY lines necessary for the assigned task. Never rewrite entire files, reformat unchanged code, or strip existing comments/docstrings.
- **No Monkey-Patching / Lazy Patching**: Never fix bugs by wrapping code in hacky try-catches, swallowing errors silently, or adding bypass flags. Identify and fix the root cause.
- **Step-by-step Execution**: Break complex tasks into small, verifiable chunks. Never attempt multi-feature overhauls in a single shot.

## 2. Architecture & Anti-Spaghetti Constraints
- **Strict File Length Ceiling (Anti-Monolith)**: NEVER create or grow any file to 500–1000 lines. The target limit is **under 150–200 lines per file**. If a file grows beyond this, you MUST break it down: extract sub-components into dedicated files, move logic to custom hooks, and split pure functions into helper utilities.
- **Reuse-First Mandate (No Duplicate Reinvention)**: Before writing ANY new component, helper function, hook, or API method, you MUST search (`grep_search` / `list_dir`) the existing codebase first. Always reuse existing utilities (`formatCurrency`, `cn`, `Button`, `Modal`, etc.). If an existing utility needs extra capability, extend it cleanly with optional parameters instead of creating a duplicate version.
- **Separation of Concerns**: UI components MUST NOT contain raw database queries, direct API fetching scripts, or heavy business logic. Delegate cleanly to `/services`, `/hooks`, or `/actions`.
- **Max Nesting Depth = 2**: Avoid deeply nested `if/else` ladders. Use Early Returns and Guard Clauses.
- **Single Responsibility (SRP)**: Keep functions focused on doing one thing well. Functions exceeding 30–35 lines MUST be extracted into modular, testable pure helper functions.
- **Single Source of Truth**: Never duplicate state or introduce arbitrary global variables/caches. Keep state as local as possible.
- **Type Safety & Strict Validation**: All data crossing boundaries (API requests, responses, database schemas) must be explicitly typed and validated.

## 3. Verification Gate (Mandatory)
- Before declaring any task complete, verify code syntax, run linter (`npm run lint`), type-checker (`tsc` / `npm run check`), or relevant tests.
- Code that causes compilation errors or breaks existing tests is strictly considered INCOMPLETE.

## 4. Specialized Skills (On-Demand)
- **Next.js Frontend**: Consult [.agents/skills/nextjs-frontend/SKILL.md](file:///Users/mathi/whey4you-ver2/.agents/skills/nextjs-frontend/SKILL.md) for App Router, RSC boundaries, Server Actions, and Next.js performance standards.
- **UI/UX Design**: Consult [.agents/skills/ui-ux-design/SKILL.md](file:///Users/mathi/whey4you-ver2/.agents/skills/ui-ux-design/SKILL.md) for design tokens, typography, glassmorphism, micro-animations, and responsive layouts.
- **Responsive & Adaptive Scaling**: Consult [.agents/skills/responsive-design/SKILL.md](file:///Users/mathi/whey4you-ver2/.agents/skills/responsive-design/SKILL.md) for fluid scaling, multi-device breakpoints (320px to 4K), container queries, and zoom resilience.
- **NestJS Backend**: Consult [.agents/skills/nestjs-backend/SKILL.md](file:///Users/mathi/whey4you-ver2/.agents/skills/nestjs-backend/SKILL.md) for Clean Architecture, Controller/Service separation, DTO validation, and module boundaries.
