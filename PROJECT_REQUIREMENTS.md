# The Chuckle Canvas — Project Architecture & Environment Specification

## 1. System Architecture & Workspaces
- **Repository Architecture:** Monorepo using `npm workspaces`.
- **Client Workspace (`/client`):**
  - **Framework:** Vite + React.
  - **Local Port:** `http://localhost:3000`.
  - **Proxy Routing:** All client requests beginning with `/api/*` MUST dynamically proxy to the local backend port (`http://localhost:4000`) via Vite's `server.proxy`.
- **Server Workspace (`/server`):**
  - **Framework:** Node.js + Express.
  - **Local Port:** `http://localhost:4000`.
  - **Role:** Headless API gateway, response normalizer, and error classifier for upstream WooCommerce / WPGraphQL data.

---

## 2. Environment Matrix & URLs

| Environment | Client URL | Server / Gateway URL | Headless CMS (WPGraphQL) | Status / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Local (Default)** | `http://localhost:3000` | `http://localhost:4000` | `https://cms.thechucklecanvas.com/graphql` | Primary dev target; `/api` proxies to port 4000 |
| **Staging** | *https://stg.thechucklecanvas.com* | *https://stg-api.thechucklecanvas.com* | `https://cms.thechucklecanvas.com/graphql` | **DO NOT TARGET** in local source or configs |
| **Production** | `https://thechucklecanvas.com` | `https://api.thechucklecanvas.com` | `https://cms.thechucklecanvas.com/graphql` | Target production domain |

> **CRITICAL AGENT DIRECTIVE:** Never hardcode remote staging URLs (e.g., `https://stg.api.thechucklecanvas.com`) or assume staging endpoints exist. The local client must always default to `http://localhost:4000` for backend communication unless explicitly overridden by `process.env.API_TARGET`.

---

## 3. Environment Variable Contracts

### Server Workspace (`server/.env`)
- `PORT`: `4000` (default)
- `GRAPHQL_ENDPOINT`: `https://cms.thechucklecanvas.com/graphql`

### Client Workspace (`client/.env`)
- `API_TARGET`: Optional override for the Vite development proxy. Defaults to `http://localhost:4000`.
- All client variables exposed to the browser MUST use the `VITE_` prefix.

---

## 4. Upstream CMS Contracts (WPGraphQL / WooCommerce)

### Field Nomenclature
- Query `name` for product names/titles. The WooCommerce product schema does **not** expose `title`.

### Pricing Fragments
- The base `Product` interface in WooGraphQL does not contain pricing fields. All queries requesting prices must use explicit inline fragments:
  ```graphql
  ... on SimpleProduct {
    price
    regularPrice
    salePrice
  }
  ... on VariableProduct {
    price
    regularPrice
  }
### Entity Missing & Status Code Normalization
When a product is not found by slug, WPGraphQL returns an error containing: "No product ID was found corresponding to the slug..." or an empty payload { data: { product: null } }.

These conditions MUST be normalized to an HTTP 404 Not Found response.

Only malformed GraphQL syntax or schema validation errors may return an HTTP 400 Bad Request.

## 5. Express API Contracts
- GET /health
   -Response 200 OK:


JSON
```
{
  "status": "ok",
  "timestamp": "ISO-8601 string"
}
```

- GET /api/products
   - Response 200 OK:

JSON
```
{
  "products": [
    {
      "id": "string",
      "title": "string",
      "slug": "string",
      "price": "string",
      "imageUrl": "string",
      "description": "string"
    }
  ],
  "pageInfo": {
    "hasNextPage": false,
    "endCursor": "string | null"
  }
}
```

- GET /api/products/:slug
   - Response 200 OK: Single normalized product detail object (including gallery, variants, and categories).

   - Response 404 Not Found:

JSON

```{
  "error": {
    "message": "Product not found",
    "status": 404
  }
}
```

## 6. Testing & Quality Gate (Definition of Done)
Any pull request, automated agent contribution, or manual refactor must satisfy these conditions:

1. No Rogue Imports: Never import from node:test in application or test code. Use Jest globals (describe, it, expect, jest) on the server and Vitest globals on the client.

2. Zero Mock Drift: If a service schema, route payload, or normalization function is updated, the corresponding unit test mocks in server/test/ or client/src/__tests__/ must be updated simultaneously.

3. Automated Verification:

- npm test --workspace=server passes with 0 failures, 0 errors, and no open handles.

- npm test --workspace=client passes with 0 failures.

- npm run build --workspaces exits with code 0.