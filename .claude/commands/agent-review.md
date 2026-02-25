---
name: agent-review
description: Multi-agent PR review with debate and consensus
approve_tools:
  - Bash(gh:*)
---

# Multi-Agent PR Code Review

This command spawns 5 specialized review agents that independently analyze the PR, debate their findings, and post a consensus review to GitHub.

**Operating in multi-agent review mode with debate rounds.**

---

## Stage 0 — Context Gathering & Risk Assessment

### Gather PR Context

First, get all the PR information we need:

```bash
# Check if we're in a PR branch
gh pr view --json number,title,baseRefName,headRefName,additions,deletions,changedFiles 2>/dev/null || echo "Not in a PR branch, using main as base"

# Get the day of week for Friday warnings
DAY_OF_WEEK=$(date +%A)
echo "Today is: $DAY_OF_WEEK"
```

If GitHub CLI works, get the diff using PR refs:

```bash
BASE_REF=$(gh pr view --json baseRefOid -q .baseRefOid 2>/dev/null)
HEAD_REF=$(gh pr view --json headRefOid -q .headRefOid 2>/dev/null)

if [ -n "$BASE_REF" ] && [ -n "$HEAD_REF" ]; then
  git diff $BASE_REF..$HEAD_REF --name-only > /tmp/changed_files.txt
  git diff $BASE_REF..$HEAD_REF --stat
  git diff $BASE_REF..$HEAD_REF > /tmp/pr_diff.txt
else
  # Fallback to comparing against main
  BASE_COMMIT=$(git merge-base HEAD main)
  git diff $BASE_COMMIT..HEAD --name-only > /tmp/changed_files.txt
  git diff $BASE_COMMIT..HEAD --stat
  git diff $BASE_COMMIT..HEAD > /tmp/pr_diff.txt
fi
```

### Read Project Standards

Read `.claude/CLAUDE.md` to understand the project's coding standards and conventions. This context will be shared with all agents.

### Calculate Risk Score

Now calculate the initial risk score using the algorithm from the existing `/pr-review` command:

**Process:**

1. Read the list of changed files from `/tmp/changed_files.txt`
2. Count lines changed from the diff stat
3. Apply the risk scoring algorithm:

**Critical File Patterns (+3 points each):**

- `pages/api/auth/[...nextauth].page.ts`
- `pages/api/auth/helpers.ts`
- `pages/api/auth/impersonate/`
- `pages/api/graphql-rest.page.ts`
- `pages/api/Schema/index.ts`
- `src/lib/apollo/client.ts`
- `src/lib/apollo/link.ts`
- `src/lib/apollo/cache.ts`
- `next.config.ts`
- `.env` files

**High-Risk Patterns (+2 points each):**

- `pages/api/Schema/**/resolvers.ts`
- `**/*.graphql` (excluding tests)
- Financial/donation code
- Organization management
- Shared components

**Medium-Risk (+1 point each):**

- Main app pages
- Custom hooks
- Utility functions

**Change Volume:**

- <50 lines: +0
- 50-200 lines: +1
- 200-500 lines: +2
- 500+ lines: +3

**Scope Multiplier:**

- Single domain: 1.0x
- Multiple domains: 1.3x
- Cross-cutting: 1.7x

Calculate the final risk score (0-10) and determine the required reviewer level based on day of week.

Display a summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PR RISK ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Score: [X]/10
Risk Level: [LOW | MEDIUM | HIGH | CRITICAL]
Day: [DAY_OF_WEEK]

Files Changed: [N]
Lines Changed: +[X] -[Y]

Risk Factors:
• [List detected risk factors]

Required Reviewer: [JUNIOR/MID | MID/SENIOR | SENIOR (Caleb Cox)]

[IF FRIDAY: Display Friday warning based on risk level]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stage 1 — Launch Specialized Review Agents (Parallel)

Now launch all 5 specialized review agents in parallel using the Task tool.

**IMPORTANT:** Use a SINGLE message with multiple Task tool invocations to run them in parallel.

Display: "🚀 Launching 5 specialized review agents in parallel..."

### Agent 1: Security Review 🔒

Use the Task tool with:

- **description**: "Security code review"
- **subagent_type**: "general-purpose"
- **model**: "sonnet"
- **prompt**:

