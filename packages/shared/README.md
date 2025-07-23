# shared

## Absolute Import Usage

- Use `@/...` for absolute imports within the `shared` package codebase itself (e.g. `import { User } from '@/schema/auth'`).
- Use `shared/...` for cross-package imports when importing from the shared package in other workspaces/apps (e.g. `import { User } from 'shared/schema/auth'`).

This is configured via `tsconfig.json` in each package.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.18. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
