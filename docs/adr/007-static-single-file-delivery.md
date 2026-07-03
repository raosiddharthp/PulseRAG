# ADR-007: Static single-file HTML delivery

**Status:** Accepted

## Context
A portfolio artifact needs to be trivially cloned, opened, and reviewed with zero setup; the build-phase frontend needs to be simple enough to reason about while debugging a new auth integration.

## Decision
Both the design-phase portfolio page and the build-phase query console are self-contained static HTML files — no bundler, no framework, no build step. The build-phase frontend adds only the Firebase Auth SDK, loaded via CDN as native ES modules.

## Consequences
No component reuse across pages, and some duplicated CSS between the two HTML files — an explicit tradeoff for reviewer friction and debugging simplicity over engineering purity at this scope. Angular is the documented production path once the frontend needs real component structure.
