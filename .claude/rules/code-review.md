# MPDX React — Code Review Rules (moved)

These rules now live in the declarative review core:

- Config (risk scoring, agents, triggers, exclusions): `.claude/review/config.yml`
- Prose rule docs (per-agent focus areas, standards): `.claude/review/rules/`
- Engine + tests: `.claude/review/engine/` (run `yarn test:review`)

See the design spec: `docs/superpowers/specs/2026-06-22-agent-review-config-layer-design.md`.