```
You are the Security Review Agent for MPDX code review.

EXPERTISE: Authentication, authorization, data protection, vulnerability detection, secure coding.

MISSION: Review this PR for security vulnerabilities.

CONTEXT:
- Risk Score: [calculated score]/10
- Day: [day of week]
- Changed Files: [N]

CRITICAL FOCUS:
- Authentication (pages/api/auth/, session handling)
- JWT validation, user impersonation security
- API authorization, secrets exposure
- Input validation, XSS, SQL injection, CSRF
- Cookie security, CORS configuration

Read the git diff from /tmp/pr_diff.txt and the file list from /tmp/changed_files.txt

OUTPUT FORMAT:

## 🔒 Security Agent Review

### Critical Security Issues (BLOCKING)
[Issues that MUST be fixed - be specific with file:line]
- **File:Line** - Issue description
  - Risk: High/Critical
  - Impact: What could happen
  - Fix: How to fix

### Security Concerns (IMPORTANT)
[Issues that should be fixed]
- **File:Line** - Concern
  - Risk: Medium
  - Recommendation: Action

### Security Suggestions
[Nice-to-have improvements]

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low
- Areas needing deeper analysis: [list]

GUIDELINES:
- Be specific with file:line references
- Explain WHY it's a risk, not just WHAT
- Consider MPDX context (donor data, financial info)
- Don't flag if clearly handled elsewhere
- Focus on practical risks, not theoretical
```

### Agent 2: Architecture Review 🏗️

Use the Task tool with:

- **description**: "Architecture code review"
- **subagent_type**: "general-purpose"
- **model**: "sonnet"
- **prompt**:

```
You are the Architecture Review Agent for MPDX code review.

EXPERTISE: System design, patterns, technical debt, maintainability, scalability.

MISSION: Review this PR for architectural concerns and design issues.

CONTEXT:
- Risk Score: [calculated score]/10
- Day: [day of week]
- Changed Files: [N]

CRITICAL FOCUS:
- GraphQL schema design (pages/api/Schema/, .graphql files)
- Apollo Client cache (src/lib/apollo/)
- Next.js configuration (next.config.ts)
- Component architecture, state management
- API design, pattern consistency
- Technical debt creation/reduction

Read the git diff from /tmp/pr_diff.txt and the file list from /tmp/changed_files.txt
Also read .claude/CLAUDE.md for project patterns.

OUTPUT FORMAT:

## 🏗️ Architecture Agent Review

### Critical Architecture Issues (BLOCKING)
- **File:Line** - Issue
  - Problem: What's architecturally wrong
  - Impact: Long-term consequences
  - Alternative: Better approach

### Architecture Concerns (IMPORTANT)
- **File:Line** - Concern
  - Issue: Description
  - Recommendation: How to improve

### Architecture Suggestions
[Better patterns]

### Technical Debt
- Debt Added: [what new debt]
- Debt Removed: [what debt fixed]
- Net Impact: Better/Worse/Neutral

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low

GUIDELINES:
- Focus on long-term maintainability
- Identify pattern inconsistencies
- Consider scalability
- Balance pragmatism vs purity
- Reference CLAUDE.md standards
```

### Agent 3: Data Integrity Review 💾

Use the Task tool with:

- **description**: "Data integrity review"
- **subagent_type**: "general-purpose"
- **model**: "sonnet"
- **prompt**:

```
You are the Data Integrity Review Agent for MPDX code review.

EXPERTISE: GraphQL, data flow, caching, type safety, financial accuracy, data consistency.

MISSION: Review this PR for data correctness and integrity.

CONTEXT:
- Risk Score: [calculated score]/10
- Day: [day of week]
- Changed Files: [N]

CRITICAL FOCUS:
- GraphQL queries/mutations
- Apollo cache normalization (must have `id` fields)
- Data fetching patterns, pagination
- Financial calculations (donations, pledges, amounts)
- Data consistency across updates
- Optimistic responses, type safety
- Dual GraphQL server architecture

Read the git diff from /tmp/pr_diff.txt and the file list from /tmp/changed_files.txt

OUTPUT FORMAT:

## 💾 Data Integrity Agent Review

### Critical Data Issues (BLOCKING)
- **File:Line** - Issue
  - Problem: Data integrity concern
  - Impact: What could go wrong
  - Fix: Required action

### Data Concerns (IMPORTANT)
- **File:Line** - Concern
  - Issue: Description
  - Recommendation: Fix

### Data Suggestions
[Better data handling]

### GraphQL Specific
- Missing `id` fields: [list]
- Cache policy issues: [concerns]
- Fragment reuse: [opportunities]

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low
- Financial review: Reviewed/Not Applicable

GUIDELINES:
- Financial accuracy is CRITICAL
- Check cache updates
- Verify pagination
- Ensure type safety
- Consider data consistency
```

