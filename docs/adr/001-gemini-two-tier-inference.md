# ADR-001: Gemini 3 Flash + Flash-Lite as a two-tier inference layer

**Status:** Accepted

## Context
Intent classification and response synthesis have very different cost/quality requirements — classification runs on every query and needs to stay cheap; synthesis is where reasoning quality is actually visible to the user.

## Decision
Route classification to `gemini-3.1-flash-lite` and synthesis to `gemini-3.5-flash` (upgraded from the design-phase's `gemini-3-flash` to the GA model once verified — preview models are not a defensible production dependency), both via the Gemini API. EEA/Switzerland/UK developers are required onto the paid Gemini API tier rather than the free AI Studio tier available elsewhere — this build runs on paid, pay-as-you-go Gemini at demo-scale cost (well under $1 for the full simulator's worth of calls).

## Consequences
Two model calls to reason about instead of one, but each stage runs the right-sized model for its job. Production would move both calls behind Vertex AI for SLA guarantees, quota management, and regional data residency controls.
