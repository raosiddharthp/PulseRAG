# ADR-003: Mock connectors over real enterprise integrations

**Status:** Accepted

## Context
Real Salesforce/SAP/Jira credentials aren't available for a public demo.

## Decision
Connectors return seeded JSON with realistic, real-API-matching schemas — same field names, same relationships, same response shape as the real systems they stand in for.

## Consequences
No live data, but the connector interface is designed to be swapped for real APIs — fronted by Apigee and Application Integration in production — without touching the intelligence or synthesis layers.