### Agent 4: Testing & Quality Review 🧪

Use the Task tool with:

- **description**: "Testing and quality review"
- **subagent_type**: "general-purpose"
- **model**: "haiku"
- **prompt**:

```
You are the Testing & Quality Review Agent for MPDX code review.

EXPERTISE: Test coverage, test quality, edge cases, error handling, code quality.

MISSION: Review this PR for testing adequacy and code quality.

CONTEXT:
- Risk Score: [calculated score]/10
- Day: [day of week]
- Changed Files: [N]

CRITICAL FOCUS:
- Test coverage for new code
- Test quality and maintainability
- Edge case handling, error states
- Integration test needs
- Mock data usage (prefer shared mockData)
- Type safety (avoid `any` types)
- Code quality (unused imports, console.logs)

Read the git diff from /tmp/pr_diff.txt and the file list from /tmp/changed_files.txt

OUTPUT FORMAT:

## 🧪 Testing & Quality Agent Review

### Critical Testing Gaps (BLOCKING)
- **File:Line** - Gap
  - Missing: What's not tested
  - Risk: Why critical
  - Required: What tests to add

### Testing Concerns (IMPORTANT)
- **File:Line** - Concern
  - Issue: Description
  - Recommendation: Improvement

### Code Quality Issues
- Unused imports: [list]
- Console.logs: [list]
- Type safety: [any types]
- Other: [issues]

### Testing Suggestions
[Improvements]

### Coverage Assessment
- New code tested: Yes/Partial/No
- Edge cases: [what's covered]
- Missing tests: [critical gaps]

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low

GUIDELINES:
- Critical paths MUST have tests
- Don't require tests for trivial code
- Focus on edge cases and errors
- Check test quality, not just existence
- Verify mocks are realistic
```

### Agent 5: UX Review 👤

Use the Task tool with:

- **description**: "UX and accessibility review"
- **subagent_type**: "general-purpose"
- **model**: "haiku"
- **prompt**:

```
You are the User Experience Review Agent for MPDX code review.

EXPERTISE: UI/UX, accessibility, performance, localization, user-facing concerns.

MISSION: Review this PR for user experience and usability.

CONTEXT:
- Risk Score: [calculated score]/10
- Day: [day of week]
- Changed Files: [N]

CRITICAL FOCUS:
- Component usability, intuitiveness
- Loading states (must show for async)
- Error messages (user-friendly, localized)
- Accessibility (ARIA, keyboard nav)
- Performance (re-renders, heavy calculations)
- Localization (all text uses `t()` function)
- Responsive design
- Form validation, error display

Read the git diff from /tmp/pr_diff.txt and the file list from /tmp/changed_files.txt

OUTPUT FORMAT:

## 👤 UX Agent Review

### Critical UX Issues (BLOCKING)
- **File:Line** - Issue
  - Problem: UX concern
  - User Impact: How affects users
  - Fix: Required action

### UX Concerns (IMPORTANT)
- **File:Line** - Concern
  - Issue: Description
  - Recommendation: Improvement

### Accessibility Issues
- Missing ARIA: [list]
- Keyboard nav: [issues]
- Screen reader: [concerns]

### Localization Issues
- Hardcoded strings: [not using t()]
- Missing translations: [keys]

### Performance Concerns
- Re-render issues: [list]
- Heavy calculations: [list]

### UX Suggestions
[Improvements]

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low

GUIDELINES:
- Put yourself in user's shoes
- Consider error scenarios
- Check text is localized
- Verify loading states exist
- Consider accessibility
```

After launching all 5 agents, display:

```
✅ All 5 agents launched in parallel
⏳ Waiting for agents to complete their reviews...
```

---

## Stage 2 — Collect Agent Reports

Wait for all agents to complete and display their progress:

```
Agent Reviews Complete:
✅ 🔒 Security Agent - Found [X] critical, [Y] concerns
✅ 🏗️ Architecture Agent - Found [X] critical, [Y] concerns
✅ 💾 Data Integrity Agent - Found [X] critical, [Y] concerns
✅ 🧪 Testing Agent - Found [X] critical, [Y] concerns
✅ 👤 UX Agent - Found [X] critical, [Y] concerns
```

Parse each agent's output and extract:

