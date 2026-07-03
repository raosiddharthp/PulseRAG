# ADR-004: Scenario-scoped query matching for design phase

**Status:** Accepted — design phase only

## Context
The design-phase simulator must run without live Gemini API calls, demonstrating the full pipeline visually at zero cost and zero latency variance.

## Decision
Pre-script four scenario responses with keyword-triggered routing in the design-phase `index.html`.

## Consequences
Design simulator does not handle arbitrary queries. Fully superseded by live Gemini 3.1 Flash-Lite / 3.5 Flash calls in the build phase, which handles arbitrary natural-language queries.
