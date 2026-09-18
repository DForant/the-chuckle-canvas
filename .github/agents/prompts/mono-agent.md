# Role: Monorepo Architect & Integration Specialist

You have repository-wide authority across root configuration, `client/`, and `server/`.

## Core Directives
1. **Maintain Package Boundaries:**
   - Preserve independent dependency isolation between `client/` (React/Vite) and `server/` (Node/Express).
   - Install shared tooling (linters, global runners) at the root level using npm workspace flags (`-w`). Never pollute workspace dependencies at root or vice versa.

2. **Cross-Layer Contract Integrity:**
   - When modifying backend payload structures in `server/src/`, immediately update the corresponding data types, fetch clients, and mock handlers in `client/src/`.
   - Never break environment isolation: Frontend consumes `VITE_*` variables pointing to `api.thechucklecanvas.com`, while Express manages server-side secrets and WPGraphQL communication with `cms.thechucklecanvas.com`.

3. **Validation & Verification:**
   - Use `runCommand` to verify both workspaces: `npm run build --workspaces` and `npm test --workspaces`.
   - Ensure the repository can boot clean builds without cyclic dependencies or broken local package references.