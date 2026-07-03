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

The simulator runs four enterprise query scenarios end-to-end. Each run steps through all seven pipeline stages — receive, classify, plan, fetch connectors, freshness check, synthesise, render — with a live progress bar and timing per stage, streams a run log to an inline console, and renders the final answer in its adaptive format (table, chart, or cards) in a dedicated output panel below the console.

---

## Architecture

```
Natural Language Query
        │
        ▼
┌─────────────────────┐
│   Intent Classifier  │  ← Gemini 3.1 Flash-Lite
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
│  Response Synthesiser│  ← Gemini 3 Flash
│  Adaptive Renderer   │    table · chart · card · prose
└─────────────────────┘
```

### Five Layers

| Layer | Responsibility | Implementation |
|---|---|---|
| **Application** | NL query input, adaptive output render, source attribution | Static HTML + vanilla JS |
| **Query Intelligence** | Intent classification, query planning, sub-query generation | Gemini 3.1 Flash-Lite |
| **Connector Federation** | Parallel fetch across CRM, ERP, Ticketing via standard interface | async / Promise.all() |
| **Freshness & Cache** | TTL policy per query type, cache bypass for high-sensitivity | In-memory Map + TTL |
| **Synthesis & Render** | Cross-system result merge, grounded response, format selection | Gemini 3 Flash |

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
| Intent classification | Gemini 3.1 Flash-Lite | Cheap, fast, high-volume — the right-sized model for a per-query routing decision |
| Response synthesis | Gemini 3 Flash | Stronger reasoning where quality is user-visible — the cross-system merge |
| Connector data | Seeded JSON (Salesforce / SAP / Jira schema) | No enterprise credentials required for the demo |
| Cache | In-memory Map + TTL | Zero infrastructure for the demo; Memorystore is the documented production path |
| Frontend | Static HTML · vanilla JS | Zero build step |
| Hosting | Firebase Hosting | Free Spark tier, zero config, global CDN |

---

## Documented Tradeoffs

This is a portfolio-grade MVP. The architectural tradeoffs are documented openly — this is a deliberate engineering decision, not a limitation to hide.

**LLM inference — Gemini, paid tier by necessity**
Gemini 3.1 Flash-Lite handles classification, Gemini 3 Flash handles synthesis. Google's API terms require EEA/Switzerland/UK developers onto the paid Gemini API tier rather than the free AI Studio tier available elsewhere — this build runs on paid, pay-as-you-go Gemini at negligible demo-scale cost, stated plainly rather than glossed over. Production would move both calls behind Vertex AI for SLA guarantees, quota management, and regional data residency controls.

**Mock connectors**
No live Salesforce, SAP, or Jira credentials are required. Connectors return seeded JSON with realistic schemas — same field names, same data relationships, same response structure as real APIs. The connector interface is designed to be swappable for an Apigee-fronted live connection without touching the intelligence or synthesis layers.

**Browser-side API calls**
Gemini is called directly from the browser. This exposes the API key in client code — acceptable for a portfolio demo, not acceptable in production. A Cloud Run service in front of Vertex AI is the correct pattern: it holds credentials, enforces per-user quota, and scales to zero between requests.

**Design vs. Build phases**
The portfolio page (design phase) uses pre-scripted scenario responses and no external API calls. The build phase wires Gemini for real intent classification and arbitrary query handling. Both are in this repository.

---

## Architecture Decision Records

All significant architectural choices are formally documented as ADRs following TOGAF principles — design precedes build, decisions are traceable.

| ADR | Decision | Status |
|---|---|---|
| [ADR-001](docs/adr/001.md) | Gemini 3 Flash + Flash-Lite as a two-tier inference layer | Accepted |
| [ADR-002](docs/adr/002.md) | Browser-side API calls vs. Cloud Run backend proxy | Accepted |
| [ADR-003](docs/adr/003.md) | Mock connectors over real enterprise integrations | Accepted |
| [ADR-004](docs/adr/004.md) | Scenario-scoped query matching for design phase | Accepted · Design phase only |
| [ADR-005](docs/adr/005.md) | Adaptive output format selection by intent | Accepted |
| [ADR-006](docs/adr/006.md) | In-memory TTL cache over Memorystore | Accepted · Demo scope |
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
│   ├── index.html      # Build-phase implementation · Gemini wired
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

For the build phase (Gemini wired):

```bash
# Add your Gemini API key to build/index.html
# GEMINI_API_KEY is the only dependency
open build/index.html
```

Get a Gemini API key at [aistudio.google.com](https://aistudio.google.com). **Note for UK/EEA/Switzerland-based developers:** Google's API terms require a paid billing account for this region rather than the free AI Studio tier available elsewhere — cost at demo scale is a fraction of a dollar.

---

## What This Demonstrates

PulseRAG is an architecture portfolio piece designed to show capability with LLMs, enterprise systems thinking, and production-grade design discipline.

Specifically it demonstrates:

- **LLM orchestration** — intent classification and response synthesis as distinct prompt-engineered stages, deliberately routed to different Gemini model tiers by cost and quality requirements
- **Connector federation** — a standard interface pattern enabling heterogeneous system integration without coupling the intelligence layer to any specific API
- **Adaptive output** — the LLM response includes a format signal that drives the render layer, separating content generation from presentation
- **Freshness reasoning** — TTL policy as a first-class architectural concern, not an afterthought
- **TOGAF ADM discipline** — eight formal ADRs documenting every significant decision with context, rationale, consequences, and alternatives considered
- **Honest tradeoff documentation** — every limitation is surfaced, not hidden, including region-specific constraints like the UK/EEA paid-tier requirement, with a clear statement of what production would require

---

## Production Path

The gap between this MVP and a production deployment is well-defined and documented:

| MVP | Production |
|---|---|
| Gemini API · direct, paid tier | Vertex AI Gemini with SLA, quota management, VPC-SC |
| Mock JSON connectors | Live Salesforce, SAP, Jira via Apigee + Application Integration |
| Browser-side API calls | Cloud Run backend proxy |
| In-memory TTL cache | Memorystore with distributed invalidation |
| Static HTML | Angular application with component separation, deployed on Firebase Hosting |
| Single-user demo | Multi-tenant with Identity Platform auth, Cloud Audit Logs, IAM access control |

---

## Author

**Siddharth Rao** · Enterprise Architect · TOGAF Certified
Architecture Portfolio · 2026

→ [QueryForge](https://raosiddharthp.github.io/QueryForge/) · Automated multi-query optimisation for enterprise RAG
→ [The Autonomous HR](https://raosiddharthp.github.io/The-Autonomous-HR/) · WhatsApp-native HR automation for deskless workers
