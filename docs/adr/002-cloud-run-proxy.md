# ADR-002: Cloud Run backend proxy, fronted by API Gateway with Firebase Auth

**Status:** Accepted

## Context
A zero-infrastructure design-phase build calls Gemini directly from the browser, exposing the API key client-side — acceptable for a static demo, not for a real service holding connector credentials.

## Decision
The build phase runs Gemini calls inside a Cloud Run service (`europe-west2`), holding the Gemini key in Secret Manager rather than client code. Public access is fronted by Google API Gateway, which validates Firebase-issued Google Sign-In JWTs before forwarding to Cloud Run — Cloud Run itself stays authenticated-only (`run.invoker` scoped to specific service accounts, never `allUsers`), consistent with this project's domain-restricted-sharing org policy.

## Consequences
More moving infrastructure than a single Cloud Run service — API Gateway, an OpenAPI spec, Firebase Auth — but it is the correct, least-privilege pattern for exposing an authenticated API to a public frontend without weakening the org's security posture.
