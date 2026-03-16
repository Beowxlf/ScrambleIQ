# ScrambleIQ

ScrambleIQ is in scaffold and early phase-one development.

This repository now includes a minimal full-stack TypeScript scaffold aligned to the project tech stack:

- Frontend: React + TypeScript + Vite (`apps/web`)
- Backend: NestJS + Node.js + TypeScript (`apps/api`)
- Tooling: ESLint, Prettier, Vitest, Supertest

## Prerequisites

- Node.js 20+
- npm 10+

## Install

```bash
npm install
```

## Run locally

Frontend (Vite):

```bash
npm run dev:web
```

Backend (NestJS):

```bash
npm run dev:api
```

Default backend health endpoint:

- `GET http://localhost:3000/health`

## Validation commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Repository structure

```text
apps/
  api/   # NestJS backend scaffold
  web/   # React + Vite frontend scaffold
Guidelines/
  Tech-Stack.md
```
