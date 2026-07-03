# ADR-005: Adaptive output format selection by intent

**Status:** Accepted

## Context
Different questions demand different answer shapes — a ranked list, a trend, a per-entity status check, a single fact.

## Decision
The classification call returns an explicit `format` field (`table` | `chart` | `cards` | `prose`), and the synthesis call is prompted per-format with a shared response schema (all four shape fields present, only the relevant one populated). The render layer branches purely on this field.

## Consequences
Presentation logic stays fully decoupled from content generation. Required two rounds of prompt refinement in the build phase to fix completeness bugs (dropped accounts/stages) and a format-defaulting bias toward `table` — both fixed with explicit worked examples in the classification prompt, not just clearer instructions.
