# ADR-008: Freshness policy as a query-type routing layer

**Status:** Accepted

## Context
Not every query needs a live round-trip to a connector; some can tolerate a short-lived cache, while others (named-account, time-critical decisions) must never serve stale data.

## Decision
Classification returns a `sensitivity` field (`high` | `medium` | `low`). High-sensitivity queries always bypass the Firestore cache; medium/low-sensitivity queries check cache first and write through on a miss. This required a determinism fix in the build phase — the classification prompt initially returned different sensitivity values for identical repeated queries, traced to non-zero model temperature, fixed by setting `temperature: 0` for the classification call specifically, since routing decisions must be deterministic even though synthesis benefits from some variability.

## Consequences
Reduces redundant connector/Gemini load on aggregate queries while keeping high-stakes answers always current. Required verifying cache correctness with an isolated round-trip test before trusting it inside the full pipeline, since a stale-process/stale-cache confusion during testing cost real debugging time.
