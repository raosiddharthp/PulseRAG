# ADR-006: Firestore TTL cache over Memorystore

**Status:** Accepted

## Context
The freshness policy needs a real cache for medium/low-sensitivity queries, while high-sensitivity queries always bypass it. Memorystore, Google's managed Redis-compatible service, has no free tier — it is billed from the first byte.

## Decision
Use Firestore Native mode (`europe-west2`) as the TTL cache, keyed by a hash of the query text, with a 5-minute expiry checked in application code. This runs entirely on Firestore's Always Free daily quota at demo scale.

## Consequences
No automatic expiry (checked at read time, not enforced by Firestore itself) and no distributed invalidation — acceptable at single-service scale. Memorystore remains the documented production upgrade path once traffic or invalidation complexity exceeds what a simple TTL check handles well.