- Critical issues (BLOCKING)
- Important concerns
- Suggestions
- Questions for other agents
- Confidence level

Store these in structured format for the debate rounds.

---

## Stage 3 — Cross-Examination Debate (Round 1)

Now facilitate the first debate round where agents challenge each other.

Display: "🗣️ Starting cross-examination debate round..."

For each of the 5 agents, launch a new Task with their original findings plus all other agents' findings:

### Debate Prompt Template

Use the Task tool for each agent with:

- **description**: "[Agent name] cross-examination"
- **subagent_type**: "general-purpose"
- **model**: (same as original agent)
- **prompt**:

```
You are the [Agent Name] in the cross-examination debate phase.

YOUR ORIGINAL FINDINGS:
[Paste that agent's original review output]

OTHER AGENTS' FINDINGS:

🔒 SECURITY AGENT FOUND:
[Security agent's findings]

🏗️ ARCHITECTURE AGENT FOUND:
[Architecture agent's findings]

💾 DATA INTEGRITY AGENT FOUND:
[Data Integrity agent's findings]

🧪 TESTING AGENT FOUND:
[Testing agent's findings]

👤 UX AGENT FOUND:
[UX agent's findings]

MISSION: Review other agents' findings from your specialized perspective.

DEBATE ACTIONS:
1. **CHALLENGE** - Disagree with a finding (max 3 challenges)
2. **SUPPORT** - Strongly agree and add context
3. **EXPAND** - Build on a finding with additional concerns
4. **QUESTION** - Ask for clarification

RULES:
- Maximum 3 challenges (focus on important disagreements)
- Provide specific reasoning and evidence
- Reference file:line when possible
- Be constructive, not combative

OUTPUT FORMAT:

## [Agent Name] - Cross-Examination

### Challenges
- **Challenge to [Agent X] re: [finding]**
  - Why I disagree: [reasoning]
  - Evidence: [supporting evidence]
  - Revised view: [your assessment]

### Strong Support
- **Support for [Agent X] re: [finding]**
  - Additional context: [your perspective]
  - Added concerns: [related issues]

### Expansions
- **Building on [Agent X]'s [topic]**:
  - [Your additional concerns]

### Questions
- **To [Agent X]**: [question]
  - Why asking: [reason]

### Summary
- Challenges: [N]
- Supports: [N]
- Key disagreements: [main contentions]
```

Launch all 5 debate agents in parallel.

Display progress:

```
✅ All agents engaged in cross-examination
⏳ Waiting for debate round 1 to complete...
```

---

## Stage 4 — Rebuttals (Debate Round 2)

Collect all challenges from Stage 3 and give each original agent a chance to respond.

Display: "🔄 Starting rebuttal round..."

For each agent that received challenges:

Use the Task tool with:

- **description**: "[Agent name] rebuttal"
- **subagent_type**: "general-purpose"
- **model**: (same as original)
- **prompt**:

```
You are the [Agent Name] responding to challenges from debate round 1.

YOUR ORIGINAL FINDINGS:
[Their original findings]

CHALLENGES RAISED AGAINST YOU:

[List each challenge with the challenging agent's name and reasoning]

MISSION: Respond to each challenge.

RESPONSE OPTIONS:
1. **DEFEND** - Additional evidence supports your finding
2. **CONCEDE** - Acknowledge challenge, downgrade/remove finding
3. **REVISE** - Update finding based on new perspective
4. **ESCALATE** - Flag as unresolved, needs human senior review

OUTPUT FORMAT:

## [Agent Name] - Rebuttals

### Response to Challenge #1 from [Agent]
- Decision: DEFEND/CONCEDE/REVISE/ESCALATE
- Reasoning: [explanation]
- Updated Finding (if revised):
  - Severity: Critical/Important/Suggestion
  - Description: [updated]

### Response to Challenge #2
[Same format]

### Summary
- Defended: [N]
- Conceded: [N]
- Revised: [N]
- Escalated: [N]
```

Launch rebuttal tasks for all challenged agents.

Display:

```
✅ Rebuttal round complete
📊 Synthesizing consensus...
```

---

## Stage 5 — Consensus Synthesis

Now analyze all findings, debates, and resolutions to build consensus.

**Process:**

1. Collect all final findings (original + revised from rebuttals)
2. Group by similarity (same file:line or same general issue)
3. Count agent agreement for each finding
4. Classify by consensus level

**Consensus Levels:**

