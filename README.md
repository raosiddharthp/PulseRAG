# PulseRAG

> **Grounding LLM responses in live enterprise data — not indexed documents.**

Traditional RAG retrieves from vector stores. PulseRAG queries the operational nervous system of an enterprise — CRM pipelines, ERP records, IT ticketing queues — at the moment a question is asked, then synthesises the answer across systems that were never designed to talk to each other.

---

## The Problem

Enterprise teams ask questions that no single system of record can answer.

> *"Which of our at-risk deals this quarter have fulfilment issues that could affect close?"*

A document RAG system returns a sales playbook. A base LLM hallucinates. A human spends 30–45 minutes switching between Salesforce, SAP, and Jira to assemble the answer manually.

The answer exists. It's distributed across three systems with no shared terminology, no common schema, and no built-in join. PulseRAG closes that gap.

---

## What PulseRAG Does

- **Classifies natural language intent** — determines which systems are needed, what output format the answer demands, and how sensitive the data is
- **Federates across heterogeneous connectors** — CRM, ERP, and Ticketing queried in parallel via a standard interface
- **Synthesises cross-system results** — merges connector responses into a single grounded answer with source attribution
- **Renders adaptively** — the output is a table, chart, card, or prose depending on what the question actually requires
- **Enforces freshness policy** — routes high-sensitivity queries to live sources; low-sensitivity queries serve from TTL cache

---

## Live Demo

