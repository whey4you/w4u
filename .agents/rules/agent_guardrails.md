# AI Agent Execution Guardrails

## Core Working Directives
1. **Plan First**: Always formulate a step-by-step plan before making edits. Do not rush into code modifications without understanding full impact.
2. **Atomic Steps**: Break down tasks into small, verifiable actions. One step at a time is safer and higher quality than batching too many changes.
3. **Preserve Integrity**: Do not delete existing comments, refactor unrelated sections, or introduce breaking changes without explicit permission.
4. **Anti-Spaghetti & Anti-Monolith Discipline**:
   - **Strict File Limit**: Never create files approaching 500–1000 lines. Keep files modular and focused (ideally under 150–200 lines). Break components and services into sub-modules.
   - **Reuse Before Writing**: Always search existing code (`components/`, `hooks/`, `lib/`, `services/`) before creating new helpers or UI. Reusing shared components ensures project-wide consistency when changes are made.
   - Enforce early returns (max nesting depth: 2).
   - Functions longer than 30–35 lines must be separated into helper functions or hooks.
   - Strictly separate UI layer from data fetching/business logic layer.
   - Address root causes of bugs, never apply band-aids or monkey-patching.
5. **Mandatory Verification**: Always verify syntax, linting, and compilation before concluding any task.
