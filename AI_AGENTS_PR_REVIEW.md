Dev experience level: senior | experienced

Before the review, print exactly: Operating in review-only mode (with .ai-review.json exception).

MODE

- REVIEW ONLY of the current PR diff; do NOT modify existing files or stage/commit.
- Single exception: you MAY create ONE untracked file at repo root: `.ai-review.json`. Do not modify other files; do not stage/commit.

=== Stage 0 — Setup knowledge ===
Known utilities/components (authoritative; adjust if paths differ)
Please review the AI_AGENTS_SHARED_RESOURCES.md file to understand the shared functions and components that could be used globally. There might be functions and components which could be used in the parent(s) files.

Repo heuristics to enforce:

- Currency/number formatting must use intlFormat helpers; avoid raw toLocaleString.
- Dates use Luxon DateTime; avoid new Date.
- React keys: avoid index as key.
- Theme: use theme tokens, not hardcoded hex.
- Prefer context over deep prop-drilling for cross-cutting state (e.g., MPGA context).
- Prefer shared Empty/Loading/Print styles/components over ad-hoc duplicates.
- Tests: prefer central mockData; test print paths; name/intent clear; verify formatting using prod helpers.
- File types: pure helpers should be .ts, not .tsx.

=== Stage 1 — File index (completeness gate) ===
List EVERY file changed in this PR (relative path). For each file, include:

- Kind: {component | hook | util | helper | styled | test | other}
- Risk: {low|med|high}
- Why (1 sentence)

Do not skip any file. If any file can’t be read, state it and continue.

=== Stage 2 — Deep review (file-by-file) ===
For EACH changed file from Stage 1, in order:

- Must-fix: file:line → issue → fix (unified diff if trivial)
  - Evidence (file:line-range quote)
  - Impact (correctness/perf/clarity)
- Nice-to-have (same format)
- Suggested tests (anchor to this file’s code)
- Inline mentoring notes (only for Dev experience level: experienced)
- Quick patches (tiny unified diffs only; do not apply)

RULE: If no issues found for a file, state: “No issues found after deep check” AND explain the checks you ran.

=== Stage 3 — Reuse Sweep (repo-wide) ===
Scan the /AI_AGENTS_SHARED_RESOURCES.md file for candidates to replace or centralize logic introduced/changed in this PR; include path#symbol and tiny patch to adopt:

For each reuse candidate:

- Evidence: short fragment in shared file + where it applies in PR (file:line)
- Impact: consistency/maintainability/perf
- Patch: minimal unified diff to adopt it

=== Stage 4 — Pattern Sweep (regex-guided) ===
Search the CHANGED FILES for these patterns; for each hit, either propose a fix or mark “N/A” with reason. Cite exact lines.

- /(toLocaleString\\(.\*currency)/ → replace with intlFormat helpers
- /new Date\\(/ → use Luxon DateTime
- /key=\\{index\\}/ → use stable keys
- /#[0-9a-fA-F]{3,6}\\b/ → use theme tokens
- /console\\.(log|warn|error)/ → remove before merge
- Duplicated helpers (e.g., monthCount/getFirstMonth) across MPGA files → centralize
- Pure helpers in .tsx → move to .ts
- Tests not using central mockData → switch to shared mocks
- Recharts mocks duplicated → move to shared test util

=== Human-readable review (print to chat) ===

- Summary (3–7 bullets)
- Per-file results (from Stage 2)
- Reuse Sweep Findings (from Stage 3)
- Pattern Sweep Results (from Stage 4)
- Quick patches (tiny unified diffs; do NOT apply)

=== Machine task: create `.ai-review.json` ===
Create a single new untracked file at repo root named `.ai-review.json`. Valid JSON only (no code fences). Include ALL findings as line-anchored comments (single- or multi-line). Anchor tests/mentoring/reuse items to the most relevant changed line.

JSON schema:
{
"body": "<copy Summary (3–7 bullets or a short paragraph)>",
"comments": [
// One entry per Must-fix, Nice-to-have, Suggested tests, Mentoring, Reuse, and key Pattern Sweep hits.
// Single-line:
{ "path": "<rel/path>", "line": <HEAD line>, "side": "RIGHT", "body": "[Must-fix] <Issue>. Evidence: <frag>. Impact: <why>. Fix: <one-liner>. [Category: <File | Reuse | Pattern>]" },

    // Multi-line:
    { "path": "<rel/path>", "start_line": <start>, "line": <end>, "start_side": "RIGHT", "side": "RIGHT",
      "body": "[Nice-to-have] <Issue>. Evidence: <frag(s)>. Impact: <why>. Suggestion: <concise change>. [Category: <File | Reuse | Pattern>]" }

]
}

JSON rules:

- Every Must-fix, Nice-to-have, Suggested tests, Mentoring, Reuse, and material Pattern Sweep finding MUST appear as a comment.
- Only use files and lines changed in this PR; pick a stable anchor line (e.g., function/const declaration).
- Prefer line/side (and start_line/start_side for ranges). Include a tiny diff in body when trivial.
- Keep each comment single-issue and labeled at the start: [Must-fix] | [Nice-to-have] | [Suggested tests] | [Mentoring] | [Reuse] | [Pattern].
- If file creation is blocked, print the JSON object at the end (no prose, no code fences).
- One issue per comment. 1–2 sentences. ≤ 220 characters.
- Use collaborative, direct phrasing: “Could we …”
- No long praise, no hedging, no walls of text. Be specific, actionable, kind.
- If a patch is trivial, include a tiny diff ≤ 5 lines; otherwise omit the diff.

Final step

- After creating `.ai-review.json`, print exactly: Created .ai-review.json (untracked).
