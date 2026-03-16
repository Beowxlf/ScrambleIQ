# AGENTS.md

## Repository instructions

1. Treat `Guidelines/Tech-Stack.md` as the source of truth for architecture and technology choices.
2. Make small, reviewable changes.
3. Prefer simple, maintainable solutions.
4. Do not implement machine learning, automated event detection, or advanced analytics unless explicitly asked.
5. Update documentation when setup, structure, or behavior changes.
6. Run all relevant lint, typecheck, test, and build commands before considering work complete.
7. If a requirement is ambiguous, make the smallest reasonable assumption and document it.

## Project scope

ScrambleIQ is currently in scaffold and early phase-one development.
The current goal is to establish the project structure and manual-first product foundation.

## Important files

1. `Guidelines/Tech-Stack.md` for stack and architecture
2. `README.md` for setup and developer workflow
3. `Guidelines/` for project planning and product documents

## Monorepo conventions

- Use npm workspaces rooted at the repository `package.json`.
- Frontend code lives in `apps/web` (React + TypeScript + Vite).
- Backend code lives in `apps/api` (NestJS + TypeScript).
- Prefer root scripts (`npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`) for full-repo validation.