**[→ View the architecture and live simulator](https://raosiddharthp.github.io/PulseRAG/)**

The simulator demonstrates four enterprise query scenarios end-to-end — pipeline stages animate in real time, connectors light up as they're queried, and the output renders in the appropriate format for each query type.

---

## Architecture

```
Natural Language Query
        │
        ▼
┌─────────────────────┐
│   Intent Classifier  │  ← Groq · Llama 3.1 8B
│   Query Planner      │    determines connectors,
│                      │    format, sensitivity
└──────────┬──────────┘
           │  sub-queries per system
    ┌──────┼──────┐
    ▼      ▼      ▼
  CRM    ERP   Ticketing     ← parallel · async
    └──────┬──────┘
           │  raw results + metadata
           ▼
┌─────────────────────┐
│  Freshness Policy    │  ← TTL routing per query type
│  Cache Layer         │    high-sensitivity: bypass
└──────────┬──────────┘    low-sensitivity: TTL
           │
           ▼
┌─────────────────────┐
│  Response Synthesiser│  ← Groq · Llama 3.1 8B
│  Adaptive Renderer   │    table · chart · card · prose
└─────────────────────┘
```

### Five Layers

| Layer | Responsibility | Implementation |
|---|---|---|
| **Application** | NL query input, adaptive output render, source attribution | Static HTML + vanilla JS |
| **Query Intelligence** | Intent classification, query planning, sub-query generation | Groq · Llama 3.1 8B |
| **Connector Federation** | Parallel fetch across CRM, ERP, Ticketing via standard interface | async / Promise.all() |
| **Freshness & Cache** | TTL policy per query type, cache bypass for high-sensitivity | In-memory Map + TTL |
| **Synthesis & Render** | Cross-system result merge, grounded response, format selection | Groq · Llama 3.1 8B |

---

## Query Types

| Query | Systems | Output Format | Freshness |
|---|---|---|---|
| At-risk deals with fulfilment issues | CRM + ERP + Ticketing | Ranked risk table | High — live |
| SKUs below reorder threshold | ERP | Flagged inventory table | High — live |
| Q2 pipeline health by stage | CRM | Bar chart | Medium — 5min TTL |
| Open P1 tickets at SLA breach risk | Ticketing | Breach-flagged cards | High — live |
| Single account status | CRM + Ticketing | Summary card | Medium — TTL |

---

## Stack

| Component | Choice | Reason |
|---|---|---|
| LLM inference | Groq · Llama 3.1 8B | Free tier, near-zero latency, no credit card |
| Intent classification | Structured Groq prompt | No labelled dataset; fast iteration |
| Connector data | Seeded JSON (Salesforce / SAP / Jira schema) | No enterprise credentials required |
| Cache | In-memory Map + TTL | Zero infrastructure |
| Frontend | Static HTML · vanilla JS | Zero build step; GitHub Pages compatible |
| Hosting | GitHub Pages | Free, zero config, no cold starts |

---

## Documented Tradeoffs

This is a portfolio-grade MVP. The architectural tradeoffs are documented openly — this is a deliberate engineering decision, not a limitation to hide.

**LLM inference — Groq free tier**
Groq (Llama 3.1 8B) is used in place of Claude or GPT-4o. In production, this would be replaced with a dedicated API integration with stronger instruction-following, higher rate limits, and SLA guarantees.

**Mock connectors**
No live Salesforce, SAP, or Jira credentials are required. Connectors return seeded JSON with realistic schemas — same field names, same data relationships, same response structure as real APIs. The connector interface is designed to be real-API-swappable without touching the intelligence or synthesis layers.

**Browser-side API calls**
Groq is called directly from the browser. This exposes the API key in client code — acceptable for a portfolio demo, not acceptable in production. A backend proxy (FastAPI on Railway, for example) would be the correct pattern.

**Design vs. Build phases**
The portfolio page (design phase) uses pre-scripted scenario responses and no external API calls. The build phase wires Groq for real intent classification and arbitrary query handling. Both are in this repository.

---

## Architecture Decision Records

All significant architectural choices are formally documented as ADRs following TOGAF principles — design precedes build, decisions are traceable.

| ADR | Decision | Status |
|---|---|---|
| [ADR-001](docs/adr/001.md) | Groq (Llama 3.1 8B) as LLM inference layer | Accepted |
| [ADR-002](docs/adr/002.md) | Browser-side API calls vs. backend proxy | Accepted |
| [ADR-003](docs/adr/003.md) | Mock connectors over real enterprise integrations | Accepted |
| [ADR-004](docs/adr/004.md) | Scenario-scoped query matching for design phase | Accepted · Design phase only |
| [ADR-005](docs/adr/005.md) | Adaptive output format selection by intent | Accepted |
| [ADR-006](docs/adr/006.md) | In-memory TTL cache over Redis | Accepted · Demo scope |
| [ADR-007](docs/adr/007.md) | Static single-file HTML delivery | Accepted |
| [ADR-008](docs/adr/008.md) | Freshness policy as a query-type routing layer | Accepted |

Full ADR content is embedded in the architecture portfolio page.

---

## Repository Structure

```
pulserag/
├── index.html          # Architecture portfolio · simulator · ADRs · diagrams
├── README.md           # This file
├── build/
│   ├── index.html      # Build-phase implementation · Groq wired
│   └── connectors/
│       ├── crm.js      # CRM connector · Salesforce-schema mock
│       ├── erp.js      # ERP connector · SAP-schema mock
│       └── ticketing.js# Ticketing connector · Jira-schema mock
└── docs/
    └── adr/            # Architecture Decision Records (8)
```

---

## Running Locally

The design page is fully static — open `index.html` directly in any browser. No server, no dependencies, no build step.

```bash
git clone https://github.com/raosiddharthp/PulseRAG
cd PulseRAG
open index.html
```

For the build phase (Groq wired):

```bash
# Add your Groq API key to build/index.html
# GROQ_API_KEY is the only dependency
open build/index.html
```

Get a free Groq API key at [console.groq.com](https://console.groq.com) — no credit card required.

---

## What This Demonstrates

PulseRAG is an architecture portfolio piece designed to show capability with LLMs, enterprise systems thinking, and production-grade design discipline.

Specifically it demonstrates:

- **LLM orchestration** — intent classification, query planning, and response synthesis as distinct prompt-engineered stages
- **Connector federation** — a standard interface pattern enabling heterogeneous system integration without coupling the intelligence layer to any specific API
- **Adaptive output** — the LLM response includes a format signal that drives the render layer, separating content generation from presentation
- **Freshness reasoning** — TTL policy as a first-class architectural concern, not an afterthought
- **TOGAF ADM discipline** — eight formal ADRs documenting every significant decision with context, rationale, consequences, and alternatives considered
- **Honest tradeoff documentation** — every limitation is surfaced, not hidden, with a clear statement of what production would require

---

## Production Path

The gap between this MVP and a production deployment is well-defined and documented:

| MVP | Production |
|---|---|
| Groq free tier | Dedicated Claude / GPT-4o API with SLA |
| Mock JSON connectors | Live Salesforce, SAP, Jira via OAuth |
| Browser-side API calls | FastAPI backend proxy |
| In-memory TTL cache | Redis with distributed invalidation |
| Static HTML | React application with proper component separation |
| Single-user demo | Multi-tenant with auth, audit logging, access control |

---

## Author

**Siddharth Rao** · Enterprise Architect · TOGAF Certified  
Architecture Portfolio · 2026

→ [QueryForge](https://raosiddharthp.github.io/QueryForge/) · Automated multi-query optimisation for enterprise RAG  
→ [The Autonomous HR](https://raosiddharthp.github.io/The-Autonomous-HR/) · WhatsApp-native HR automation for deskless workers
