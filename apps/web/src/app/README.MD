# The Chuckle Canvas — Decoupled Headless E-Commerce Platform

A production-grade, three-tier headless e-commerce application powering **The Chuckle Canvas** apparel and merchandise operations. Built with a decoupled React/Next.js frontend, an Express/Node.js API gateway proxy, and a hardened headless WordPress/WooCommerce backend data layer.

---

## 1. Architectural Topology

The system is decoupled into three isolated layers to ensure low frontend latency, strict backend attack surface reduction, and centralized session orchestration:

```
text
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  • React / Next.js Storefront                           │
│  • Responsive UI / Tailwind CSS Tokens                  │
│  • Client-Side Cart State & Routing                     │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / JSON
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 API GATEWAY & PROXY                     │
│  • Node.js / Express Middleware                         │
│  • Session & Guest Token Management                     │
│  • WPGraphQL / WooGraphQL Query Proxy                   │
│  • CORS & Environment Boundary Enforcement              │
└──────────────────────────┬──────────────────────────────┘
                           │ GraphQL / HTTPS
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND DATA LAYER                      │
│  • Headless WordPress / WooCommerce                     │
│  • Custom 3-File Blank Theme (style, functions, index)  │
│  • WPGraphQL + WooGraphQL Endpoints                     │
│  • Isolated MySQL 8.4 Database                          │
└─────────────────────────────────────────────────────────┘
```

## 2. Core Technical Components
Frontend (React / Next.js)
Storefront Interface: Catalog grids, responsive product detail pages, and interactive cart drawers.   
Gemini Session Log

Design Token Contracts: Synchronized Tailwind CSS configuration mapping typography, container breakpoints, and color contrast tokens.   
Gemini Session Log

Cart Interactions: Consumes standardized GraphQL mutations proxied through the Node.js API layer.   
Gemini Session Log

API Gateway (Express / Node.js)
Cart Session Persistence: Manages guest session tokens (woocommerce-session) across cross-origin boundaries.   
Gemini Session Log

Proxy Routing: Isolates backend WordPress URLs from public clients, mitigating direct scraping and query exposure.   
Gemini Session Log

Order Webhook Intake: Intercepts e-commerce order payloads and event listeners for downstream automated routing.   
Gemini Session Log

Backend & CMS (WordPress / WooCommerce)
Hardened Blank Theme: Stripped of all default themes; runs an isolated 3-file minimal theme (style.css, functions.php, index.php) that programmatically disables front-end template rendering, XML-RPC, and legacy REST endpoints.   
Gemini Session Log

API Endpoints: Powered by WPGraphQL, WooGraphQL, and WPGraphQL CORS.   
Gemini Session Log

Local Sandbox Stack: Local WP (WP-Local) running PHP 8.2.x, Nginx reverse proxy, MySQL 8.4.0, and Mailpit SMTP trapping.   
Gemini Session Log

## 3. Repository Structure

```
Plaintext
the-chuckle-canvas/
├── .github/
│   └── workflows/
│       └── ai-agent.yml          # AI Studio Agent Developer CI/CD workflow
├── client/                       # React / Next.js frontend UI application
│   ├── components/               # Product cards, cart drawer, layout primitives
│   ├── styles/                   # Design token definitions and Tailwind setup
│   └── package.json
├── server/                       # Node.js / Express API gateway proxy
│   ├── routes/                   # Proxy endpoints for GraphQL, cart, and webhooks
│   ├── middleware/               # Token interceptors, CORS, error boundaries
│   └── index.js
├── backend/                      # WordPress configuration and custom theme artifacts
│   └── wp-content/themes/blank/  # Minimal 3-file security theme[cite: 1]
│       ├── style.css
│       ├── functions.php
│       └── index.php
├── scripts/                      # Autonomous listing, ingestion & triage scripts[cite: 1]
├── package.json
└── README.md
```

## 4. Local Development Setup
Prerequisites
- Node.js: >= 20.x LTS
- Local WP: Configured with PHP 8.2.x, Nginx, and MySQL 8.4
- Git: Configured with SSH/HTTPS credentials

### 1. WordPress Backend Configuration
1. Open Local WP and start the local Chuckle Canvas environment[cite: 1].

2. Confirm the active theme is set to the minimal 3-file blank theme[cite: 1].

3. Ensure required plugins are active:
- WooCommerce
- WPGraphQL
- WooGraphQL
- WPGraphQL CORS

4. Verify GraphQL IDE endpoint accessibility at http://<local-domain>/graphql.

### 2. Express API Gateway Proxy Setup
1. Navigate to the server directory:

```
Bash

cd server
npm install
```

2. Configure .env variables:

```
Code snippet

PORT=5000
WP_GRAPHQL_ENDPOINT=http://localhost:10005/graphql
FRONTEND_URL=http://localhost:3000
```

3. Start the gateway service:

```
Bash

npm run dev
```

### 3. Frontend Storefront Setup

1. Navigate to the client directory:

```
Bash

cd client
npm install
```

2. Configure .env.local:


```
Code snippet

NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:5000
```

3. Run the development server:

```
Bash

npm run dev
```

4. Access the storefront locally at http://localhost:3000.

## 5. CI/CD & Automation Pipelines

- Workflow: .github/workflows/ai-agent.yml (AI Studio Agent Developer)[cite: 1].
- Execution Scope: Autonomous issue resolution, graphic variant ingestion, and listing generation[cite: 1].
- Maintenance & Triage: CI execution requires verified environment secrets (e.g., API keys, deployment tokens) and system dependency checks inside the run-agent step before pushing master branch commits[cite: 1].

## 6. License & Distribution
Internal proprietary codebase for The Chuckle Canvas and Dean Forant Designs. All rights reserved.