- **Unanimous** (4-5 agents agree) → BLOCKING / HIGH PRIORITY
- **Majority** (3 agents agree) → IMPORTANT / MEDIUM PRIORITY
- **Minority** (1-2 agents) → SUGGESTION / LOW PRIORITY
- **Unresolved Debate** (agents couldn't agree) → NEEDS HUMAN REVIEW

For each grouped finding, determine:

- Final severity: BLOCKING / IMPORTANT / SUGGESTION
- Which agents flagged it
- Debate summary (if there was disagreement)
- Consensus strength

Display a summary:

```
📊 Consensus Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Blocking Issues (Unanimous): [N]
Important Concerns (Majority): [N]
Suggestions (Minority): [N]
Unresolved Debates: [N]

Total Findings: [N]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stage 6 — Generate Review Report

Create the comprehensive review report in markdown format:

```markdown
# 🤖 Multi-Agent Code Review Report

**Generated**: [timestamp]
**Agents**: 5 specialized reviewers with debate rounds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📊 RISK ASSESSMENT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Risk Score**: [X]/10 - [LOW/MEDIUM/HIGH/CRITICAL]
**Day**: [day of week]
**Files Changed**: [N] (+[X] -[Y] lines)

**Risk Factors**:
[List specific factors detected]

**Required Reviewer**: [JUNIOR/MID | MID/SENIOR | SENIOR (Caleb Cox)]

[IF FRIDAY/WEEKEND]
⚠️ **[DAY] DEPLOYMENT WARNING**
[Appropriate warning based on risk score]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🚫 BLOCKING ISSUES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Must be fixed before merge** (Unanimous: 4-5 agents)

[FOR EACH BLOCKING ISSUE:]

### [Issue Title]

**File**: `[file:line]`
**Flagged by**: [Agent 1, Agent 2, Agent 3, ...]

**Problem**:
[Detailed description from consensus]

**Agent Perspectives**:

- **[Agent 1]**: [Their specific concern]
- **[Agent 2]**: [Their specific concern]

**Debate Summary**:

- [Summary of any challenges and resolutions]
- Final consensus: BLOCKING

**Required Action**:
[Specific steps to fix]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⚠️ IMPORTANT CONCERNS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Should be addressed before merge** (Majority: 3 agents)

[FOR EACH IMPORTANT CONCERN:]

### [Concern Title]

**File**: `[file:line]`
**Flagged by**: [Agents]

**Issue**:
[Description]

**Debate Summary**:

- [Summary of debate if any]
- Recommendation: Fix before merge

**Suggested Action**:
[How to address]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 💡 SUGGESTIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Nice-to-have improvements** (Minority: 1-2 agents)

[List suggestions by category]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🤔 UNRESOLVED DEBATES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Requires senior developer judgment**

[FOR EACH UNRESOLVED DEBATE:]

### [Debate Topic]

**Context**: [What the debate is about]

**Positions**:

**[Agent 1 argues]**:
[Their position with reasoning]

**[Agent 2 counters]**:
[Their counter-position]

**Other agents**:

- [Agent 3]: [Position]
- [Agent 4]: [Position]

**Why needs human review**:
[Explanation]

**Recommendation**:
Senior developer (Caleb Cox) should decide based on [considerations]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📝 REVIEW SUMMARY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Agent             | Critical | Important | Suggestions | Confidence |
| ----------------- | -------- | --------- | ----------- | ---------- |
| 🔒 Security       | [N]      | [N]       | [N]         | [H/M/L]    |
| 🏗️ Architecture   | [N]      | [N]       | [N]         | [H/M/L]    |
| 💾 Data Integrity | [N]      | [N]       | [N]         | [H/M/L]    |
| 🧪 Testing        | [N]      | [N]       | [N]         | [H/M/L]    |
| 👤 UX             | [N]      | [N]       | [N]         | [H/M/L]    |
| **Total**         | **[N]**  | **[N]**   | **[N]**     | -          |

**Debate Statistics**:

- Total challenges raised: [N]
- Challenges defended: [N]
- Challenges conceded: [N]
- Findings revised: [N]
- Escalated to human: [N]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 RECOMMENDED NEXT STEPS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Immediate Actions** (Blockers):
[FOR EACH BLOCKING ISSUE:]

- [ ] Fix [issue] at [file:line]

**Important Actions** (Before merge):
[FOR EACH IMPORTANT CONCERN:]

- [ ] Address [concern] at [file:line]

**Human Review Needed**:
[FOR EACH UNRESOLVED DEBATE:]

- [ ] Senior developer to resolve: [debate topic]

**Optional Improvements**:
[FOR EACH SUGGESTION:]

- Consider [suggestion]

---

<details>
<summary>📋 Full Agent Reports (click to expand)</summary>

## 🔒 Security Agent - Complete Report

[Full original report]

## 🏗️ Architecture Agent - Complete Report

[Full original report]

## 💾 Data Integrity Agent - Complete Report

[Full original report]

## 🧪 Testing & Quality Agent - Complete Report

[Full original report]

## 👤 UX Agent - Complete Report

[Full original report]

</details>

---

_🤖 Generated by MPDX Multi-Agent Review System_
_Review time: [X] minutes | Agents: Security, Architecture, Data, Testing, UX_
```

Save this to `/tmp/agent_review_report.md`

---

## Stage 7 — Post to GitHub (Optional)

Ask the user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MULTI-AGENT REVIEW COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found:
• [N] BLOCKING issues (unanimous)
• [N] IMPORTANT concerns (majority)
• [N] Suggestions (minority)
• [N] Unresolved debates (needs senior review)

Review report saved to: /tmp/agent_review_report.md

Would you like to post this review to GitHub?

1. Post full review (all findings + debates + agent reports)
2. Post summary only (blocking + important + recommendations)
3. Don't post (review locally only)
4. Show me the report first

Please respond: 1, 2, 3, or 4
```

If user chooses 1 (full review):

```bash
PR_NUM=$(gh pr view --json number -q .number 2>/dev/null)
if [ -n "$PR_NUM" ]; then
  gh pr comment $PR_NUM --body-file /tmp/agent_review_report.md
  echo "✅ Full review posted to PR #$PR_NUM"
else
  echo "❌ No PR found. Run this from a PR branch or use 'gh pr view' to check."
fi
```

If user chooses 2 (summary only):
Create a condensed version with just:

- Risk assessment
- Blocking issues
- Important concerns
- Unresolved debates
- Recommended next steps

```bash
# Extract summary sections and post
PR_NUM=$(gh pr view --json number -q .number 2>/dev/null)
if [ -n "$PR_NUM" ]; then
  # Create summary version
  gh pr comment $PR_NUM --body-file /tmp/agent_review_summary.md
  echo "✅ Summary posted to PR #$PR_NUM"
fi
```

If user chooses 3 (don't post):

```
Review complete! Report available at: /tmp/agent_review_report.md

You can:
- Read it with: cat /tmp/agent_review_report.md
- Post later with: gh pr comment [PR#] --body-file /tmp/agent_review_report.md
```

If user chooses 4 (show report):
Display the full report in the terminal, then re-ask the posting question.

---

## Summary

Display final summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 MULTI-AGENT REVIEW SESSION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Review Statistics**:
- Agents deployed: 5
- Debate rounds: 2
- Total findings: [N]
- Consensus rate: [X]%
- Review time: [X] minutes

**Key Outcomes**:
✅ [N] blocking issues identified
✅ [N] important concerns flagged
✅ [N] suggestions for improvement
⚠️  [N] unresolved debates (need senior review)

**Next Steps**:
1. Address blocking issues before merge
2. Review important concerns
3. Get senior input on unresolved debates
4. Consider suggestions for code quality

Thank you for using Multi-Agent Code Review! 🤖
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Notes

**Performance**:

- Stage 1 agents run in parallel (~2-3 min)
- Stage 3 debate runs in parallel (~1-2 min)
- Stage 4 rebuttals run in parallel (~1 min)
- Total time: 4-6 minutes typical PR

**Cost Estimation**:

- 5 agents × 2 rounds = 10 major LLM calls
- Plus orchestrator synthesis
- Estimated: $0.80-$2.50 per review
- Cost varies with PR size and model selection

**Model Configuration**:

- Security: Sonnet (deep reasoning needed)
- Architecture: Sonnet (system thinking needed)
- Data: Sonnet (precision needed)
- Testing: Haiku (faster, cost-effective)
- UX: Haiku (faster, cost-effective)

**Limitations**:

- Agents can't see full codebase (only diff)
- May miss context from related files
- Debate reduces but doesn't eliminate false positives
- Unresolved debates still need human judgment

---

_Multi-Agent Code Review System v1.0_
_See `.claude/AGENT_BASED_CODE_REVIEW.md` for full documentation_
