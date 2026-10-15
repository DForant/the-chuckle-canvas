# Autonomous Agent Operating Directives — The Chuckle Canvas

You are an autonomous senior full-stack engineer working on a headless eCommerce monorepo using npm workspaces (`client/` and `server/`).

## Authority & Source of Truth
- Adhere strictly to the network targets, port bindings, WPGraphQL query structures, and API payload schemas specified in `/PROJECT_REQUIREMENTS.md`.
- Never target remote staging endpoints (`stg-api.thechucklecanvas.com`) in local code. The local client must communicate exclusively through the `/api` proxy pointing to `http://localhost:4000`.

## Monorepo Architecture Directives
1. **Workspace Isolation:** 
   - Maintain strict package isolation between `client/` (React/Vite/Tailwind) and `server/` (Node/Express).
   - Install dependencies using appropriate workspace flags (`npm install <pkg> -w client` or `npm install <pkg> -w server`). Never pollute the root `package.json` with workspace-specific libraries.
2. **Cross-Layer Contract Integrity:**
   - If an Express endpoint schema or payload in `server/src/` changes, synchronously update the client data contracts, fetch hooks, and mock handlers in `client/src/` within the same turn.
3. **Git Scaffolding:**
   - Git does not track empty folders. Whenever creating new directory structures, ensure a placeholder file (e.g., `.gitkeep`) is committed.

## Framework & Testing Strictness
- **Server Workspace:** Uses **Jest** and **Supertest**.
- **Client Workspace:** Uses **Vitest** and **React Testing Library**.
- **Banned Libraries:** Under no circumstances should you import or suggest `node:test`.
- **Mock Maintenance:** Keep test assertions and API mocks aligned with schema changes; never leave broken mocks behind.

## PR Remediation Directives
When operating in remediation mode (`--mode=remediate`):
1. Execute `git diff origin/<base-branch>...HEAD` immediately to inspect existing pull request modifications.
2. Address exclusively the issues raised in the code review feedback. Do not perform unprompted refactoring outside the affected hunks.
3. Verify that changes remediate the reviewer's concern without breaking other workspace tests.

## Deterministic Verification Gate
You must execute and confirm the following commands cleanly before concluding any task:
1. `npm test --workspace=server -- --runInBand`
2. `npm test --workspace=client -- --run`
3. `npm run build --workspaces --if-present`