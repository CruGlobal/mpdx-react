---
name: agent-review
description: Multi-agent PR review with smart selection and automated fixes
approve_tools:
  - Bash(gh:*)
---

# Multi-Agent PR Code Review v3.0 🚀

AI-powered code review with smart agent selection, automated fixes, and quality metrics.

**💰 COST**:
- `/agent-review quick` - $0.50 (2 min, 3 agents, Haiku)
- `/agent-review` or `/agent-review standard` - $2-4 (5 min, smart selection)
- `/agent-review deep` - $6-10 (10 min, all 7 agents, Opus)

**Usage**:
```bash
/agent-review           # Standard mode (smart selection, recommended)
/agent-review quick     # Quick feedback for simple PRs
/agent-review deep      # Comprehensive analysis for critical changes
```

---

## Stage 0A — Parse Review Mode & Initialize

### Determine Review Mode

Check command argument to determine mode:

```bash
# Get mode from argument (default to standard)
MODE="${1:-standard}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
case "$MODE" in
  quick)
    echo "🏃 QUICK REVIEW MODE"
    echo "• 3 agents (Testing, Standards, UX)"
    echo "• Model: Haiku (fast, cost-effective)"
    echo "• Time: ~2 minutes"
    echo "• Cost: ~$0.50"
    MODEL="haiku"
    AGENT_MODE="quick"
    ;;
  deep)
    echo "🔬 DEEP REVIEW MODE"
    echo "• All 7 agents"
    echo "• Model: Opus (maximum quality)"
    echo "• Time: ~10 minutes"
    echo "• Cost: ~$6-10"
    MODEL="opus"
    AGENT_MODE="deep"
    ;;
  standard|*)
    echo "⚡ STANDARD REVIEW MODE (Recommended)"
    echo "• Smart agent selection based on changes"
    echo "• Model: Sonnet/Opus (balanced)"
    echo "• Time: ~5 minutes"
    echo "• Cost: ~$2-4"
    MODEL="smart"
    AGENT_MODE="standard"
    ;;
esac
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
```

### Initialize Directories

```bash
# Create directories for metrics and fixes
mkdir -p .claude/review-history
mkdir -p .claude/review-metrics
mkdir -p .claude/pr-metrics
mkdir -p /tmp/automated_fixes
mkdir -p /tmp/dependency_analysis
```

---

## Stage 0 — Context Gathering & Risk Assessment

### Gather PR Context

First, get all the PR information we need:

```bash
# Check if we're in a PR branch
gh pr view --json number,title,baseRefName,headRefName,additions,deletions,changedFiles 2>/dev/null || echo "Not in a PR branch, using main as base"

# Get the day of week for reviewer recommendations
DAY_OF_WEEK=$(date +%A)
echo "Today is: $DAY_OF_WEEK"
```

If GitHub CLI works, get the diff using PR refs:

```bash
BASE_REF=$(gh pr view --json baseRefOid -q .baseRefOid 2>/dev/null)
HEAD_REF=$(gh pr view --json headRefOid -q .headRefOid 2>/dev/null)

if [ -n "$BASE_REF" ] && [ -n "$HEAD_REF" ]; then
  git diff $BASE_REF..$HEAD_REF --name-only > /tmp/changed_files.txt
  git diff $BASE_REF..$HEAD_REF --stat > /tmp/diff_stat.txt
  git diff $BASE_REF..$HEAD_REF > /tmp/pr_diff.txt
else
  # Fallback to comparing against main
  BASE_COMMIT=$(git merge-base HEAD main)
  git diff $BASE_COMMIT..HEAD --name-only > /tmp/changed_files.txt
  git diff $BASE_COMMIT..HEAD --stat > /tmp/diff_stat.txt
  git diff $BASE_COMMIT..HEAD > /tmp/pr_diff.txt
fi

# Get full content of changed files for agents to read
mkdir -p /tmp/changed_file_contents
while IFS= read -r file; do
  if [ -f "$file" ]; then
    cp "$file" "/tmp/changed_file_contents/$(basename "$file")"
  fi
done < /tmp/changed_files.txt
```

### Read Project Standards

Read `CLAUDE.md` to understand the project's coding standards and conventions. This context will be shared with all agents.

### Calculate Risk Score

Now calculate the risk score with improved algorithm:

**Process:**

1. Read the list of changed files from `/tmp/changed_files.txt`
2. Count lines changed from `/tmp/diff_stat.txt`
3. Apply the risk scoring algorithm:

**Critical File Patterns (+4 points each):**

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
- Database migrations
- Payment processing code

**High-Risk Patterns (+3 points each):**

- `pages/api/Schema/**/resolvers.ts`
- `**/*.graphql` (excluding tests)
- Financial/donation code (`**/Donation**`, `**/Pledge**`, `**/Gift**`)
- Organization management
- Shared components (`src/components/Shared/**`)
- Authentication flows
- Data synchronization code

**Medium-Risk (+2 points each):**

- Main app pages
- Custom hooks
- Utility functions with business logic
- Report generation
- Export/import features

**Low-Risk (+1 point each):**

- UI-only components
- Styling changes
- Test files
- Documentation

**Change Volume Multiplier:**

- <50 lines: +0
- 50-200 lines: +1
- 200-500 lines: +2
- 500-1000 lines: +3
- 1000+ lines: +4

**Scope Multiplier:**

- Single file: 1.0x
- Single feature area: 1.0x
- Multiple related features: 1.3x
- Cross-cutting changes: 1.7x
- Core infrastructure: 2.0x

**Final Risk Level Classification:**

- 0-3 points: **LOW** → Entry-level+ can review
- 4-6 points: **MEDIUM** → Entry-level+ can review
- 7-9 points: **HIGH** → Experienced dev+ should review
- 10+ points: **CRITICAL** → Senior dev (Caleb Cox) must review

Calculate and display the summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PR RISK ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Score: [X]/[max]
Risk Level: [LOW | MEDIUM | HIGH | CRITICAL]
Day: [DAY_OF_WEEK]

Files Changed: [N]
Lines Changed: +[X] -[Y]

Risk Factors Detected:
• [List specific risk factors found]

Required Reviewer Level:
[LOW/MEDIUM]: ✅ Entry-level or above can review
[HIGH]: ⚠️ Experienced developer or above should review
[CRITICAL]: 🚨 Senior developer (Caleb Cox) must review

💰 Estimated Review Cost: $[X.XX] (using Opus for all agents)

[IF FRIDAY/WEEKEND: Display appropriate warning based on risk level]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stage 0B — Smart Agent Selection (Standard Mode Only)

If `AGENT_MODE="standard"`, analyze which agents are actually needed:

```bash
if [ "$AGENT_MODE" = "standard" ]; then
  echo "🤖 Analyzing PR to select relevant agents..."
  echo ""

  # Initialize agent list
  SELECTED_AGENTS=()

  # Always include these
  SELECTED_AGENTS+=("Architecture" "Testing" "Standards")
  echo "✅ Architecture Agent - Always included"
  echo "✅ Testing Agent - Always included"
  echo "✅ Standards Agent - Always included"

  # Security Agent - if auth/API code changed
  if grep -q -E "(pages/api/auth|session|jwt|impersonate|authentication)" /tmp/changed_files.txt 2>/dev/null; then
    SELECTED_AGENTS+=("Security")
    echo "✅ Security Agent - Auth/API code detected"
    SECURITY_NEEDED=true
  else
    echo "❌ Security Agent - No auth/API changes (saved ~\$1.50)"
    SECURITY_NEEDED=false
  fi

  # Data Integrity Agent - if GraphQL or Apollo changes
  if grep -q -E "(\.graphql|apollo|src/lib/apollo)" /tmp/changed_files.txt 2>/dev/null; then
    SELECTED_AGENTS+=("Data")
    echo "✅ Data Integrity Agent - GraphQL/Apollo changes detected"
    DATA_NEEDED=true
  else
    echo "❌ Data Integrity Agent - No GraphQL changes (saved ~\$1.00)"
    DATA_NEEDED=false
  fi

  # UX Agent - if UI components changed
  if grep -q -E "(\.tsx|components/.*\.tsx)" /tmp/changed_files.txt 2>/dev/null; then
    SELECTED_AGENTS+=("UX")
    echo "✅ UX Agent - UI components modified"
    UX_NEEDED=true
  else
    echo "❌ UX Agent - No UI changes (saved ~\$1.00)"
    UX_NEEDED=false
  fi

  # Financial Agent - if financial code changed
  if grep -q -iE "(donation|pledge|gift|amount|currency|balance|financial)" /tmp/pr_diff.txt 2>/dev/null; then
    SELECTED_AGENTS+=("Financial")
    echo "✅ Financial Agent - Financial code detected"
    FINANCIAL_NEEDED=true
  else
    echo "❌ Financial Agent - No financial code (saved ~\$1.50)"
    FINANCIAL_NEEDED=false
  fi

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Selected: ${#SELECTED_AGENTS[@]} of 7 agents"
  SAVED_COST=$(( (7 - ${#SELECTED_AGENTS[@]}) * 1 ))
  echo "Estimated savings: ~\$$SAVED_COST"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Save for later stages
  echo "${SELECTED_AGENTS[@]}" > /tmp/selected_agents.txt
elif [ "$AGENT_MODE" = "quick" ]; then
  # Quick mode: only 3 agents
  echo "Testing UX Standards" > /tmp/selected_agents.txt
  SECURITY_NEEDED=false
  DATA_NEEDED=false
  UX_NEEDED=true
  FINANCIAL_NEEDED=false
elif [ "$AGENT_MODE" = "deep" ]; then
  # Deep mode: all 7 agents
  echo "Security Architecture Data Testing UX Financial Standards" > /tmp/selected_agents.txt
  SECURITY_NEEDED=true
  DATA_NEEDED=true
  UX_NEEDED=true
  FINANCIAL_NEEDED=true
fi
```

---

## Stage 1 — Launch Specialized Review Agents (Parallel)

Now launch the selected review agents in parallel using the Task tool.

**IMPORTANT:** Use a SINGLE message with multiple Task tool invocations to run them in parallel.

Read `/tmp/selected_agents.txt` to determine which agents to launch.

Display: "🚀 Launching [N] specialized review agents in parallel..."

**Note**: Only launch agents that are needed based on the mode and smart selection. Check the variables:
- `$SECURITY_NEEDED` - Launch Security Agent if true
- `$DATA_NEEDED` - Launch Data Integrity Agent if true
- `$UX_NEEDED` - Launch UX Agent if true
- `$FINANCIAL_NEEDED` - Launch Financial Agent if true
- Always launch: Architecture, Testing, Standards (in all modes except quick which uses Testing, UX, Standards)

### Agent 1: Security Review 🔒

Use the Task tool with:

- **description**: "Security code review"
- **subagent_type**: "general-purpose"
- **model**: "opus"
- **prompt**:

```
You are the Security Review Agent for MPDX code review.

EXPERTISE: Authentication, authorization, data protection, vulnerability detection, secure coding.

MISSION: Review this PR for security vulnerabilities.

CONTEXT:
- Risk Score: [calculated score]/[max]
- Risk Level: [LOW/MEDIUM/HIGH/CRITICAL]
- Day: [day of week]
- Changed Files: [N]
- Lines Changed: +[X] -[Y]

INSTRUCTIONS:
1. Read /tmp/pr_diff.txt for the diff
2. Read /tmp/changed_files.txt for the list of changed files
3. For EACH changed file, read the FULL file content (not just the diff) to understand context
4. Search for related security-critical files (auth, API, permissions)

CRITICAL FOCUS:
- Authentication (pages/api/auth/, session handling)
- JWT validation, user impersonation security
- API authorization, secrets exposure
- Input validation, XSS, SQL injection, CSRF
- Cookie security, CORS configuration
- Data access controls (ensure users can only access their own data)

OUTPUT FORMAT:

## 🔒 Security Agent Review

### Critical Security Issues (BLOCKING) - Severity: 10/10
[Issues that MUST be fixed - be specific with file:line]
- **File:Line** - Issue description
  - Severity: 10/10
  - Risk: What attack vector this enables
  - Impact: What could happen
  - Fix: Specific code change needed

### Security Concerns (IMPORTANT) - Severity: 6-9/10
[Issues that should be fixed]
- **File:Line** - Concern
  - Severity: [6-9]/10
  - Risk: Potential vulnerability
  - Recommendation: How to fix

### Security Suggestions - Severity: 3-5/10
[Nice-to-have improvements]
- Improvement suggestion
  - Severity: [3-5]/10
  - Benefit: Why this matters

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low
- Areas needing deeper analysis: [list]

CODEBASE CONTEXT SEARCH:
Before flagging an issue, search for how similar code is handled in the codebase:
1. Use Grep tool to find similar patterns
2. Check if this pattern is used consistently
3. Reference existing good examples
4. Don't flag patterns used across the codebase

Example:
- Found: Potential auth bypass
- Search: grep -r "requireAuth" src/
- Result: Pattern used consistently
- Decision: Check if this file also uses it

AUTOMATED FIX GENERATION:
When you find fixable security issues, provide automated fixes:

Format:
### Automated Fix #N: [Issue Title]
**File**: `path/to/file.tsx:42`
**Issue**: [Brief description]
**Fix Type**: auto-fixable
**Confidence**: High/Medium/Low
**Category**: security

```diff
- [old code with vulnerability]
+ [new code with fix]
```

**Apply command**:
```bash
cat > /tmp/automated_fixes/fix_N_security.sh << 'EOF'
#!/bin/bash
# Fix: [description]
# File: path/to/file.tsx

# [Bash commands to apply fix using sed or other tools]
sed -i '' 's/vulnerable_pattern/secure_pattern/g' path/to/file.tsx
EOF
chmod +x /tmp/automated_fixes/fix_N_security.sh
```

FIXABLE SECURITY ISSUES:
- Missing authentication checks
- Exposed sensitive data
- Missing input validation
- Insecure session handling

GUIDELINES:
- Be specific with file:line references
- Rate severity on 1-10 scale for consensus
- Explain WHY it's a risk, not just WHAT
- Consider MPDX context (donor data, financial info, PII)
- Don't flag if clearly handled elsewhere
- Focus on practical risks, not theoretical
- READ THE FULL FILES for context, not just the diff
- Search codebase before flagging to avoid false positives
- Generate automated fixes for simple security improvements
```

### Agent 2: Architecture Review 🏗️

Use the Task tool with:

- **description**: "Architecture code review"
- **subagent_type**: "general-purpose"
- **model**: "opus"
- **prompt**:

```
You are the Architecture Review Agent for MPDX code review.

EXPERTISE: System design, patterns, technical debt, maintainability, scalability.

MISSION: Review this PR for architectural concerns and design issues.

CONTEXT:
- Risk Score: [calculated score]/[max]
- Risk Level: [LOW/MEDIUM/HIGH/CRITICAL]
- Changed Files: [N]

INSTRUCTIONS:
1. Read /tmp/pr_diff.txt and /tmp/changed_files.txt
2. Read FULL content of changed files for context
3. Read CLAUDE.md for project patterns
4. Search for usage patterns of modified components/functions

CRITICAL FOCUS:
- GraphQL schema design (pages/api/Schema/, .graphql files)
- Apollo Client cache (src/lib/apollo/)
- Next.js configuration (next.config.ts)
- Component architecture, state management
- API design, pattern consistency
- Technical debt creation/reduction
- Scalability concerns

OUTPUT FORMAT:

## 🏗️ Architecture Agent Review

### Critical Architecture Issues (BLOCKING) - Severity: 10/10
- **File:Line** - Issue
  - Severity: 10/10
  - Problem: What's architecturally wrong
  - Impact: Long-term consequences
  - Alternative: Better approach

### Architecture Concerns (IMPORTANT) - Severity: 6-9/10
- **File:Line** - Concern
  - Severity: [6-9]/10
  - Issue: Description
  - Recommendation: How to improve

### Architecture Suggestions - Severity: 3-5/10
[Better patterns and approaches]
- Severity: [3-5]/10

### Technical Debt Analysis
- Debt Added: [what new debt]
- Debt Removed: [what debt fixed]
- Net Impact: Better/Worse/Neutral

### Pattern Compliance
- Follows CLAUDE.md standards: Yes/No/Partial
- Violations: [list]

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low

CODEBASE CONTEXT SEARCH:
Before flagging architectural issues, search for existing patterns:
1. Use Grep to find how similar problems are solved
2. Check if pattern is used consistently across codebase
3. Reference good examples to suggest
4. Don't flag patterns that match established architecture

AUTOMATED FIX GENERATION:
Generate fixes for common architectural issues:
- Inconsistent file naming
- Missing exports
- Improper component structure

Format same as Security Agent above with category: architecture

GUIDELINES:
- Rate severity on 1-10 scale
- Focus on long-term maintainability
- Identify pattern inconsistencies vs CLAUDE.md
- Consider scalability
- Balance pragmatism vs purity
- Search codebase before flagging inconsistencies
- Generate fixes for structural issues
```

### Agent 3: Data Integrity Review 💾

Use the Task tool with:

- **description**: "Data integrity review"
- **subagent_type**: "general-purpose"
- **model**: "opus"
- **prompt**:

```
You are the Data Integrity Review Agent for MPDX code review.

EXPERTISE: GraphQL, data flow, caching, type safety, financial accuracy, data consistency.

MISSION: Review this PR for data correctness and integrity.

CONTEXT:
- Risk Score: [calculated score]/[max]
- Changed Files: [N]

INSTRUCTIONS:
1. Read diff and changed files
2. Read FULL files for data flow context
3. Search for related GraphQL operations
4. Check for financial calculation changes

CRITICAL FOCUS:
- GraphQL queries/mutations (check for `id` fields!)
- Apollo cache normalization
- Data fetching patterns, pagination
- Financial calculations (donations, pledges, amounts) - CRITICAL!
- Data consistency across updates
- Optimistic responses, type safety
- Dual GraphQL server architecture
- Currency handling, rounding

OUTPUT FORMAT:

## 💾 Data Integrity Agent Review

### Critical Data Issues (BLOCKING) - Severity: 10/10
- **File:Line** - Issue
  - Severity: 10/10
  - Problem: Data integrity concern
  - Impact: What could go wrong
  - Fix: Required action

### Data Concerns (IMPORTANT) - Severity: 6-9/10
- **File:Line** - Concern
  - Severity: [6-9]/10
  - Issue: Description
  - Recommendation: Fix

### Data Suggestions - Severity: 3-5/10
[Better data handling]

### GraphQL Specific Checks
- Missing `id` fields: [list]
- Cache policy issues: [concerns]
- Fragment reuse opportunities: [list]
- Pagination properly handled: Yes/No

### Financial Accuracy Review
- Financial calculations reviewed: Yes/No/N/A
- Currency handling correct: Yes/No/N/A
- Rounding issues: None/[issues]

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low
- Financial review confidence: High/Medium/Low/N/A

CODEBASE CONTEXT SEARCH:
Search for GraphQL patterns before flagging:
1. Find similar queries/mutations
2. Check if id fields are consistently used
3. Look for established cache update patterns
4. Reference good examples

AUTOMATED FIX GENERATION:
Generate fixes for data integrity issues:
- Missing id fields in GraphQL queries
- Missing __typename fields
- Incorrect cache updates
- Type inconsistencies

Category: graphql or data-integrity

GUIDELINES:
- Financial accuracy is CRITICAL - flag ANY doubts
- Check cache updates match data changes
- Verify pagination logic
- Ensure type safety
- Consider data consistency
- Search for similar GraphQL patterns before flagging
- Generate fixes for missing fields
```

### Agent 4: Testing & Quality Review 🧪

Use the Task tool with:

- **description**: "Testing and quality review"
- **subagent_type**: "general-purpose"
- **model**: "opus"
- **prompt**:

```
You are the Testing & Quality Review Agent for MPDX code review.

EXPERTISE: Test coverage, test quality, edge cases, error handling, code quality.

MISSION: Review this PR for testing adequacy and code quality.

CONTEXT:
- Risk Score: [calculated score]/[max]
- Changed Files: [N]

INSTRUCTIONS:
1. Read diff and changed files
2. For each modified component/function, check if tests exist
3. Read test files to assess quality
4. Search for error handling patterns

CRITICAL FOCUS:
- Test coverage for new code
- Test quality and maintainability
- Edge case handling, error states
- Integration test needs
- Mock data usage (prefer shared mockData)
- Type safety (avoid `any` types)
- Code quality (unused imports, console.logs)
- Error boundaries and fallbacks

OUTPUT FORMAT:

## 🧪 Testing & Quality Agent Review

### Critical Testing Gaps (BLOCKING) - Severity: 10/10
- **File:Line** - Gap
  - Severity: 10/10
  - Missing: What's not tested
  - Risk: Why critical
  - Required: What tests to add

### Testing Concerns (IMPORTANT) - Severity: 6-9/10
- **File:Line** - Concern
  - Severity: [6-9]/10
  - Issue: Description
  - Recommendation: Improvement

### Code Quality Issues - Severity: varies
- Unused imports: [list with file:line]
- Console.logs: [list with file:line]
- Type safety issues (`any` types): [list]
- Other issues: [list]

### Testing Suggestions - Severity: 3-5/10
[Improvements]

### Coverage Assessment
- New code tested: Yes/Partial/No
- Edge cases covered: [list what's covered]
- Error handling tested: Yes/Partial/No
- Missing critical tests: [list]

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low

CODEBASE CONTEXT SEARCH:
Search for testing patterns:
1. Find similar component tests
2. Check how mocks are typically structured
3. Look for established test patterns
4. Reference good test examples

AUTOMATED FIX GENERATION:
Generate fixes for common testing issues:
- Unused imports (can be auto-removed)
- Console.logs in production code
- Missing test skeletons (generate basic structure)
- Type issues (add explicit types)

Categories: imports, tests, types, code-quality

GUIDELINES:
- Critical business logic MUST have tests
- Don't require tests for trivial UI-only changes
- Focus on edge cases and error paths
- Check test quality, not just existence
- Verify mocks are realistic
- Flag console.logs in non-test code
- Generate fixes for code quality issues
- Provide test skeleton templates
```

### Agent 5: UX Review 👤

Use the Task tool with:

- **description**: "UX and accessibility review"
- **subagent_type**: "general-purpose"
- **model**: "opus"
- **prompt**:

```
You are the User Experience Review Agent for MPDX code review.

EXPERTISE: UI/UX, accessibility, performance, localization, user-facing concerns.

MISSION: Review this PR for user experience and usability.

CONTEXT:
- Risk Score: [calculated score]/[max]
- Changed Files: [N]

INSTRUCTIONS:
1. Read diff and full changed files
2. Look for user-facing changes
3. Check for localization compliance
4. Review loading/error states

CRITICAL FOCUS:
- Component usability, intuitiveness
- Loading states (MUST show for async operations)
- Error messages (user-friendly, localized)
- Accessibility (ARIA, keyboard nav, screen readers)
- Performance (re-renders, heavy calculations, useMemo)
- Localization (ALL user-visible text uses `t()` function)
- Responsive design
- Form validation, error display
- Empty states, null handling

OUTPUT FORMAT:

## 👤 UX Agent Review

### Critical UX Issues (BLOCKING) - Severity: 10/10
- **File:Line** - Issue
  - Severity: 10/10
  - Problem: UX concern
  - User Impact: How affects users
  - Fix: Required action

### UX Concerns (IMPORTANT) - Severity: 6-9/10
- **File:Line** - Concern
  - Severity: [6-9]/10
  - Issue: Description
  - Recommendation: Improvement

### Accessibility Issues
- Missing ARIA labels: [list with file:line]
- Keyboard navigation: [issues]
- Screen reader support: [concerns]
- Color contrast: [issues]

### Localization Issues
- Hardcoded strings (not using t()): [list with file:line]
- Missing translation keys: [list]

### Performance Concerns
- Unnecessary re-renders: [list]
- Missing useMemo/useCallback: [list]
- Heavy calculations in render: [list]

### UX Suggestions - Severity: 3-5/10
[Improvements]

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low

CODEBASE CONTEXT SEARCH:
Search for UX patterns:
1. Find similar components for UX patterns
2. Check how loading states are typically shown
3. Look for localization patterns
4. Reference accessible components

AUTOMATED FIX GENERATION:
Generate fixes for UX issues:
- Missing localization (wrap in t())
- Hardcoded strings
- Missing ARIA labels
- Simple accessibility improvements

Category: localization, accessibility, ux

GUIDELINES:
- Put yourself in user's shoes
- Consider error scenarios
- ALL user-visible text MUST use t()
- Verify loading states exist for async
- Consider accessibility
- Think about mobile users
- Generate automated localization fixes
- Provide ARIA attribute additions
```

### Agent 6: Financial Accuracy Review 💰

Use the Task tool with:

- **description**: "Financial accuracy review"
- **subagent_type**: "general-purpose"
- **model**: "opus"
- **prompt**:

```
You are the Financial Accuracy Review Agent for MPDX code review.

EXPERTISE: Financial calculations, currency handling, donation tracking, pledge management, monetary accuracy.

MISSION: Review this PR for financial calculation accuracy and monetary data integrity.

CONTEXT:
- Risk Score: [calculated score]/[max]
- Changed Files: [N]

INSTRUCTIONS:
1. Read diff and full changed files
2. Search for financial-related terms: donation, pledge, gift, amount, currency, balance, total, payment
3. Look for arithmetic operations on monetary values
4. Check for currency conversion

CRITICAL FOCUS:
- Donation amount calculations
- Pledge tracking accuracy
- Gift processing
- Currency handling (USD, CAD, etc.)
- Rounding (financial rounding to 2 decimals)
- Sum/aggregate calculations
- Balance calculations
- Tax calculations
- Report totals
- Data type precision (use Decimal, not Float)

OUTPUT FORMAT:

## 💰 Financial Accuracy Agent Review

### Critical Financial Issues (BLOCKING) - Severity: 10/10
[These MUST be fixed - money errors are unacceptable]
- **File:Line** - Issue
  - Severity: 10/10
  - Problem: Financial calculation error
  - Impact: Incorrect donor data / financial reports
  - Fix: Required correction

### Financial Concerns (IMPORTANT) - Severity: 6-9/10
- **File:Line** - Concern
  - Severity: [6-9]/10
  - Issue: Potential accuracy problem
  - Recommendation: How to fix

### Financial Suggestions - Severity: 3-5/10
[Better financial handling practices]

### Financial Checklist
- Currency handling correct: Yes/No/N/A
- Rounding to 2 decimals: Yes/No/N/A
- Using appropriate numeric types: Yes/No/N/A
- Aggregations accurate: Yes/No/N/A
- Financial tests present: Yes/No/N/A

### Questions for Other Agents
- **To Data Integrity**: [questions about data flow]
- **To Testing**: [questions about financial test coverage]

### Confidence
- Overall: High/Medium/Low
- Calculations reviewed: [list what was checked]

CODEBASE CONTEXT SEARCH:
Search for financial patterns:
1. Find similar financial calculations
2. Check established rounding practices
3. Look for currency handling patterns
4. Reference correct implementations

AUTOMATED FIX GENERATION:
Generate fixes for financial issues:
- Incorrect rounding (fix to 2 decimals)
- Missing currency validation
- Type precision issues
- Calculation errors

Category: financial

GUIDELINES:
- Financial errors are CRITICAL - be thorough
- Even small rounding errors matter
- Check ALL arithmetic on money
- Verify currency is consistent
- Flag any uncertainty - better safe than sorry
- Consider tax implications
- Think about edge cases (negative amounts, zero, very large numbers)
- Search for similar calculations before flagging
- Generate fixes for rounding and precision issues

IMPORTANT: If you don't see any financial code, just note "No financial code in this PR" and skip to confidence section.
```

### Agent 7: MPDX Standards Compliance Review 📋

Use the Task tool with:

- **description**: "MPDX standards compliance"
- **subagent_type**: "general-purpose"
- **model**: "opus"
- **prompt**:

```
You are the MPDX Standards Compliance Review Agent.

EXPERTISE: MPDX-specific coding standards, patterns, and conventions from CLAUDE.md.

MISSION: Verify this PR follows MPDX project standards and conventions.

CONTEXT:
- Risk Score: [calculated score]/[max]
- Changed Files: [N]

INSTRUCTIONS:
1. Read CLAUDE.md thoroughly
2. Read diff and changed files
3. Check each standard against the code

MPDX STANDARDS CHECKLIST:

**File Naming:**
- [ ] Components use PascalCase (e.g., ContactDetails.tsx)
- [ ] Pages use kebab-case with .page.tsx
- [ ] Tests use same name as file + .test.tsx
- [ ] GraphQL files use PascalCase .graphql

**Exports:**
- [ ] Uses named exports (NO default exports)
- [ ] Component exports: `export const ComponentName: React.FC = () => {}`

**GraphQL:**
- [ ] All queries/mutations have `id` fields for cache normalization
- [ ] Operation names are descriptive (not starting with "Get" or "Load")
- [ ] `yarn gql` was run (check for .generated.ts files)
- [ ] Pagination handled for `nodes` fields

**Localization:**
- [ ] All user-visible text uses `t()` from useTranslation
- [ ] No hardcoded English strings

**Testing:**
- [ ] Uses GqlMockedProvider for GraphQL mocking
- [ ] Test describes what it tests clearly
- [ ] Proper async handling with findBy/waitFor

**Code Quality:**
- [ ] No console.logs (except in error handlers)
- [ ] No unused imports
- [ ] TypeScript types (no `any` unless justified)
- [ ] Proper error handling

**Package Management:**
- [ ] Uses yarn (not npm)

OUTPUT FORMAT:

## 📋 MPDX Standards Compliance Review

### Standards Violations (BLOCKING) - Severity: 8-10/10
[Clear violations of project standards]
- **File:Line** - Violation
  - Severity: [8-10]/10
  - Standard: What standard violated
  - Issue: What's wrong
  - Fix: How to fix

### Standards Concerns (IMPORTANT) - Severity: 5-7/10
- **File:Line** - Concern
  - Severity: [5-7]/10
  - Issue: Doesn't quite follow standards
  - Recommendation: How to align

### Standards Checklist Results
**File Naming**: ✅/⚠️/❌
**Exports**: ✅/⚠️/❌
**GraphQL**: ✅/⚠️/❌ (or N/A)
**Localization**: ✅/⚠️/❌
**Testing**: ✅/⚠️/❌
**Code Quality**: ✅/⚠️/❌
**Package Management**: ✅/⚠️/❌

### Pattern Deviations
[List any deviations from CLAUDE.md patterns]

### Suggestions for Better Alignment
[How to better follow MPDX patterns]

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low
- Standards knowledge: Complete/Partial

CODEBASE CONTEXT SEARCH:
Search for standard patterns:
1. Check how similar files are structured
2. Look for naming conventions
3. Find export patterns
4. Reference compliant examples

AUTOMATED FIX GENERATION:
Generate fixes for standards violations:
- Incorrect file naming
- Default exports (convert to named)
- Missing yarn usage
- Import/export inconsistencies

Category: standards

GUIDELINES:
- Reference specific sections of CLAUDE.md
- Distinguish between violations and preferences
- Be constructive, not pedantic
- Explain WHY standards matter
- Search codebase for patterns before flagging
- Generate fixes for simple standards violations
```

After launching selected agents, display:

```
✅ All [N] agents launched in parallel
⏳ Waiting for agents to complete their reviews...
💰 Estimated cost: $[X.XX]
```

---

## Stage 1B — Dependency Impact Analysis (Parallel)

While agents are running, analyze dependency impact in parallel:

```bash
echo "🔍 Analyzing dependency impact..."
echo ""

# For each changed TypeScript/TSX file, find dependents
while IFS= read -r changed_file; do
  # Skip non-code files
  [[ ! "$changed_file" =~ \.(ts|tsx|js|jsx)$ ]] && continue

  # Extract filename without extension
  filename=$(basename "$changed_file" | sed 's/\.[^.]*$//')

  # Search for imports of this file
  grep -r "from.*['\"].*$filename['\"]" src/ \
    --include="*.ts" --include="*.tsx" \
    2>/dev/null | cut -d: -f1 | sort -u > "/tmp/dependents_${filename}.txt"

  dependent_count=$(wc -l < "/tmp/dependents_${filename}.txt" 2>/dev/null || echo 0)

  if [ "$dependent_count" -gt 15 ]; then
    echo "🚨 CRITICAL IMPACT: $changed_file has $dependent_count dependents" | tee -a /tmp/dependency_impact.txt
  elif [ "$dependent_count" -gt 10 ]; then
    echo "⚠️  HIGH IMPACT: $changed_file has $dependent_count dependents" | tee -a /tmp/dependency_impact.txt
  elif [ "$dependent_count" -gt 5 ]; then
    echo "📊 MEDIUM IMPACT: $changed_file has $dependent_count dependents" | tee -a /tmp/dependency_impact.txt
  fi
done < /tmp/changed_files.txt

echo "" | tee -a /tmp/dependency_impact.txt

# Check for breaking changes (removed exports)
echo "Checking for breaking changes..." | tee -a /tmp/dependency_impact.txt
git diff $BASE_REF..$HEAD_REF 2>/dev/null | grep "^-export" | grep -v "^---" > /tmp/breaking_changes.txt 2>/dev/null || true

if [ -s /tmp/breaking_changes.txt ]; then
  echo "⚠️  BREAKING CHANGES DETECTED:" | tee -a /tmp/dependency_impact.txt
  cat /tmp/breaking_changes.txt | tee -a /tmp/dependency_impact.txt
fi

echo "✅ Dependency analysis complete"
echo ""
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
✅ 💰 Financial Agent - Found [X] critical, [Y] concerns
✅ 📋 Standards Agent - Found [X] violations, [Y] concerns
```

Parse each agent's output and extract:

- Critical issues with severity scores
- Important concerns with severity scores
- Suggestions
- Questions for other agents
- Confidence level

Store these in structured format for the debate rounds.

---

## Stage 2B — Extract & Organize Automated Fixes

Parse agent outputs for automated fixes:

```bash
echo "🔧 Extracting automated fixes from agent reports..."
echo ""

# Count fixes found
FIX_COUNT=$(find /tmp/automated_fixes -name "*.sh" 2>/dev/null | wc -l | tr -d ' ')

if [ "$FIX_COUNT" -gt 0 ]; then
  echo "Found $FIX_COUNT automated fixes"
  echo ""

  # Organize by category and confidence
  echo "By Category:" > /tmp/fix_summary.txt
  for category in localization types imports graphql tests security architecture data-integrity ux accessibility financial standards code-quality; do
    count=$(find /tmp/automated_fixes -name "*_${category}.sh" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -gt 0 ]; then
      echo "  • $category: $count fixes" | tee -a /tmp/fix_summary.txt
    fi
  done

  echo "" | tee -a /tmp/fix_summary.txt
  cat /tmp/fix_summary.txt

  # Create master apply script
  cat > /tmp/automated_fixes/apply_all.sh << 'EOF'
#!/bin/bash
echo "Applying all automated fixes..."
for fix in /tmp/automated_fixes/fix_*.sh; do
  if [ -f "$fix" ]; then
    echo "Applying: $(basename $fix)"
    bash "$fix"
  fi
done
echo "✅ All fixes applied"
echo "Review changes with: git diff"
echo "To undo: git checkout ."
EOF
  chmod +x /tmp/automated_fixes/apply_all.sh
else
  echo "No automated fixes available"
fi

echo ""
```

---

## Stage 3 — Cross-Examination Debate (Round 1)

Now facilitate the first debate round where agents challenge each other.

Display: "🗣️ Starting cross-examination debate round..."

For each of the 7 agents, launch a new Task with their original findings plus all other agents' findings.

### Debate Prompt Template

Use the Task tool for each agent with:

- **description**: "[Agent name] cross-examination"
- **subagent_type**: "general-purpose"
- **model**: "opus"
- **prompt**:

```
You are the [Agent Name] in the cross-examination debate phase.

YOUR ORIGINAL FINDINGS:
[Paste that agent's original review output with severity scores]

OTHER AGENTS' FINDINGS:
[All other agents' findings with severity scores]

MISSION: Review other agents' findings from your specialized perspective.

DEBATE ACTIONS (use severity scores to prioritize):
1. **CHALLENGE** - Disagree with a finding (max 3 challenges, focus on severity 7+)
   - Cite your reasoning with evidence
   - Suggest revised severity score
2. **SUPPORT** - Strongly agree and add context (for severity 8+)
3. **EXPAND** - Build on a finding with additional concerns
4. **QUESTION** - Ask for clarification

RULES:
- Maximum 3 challenges (focus on important disagreements)
- Provide specific reasoning and evidence
- Reference file:line when possible
- Suggest severity score adjustments (1-10)
- Be constructive, not combative

OUTPUT FORMAT:

## [Agent Name] - Cross-Examination

### Challenges
- **Challenge to [Agent X] re: [finding]**
  - Original severity: [X]/10
  - Why I disagree: [reasoning]
  - Evidence: [supporting evidence]
  - Revised severity: [Y]/10
  - Revised view: [your assessment]

### Strong Support
- **Support for [Agent X] re: [finding at severity [X]/10]**
  - Additional context: [your perspective]
  - Added concerns: [related issues]
  - Severity agreement: [X]/10 is correct

### Expansions
- **Building on [Agent X]'s [topic]**:
  - Additional severity: [+N] points
  - Reasoning: [why more severe]

### Questions
- **To [Agent X]**: [question]
  - Why asking: [reason]

### Summary
- Challenges: [N]
- Supports: [N]
- Key disagreements: [main contentions]
```

Launch all 7 debate agents in parallel.

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
- **model**: "opus"
- **prompt**:

```
You are the [Agent Name] responding to challenges from debate round 1.

YOUR ORIGINAL FINDINGS:
[Their original findings with severity scores]

CHALLENGES RAISED AGAINST YOU:
[List each challenge with severity score adjustments]

MISSION: Respond to each challenge, adjusting severity scores based on evidence.

RESPONSE OPTIONS:
1. **DEFEND** - Additional evidence supports your finding
   - Maintain original severity score
2. **CONCEDE** - Acknowledge challenge, downgrade/remove finding
   - Lower severity score or remove
3. **REVISE** - Update finding based on new perspective
   - Adjust severity score
4. **ESCALATE** - Flag as unresolved, needs human senior review
   - Mark for human decision

OUTPUT FORMAT:

## [Agent Name] - Rebuttals

### Response to Challenge #1 from [Agent]
- Original Severity: [X]/10
- Decision: DEFEND/CONCEDE/REVISE/ESCALATE
- Reasoning: [explanation]
- Final Severity: [Y]/10
- Updated Finding (if revised):
  - Severity: [Y]/10
  - Description: [updated]

### Response to Challenge #2
[Same format]

### Summary
- Defended: [N]
- Conceded: [N]
- Revised: [N]
- Escalated: [N]
- Average severity adjustment: [+/-X]
```

Launch rebuttal tasks for all challenged agents.

Display:

```
✅ Rebuttal round complete
📊 Synthesizing consensus...
```

---

## Stage 5 — Consensus Synthesis

Now analyze all findings, debates, and final severity scores to build consensus.

**Process:**

1. Collect all final findings with severity scores
2. Group by similarity (same file:line or same general issue)
3. Calculate average severity score for each finding
4. Count agent agreement

**Consensus Levels (using severity scores):**

- **Average 9-10, 4+ agents**: CRITICAL BLOCKER
- **Average 8-9, 3+ agents**: HIGH PRIORITY BLOCKER
- **Average 7-8, 3+ agents**: IMPORTANT (should fix before merge)
- **Average 5-7, 2+ agents**: MEDIUM PRIORITY
- **Average 3-5, 1-2 agents**: SUGGESTION
- **Unresolved Debate** (agents couldn't agree, severity differs by 4+): NEEDS HUMAN REVIEW

For each grouped finding, determine:

- Final severity: Average of all agent severity scores
- Classification: BLOCKING / IMPORTANT / SUGGESTION
- Which agents flagged it
- Debate summary
- Consensus strength

Display a summary:

```
📊 Consensus Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Critical Blockers (Severity 9-10): [N]
High Priority Blockers (Severity 8-9): [N]
Important Issues (Severity 7-8): [N]
Medium Priority (Severity 5-7): [N]
Suggestions (Severity 3-5): [N]
Unresolved Debates: [N]

Total Findings: [N]
Average Confidence: [High/Medium/Low]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stage 5B — Generate Historical Metrics Dashboard

Create quality dashboard to commit to PR:

```bash
echo "📊 Generating quality metrics dashboard..."

# Get PR info
PR_NUM=$(gh pr view --json number -q .number 2>/dev/null || echo "local")
CURRENT_DATE=$(date +%Y-%m-%d)
GITHUB_USER=$(git config user.name || echo "Developer")

# Calculate current severity (from consensus)
# This should be calculated from the actual consensus findings
CURRENT_SEVERITY="[X.X]"  # Replace with actual average severity

# Calculate averages from history
if [ -f .claude/review-metrics/severity_history.txt ]; then
  AVG_SEVERITY=$(awk '{sum+=$2; count++} END {printf "%.1f", sum/count}' .claude/review-metrics/severity_history.txt 2>/dev/null || echo "N/A")
  LAST_10=$(tail -10 .claude/review-metrics/severity_history.txt | awk '{print $2}')
else
  AVG_SEVERITY="N/A"
  LAST_10=""
fi

# Generate dashboard
cat > .claude/pr-metrics/PR_${PR_NUM}_metrics.md << EOF
# 📊 Code Quality Metrics Dashboard

**PR**: #${PR_NUM}
**Date**: ${CURRENT_DATE}
**Developer**: @${GITHUB_USER}
**Review Mode**: ${AGENT_MODE}

---

## 📈 Quality Trend

### Current PR
- **Quality Score**: ${CURRENT_SEVERITY}/10
- **Risk Level**: [from Stage 0]
- **Findings**: [N] blockers, [N] important, [N] suggestions

### Historical Comparison
- **Your Average**: ${AVG_SEVERITY}/10 (last 10 PRs)
- **Trend**: [↗️ Improving / → Stable / ↘️ Declining]

\`\`\`
Last 10 PRs:
${LAST_10}
\`\`\`

---

## 🔍 This Review

### Agents Used
- **Mode**: ${AGENT_MODE}
- **Agents**: [list selected agents]
- **Cost**: \$[X.XX]
- **Time**: [X] minutes

### Key Findings
1. [Top issue category] - [count] issues
2. [Second category] - [count] issues
3. [Third category] - [count] issues

### Automated Fixes Available
- **Total Fixes**: ${FIX_COUNT}
- **High Confidence**: [count]
- **Categories**: [list]

---

## 💡 Improvement Recommendations

Based on patterns in your recent PRs:
1. [Recommendation based on common issues]
2. [Recommendation based on trends]
3. [Recommendation for quality improvement]

---

## 📦 Dependency Impact

[Include high-impact changes from dependency analysis]

---

## 💰 Review ROI

- **AI Review Cost**: \$[X.XX]
- **Estimated Human Review Time**: 30-45 minutes
- **Estimated Human Review Cost**: ~\$150
- **Savings**: ~\$[Y]
- **Issues Caught Pre-Review**: [N]

---

_Generated by AI Code Review v3.0 | [Full Report](../tmp/agent_review_report.md)_
EOF

echo "✅ Metrics dashboard created: .claude/pr-metrics/PR_${PR_NUM}_metrics.md"
```

### Update Review History

```bash
# Append to history
echo "$PR_NUM $CURRENT_SEVERITY $CURRENT_DATE" >> .claude/review-metrics/severity_history.txt

# Save detailed review
cat > .claude/review-history/${CURRENT_DATE}_${PR_NUM}.json << EOF
{
  "date": "$CURRENT_DATE",
  "pr_number": "$PR_NUM",
  "severity": $CURRENT_SEVERITY,
  "mode": "$AGENT_MODE",
  "agents_used": ${#SELECTED_AGENTS[@]},
  "cost": "[actual cost]",
  "time_minutes": "[actual time]",
  "findings": {
    "critical": [N],
    "high": [N],
    "important": [N],
    "suggestions": [N]
  },
  "fixes_available": $FIX_COUNT
}
EOF

echo "✅ Review history updated"
echo ""
```

---

## Stage 6 — Generate Review Report

Create the comprehensive review report in markdown format:

```markdown
# 🤖 Multi-Agent Code Review Report

**Generated**: [timestamp]
**Agents**: 7 specialized reviewers with debate rounds
**💰 Review Cost**: $[X.XX] (Opus model)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📊 RISK ASSESSMENT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Risk Score**: [X]/[max] - [LOW/MEDIUM/HIGH/CRITICAL]
**Day**: [day of week]
**Files Changed**: [N] (+[X] -[Y] lines)

**Risk Level Meaning**:
- **LOW** (0-3): ✅ Entry-level or above can review
- **MEDIUM** (4-6): ✅ Entry-level or above can review
- **HIGH** (7-9): ⚠️ Experienced developer or above should review
- **CRITICAL** (10+): 🚨 Senior developer (Caleb Cox) must review

**Required Reviewer**: [Based on risk level]

**Risk Factors Detected**:
[List specific factors]

[IF FRIDAY/WEEKEND]
⚠️ **[DAY] DEPLOYMENT WARNING**
[Appropriate warning based on risk score]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔧 AUTOMATED FIXES AVAILABLE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**${FIX_COUNT} automated fixes available**

Review and apply these fixes to address common issues quickly.

[IF FIX_COUNT > 0, FOR EACH FIX:]

### Fix #N: [Title] ([Confidence] Confidence)

**File**: \`path/to/file:line\`
**Category**: [category]
**Estimated Time**: 30 seconds

<details>
<summary>📝 View Fix Details</summary>

**Issue**: [description]

**Current Code**:
\`\`\`typescript
[old code]
\`\`\`

**Fixed Code**:
\`\`\`typescript
[new code]
\`\`\`

**Apply This Fix**:
\`\`\`bash
bash /tmp/automated_fixes/fix_N_category.sh
\`\`\`

</details>

---

**To apply all fixes**:
\`\`\`bash
# Review all fixes first
ls -la /tmp/automated_fixes/

# Apply all (REVIEW FIRST!)
bash /tmp/automated_fixes/apply_all.sh

# Then review changes
git diff

# If good, commit
git add . && git commit -m "Apply AI-suggested fixes"

# To undo
git checkout .
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📦 DEPENDENCY IMPACT ANALYSIS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Include contents of /tmp/dependency_impact.txt]

### High-Impact Changes
Files with 10+ dependents - test thoroughly:

[List high-impact files with dependent counts]

### Breaking Changes
[List any removed exports or breaking changes from /tmp/breaking_changes.txt]

### Recommendations
- Review all dependents before merging
- Add integration tests for high-impact changes
- Update documentation for breaking changes
- Consider deprecation warnings for removed exports

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🚫 CRITICAL BLOCKERS (Severity 9-10)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Must be fixed before merge** (Average severity 9-10 from multiple agents)

[FOR EACH CRITICAL BLOCKER:]

### [Issue Title]

**Severity**: [X.X]/10 (Consensus from [N] agents)
**File**: `[file:line]`
**Flagged by**: [Agent 1 ([score]/10), Agent 2 ([score]/10), ...]

**Problem**:
[Detailed description from consensus]

**Agent Perspectives**:
- **[Agent 1]** (Severity: [X]/10): [Their specific concern]
- **[Agent 2]** (Severity: [X]/10): [Their specific concern]

**Debate Summary**:
- [Summary of any challenges and resolutions]
- Final consensus: CRITICAL BLOCKER (Average: [X.X]/10)

**Required Action**:
[Specific steps to fix]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔴 HIGH PRIORITY BLOCKERS (Severity 8-9)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Must be fixed before merge** (Average severity 8-9)

[FOR EACH HIGH PRIORITY BLOCKER - same format as above]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⚠️ IMPORTANT ISSUES (Severity 7-8)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Should be addressed before merge** (Average severity 7-8)

[FOR EACH IMPORTANT ISSUE - condensed format]

### [Issue Title]

**Severity**: [X.X]/10
**File**: `[file:line]`
**Flagged by**: [Agents]

**Issue**: [Description]
**Recommended Fix**: [How to address]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 💡 MEDIUM PRIORITY (Severity 5-7)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Consider addressing** (Average severity 5-7)

[Bulleted list of issues with file:line and brief description]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 💭 SUGGESTIONS (Severity 3-5)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Nice-to-have improvements** (Average severity 3-5)

[Grouped by category, bulleted list]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🤔 UNRESOLVED DEBATES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Requires senior developer judgment**

[FOR EACH UNRESOLVED DEBATE:]

### [Debate Topic]

**Context**: [What the debate is about]
**Severity Range**: [Low]-[High]/10 (agents disagree by [X] points)

**Positions**:

**[Agent 1]** argues (Severity: [X]/10):
[Their position with reasoning]

**[Agent 2]** counters (Severity: [Y]/10):
[Their counter-position]

**Other agents**:
- [Agent 3]: [Position] (Severity: [Z]/10)
- [Agent 4]: [Position] (Severity: [W]/10)

**Why needs human review**:
[Explanation of why agents couldn't reach consensus]

**Recommendation**:
Senior developer (Caleb Cox) should decide based on [considerations]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📝 REVIEW SUMMARY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Agent                    | Critical | High | Important | Suggestions | Confidence |
| ------------------------ | -------- | ---- | --------- | ----------- | ---------- |
| 🔒 Security              | [N]      | [N]  | [N]       | [N]         | [H/M/L]    |
| 🏗️ Architecture          | [N]      | [N]  | [N]       | [N]         | [H/M/L]    |
| 💾 Data Integrity        | [N]      | [N]  | [N]       | [N]         | [H/M/L]    |
| 🧪 Testing               | [N]      | [N]  | [N]       | [N]         | [H/M/L]    |
| 👤 UX                    | [N]      | [N]  | [N]       | [N]         | [H/M/L]    |
| 💰 Financial             | [N]      | [N]  | [N]       | [N]         | [H/M/L]    |
| 📋 Standards Compliance  | [N]      | [N]  | [N]       | [N]         | [H/M/L]    |
| **Total**                | **[N]**  | **[N]** | **[N]** | **[N]**     | -          |

**Debate Statistics**:
- Total challenges raised: [N]
- Challenges defended: [N]
- Challenges conceded: [N]
- Findings revised: [N]
- Severity adjustments: [+/-X] average
- Escalated to human: [N]

**Review Quality**:
- Average agent confidence: [High/Medium/Low]
- Consensus rate: [X]%
- Debate rounds: 2
- Total review time: [X] minutes

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 RECOMMENDED NEXT STEPS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Critical Actions** (MUST fix before merge):
[FOR EACH CRITICAL/HIGH PRIORITY BLOCKER:]
- [ ] Fix [issue] at [file:line] (Severity: [X]/10)

**Important Actions** (Should fix before merge):
[FOR EACH IMPORTANT ISSUE:]
- [ ] Address [concern] at [file:line] (Severity: [X]/10)

**Human Review Needed**:
[FOR EACH UNRESOLVED DEBATE:]
- [ ] Senior developer to resolve: [debate topic] (Severity range: [X]-[Y]/10)

**Medium Priority** (Consider addressing):
- [List with severity scores]

**Optional Improvements**:
[FOR EACH SUGGESTION:]
- Consider [suggestion] (Severity: [X]/10)

---

💰 **Review Cost**: $[X.XX] | ⏱️ **Review Time**: [X] minutes | 🤖 **Agents**: 7 (Opus)

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

## 💰 Financial Accuracy Agent - Complete Report
[Full original report]

## 📋 MPDX Standards Agent - Complete Report
[Full original report]

</details>

---

<details>
<summary>🗣️ Debate Transcript (click to expand)</summary>

## Round 1: Cross-Examination
[Full debate round 1 transcripts]

## Round 2: Rebuttals
[Full rebuttal transcripts]

</details>

---

_🤖 Generated by MPDX Multi-Agent Review System v2.0_
_Review time: [X] minutes | Cost: $[X.XX] | Agents: Security, Architecture, Data, Testing, UX, Financial, Standards_
```

Save this to `/tmp/agent_review_report.md`

---

## Stage 7 — Commit Metrics & Interactive Actions

### Commit Metrics Dashboard

```bash
if [ -f .claude/pr-metrics/PR_${PR_NUM}_metrics.md ]; then
  echo "📊 Committing quality metrics dashboard..."

  git add .claude/pr-metrics/PR_${PR_NUM}_metrics.md
  git add .claude/review-metrics/severity_history.txt
  git add .claude/review-history/${CURRENT_DATE}_${PR_NUM}.json

  git commit -m "Add AI code review metrics dashboard

📊 Quality Score: ${CURRENT_SEVERITY}/10
🤖 Agents Used: ${#SELECTED_AGENTS[@]} of 7
💰 Review Cost: \$[X.XX]
⏱️  Review Time: [X] minutes
🔧 Fixes Available: ${FIX_COUNT}

Generated by AI Code Review v3.0" || echo "Nothing to commit"

  git push || echo "Failed to push, push manually later"

  echo "✅ Metrics dashboard committed and pushed"
else
  echo "⚠️  No metrics dashboard to commit"
fi
```

### Interactive Menu

Ask the user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ REVIEW COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found:
• [N] CRITICAL BLOCKERS (severity 9-10)
• [N] HIGH PRIORITY BLOCKERS (severity 8-9)
• [N] IMPORTANT issues (severity 7-8)
• [N] MEDIUM priority (severity 5-7)
• [N] Suggestions (severity 3-5)
• [N] Unresolved debates (needs senior review)

💰 Review Cost: $[X.XX]
⏱️ Review Time: [X] minutes
🔧 Automated Fixes: ${FIX_COUNT} available

Risk Level: [LOW/MEDIUM/HIGH/CRITICAL]
Required Reviewer: [Level based on risk]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What would you like to do?

1. 📊 View metrics dashboard
2. 📝 Post review to GitHub
3. 🔧 Apply automated fixes (review first!)
4. 📦 View dependency impact
5. 💾 Save report locally only
6. ❌ Exit

Please respond: 1, 2, 3, 4, 5, or 6
```

Handle user's choice:

```bash
case "$choice" in
  1)
    cat .claude/pr-metrics/PR_${PR_NUM}_metrics.md | less
    ;;
  2)
    echo "Posting review to GitHub..."
    gh pr comment $PR_NUM --body-file /tmp/agent_review_report.md
    echo "✅ Review posted"
    ;;
  3)
    echo ""
    echo "🔧 Automated Fixes Available: $FIX_COUNT"
    echo ""
    if [ "$FIX_COUNT" -gt 0 ]; then
      cat /tmp/fix_summary.txt
      echo ""
      read -p "Apply all fixes? (y/n) " apply_choice
      if [ "$apply_choice" = "y" ]; then
        bash /tmp/automated_fixes/apply_all.sh
        echo ""
        echo "Review changes:"
        git diff --stat
        echo ""
        echo "To see full diff: git diff"
        echo "To commit: git add . && git commit -m 'Apply AI fixes'"
        echo "To undo: git checkout ."
      fi
    else
      echo "No automated fixes available"
    fi
    ;;
  4)
    cat /tmp/dependency_impact.txt | less
    ;;
  5)
    echo "Report saved to: /tmp/agent_review_report.md"
    echo "Metrics saved to: .claude/pr-metrics/PR_${PR_NUM}_metrics.md"
    ;;
  *)
    echo "Exiting..."
    ;;
esac
```

---

## Stage 8 — Final Summary

Display comprehensive summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 AI CODE REVIEW COMPLETE v3.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Review Mode**: ${AGENT_MODE}
**Agents Used**: ${#SELECTED_AGENTS[@]} of 7
**Model**: [Haiku/Sonnet/Opus mix based on mode]
**Review Time**: [X] minutes
**💰 Cost**: $[X.XX]

**Quality Metrics**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quality Score: ${CURRENT_SEVERITY}/10
Your Average: ${AVG_SEVERITY}/10
Trend: [↗️/→/↘️]

**Findings**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 [N] Critical Blockers
🔴 [N] High Priority Issues
⚠️  [N] Important Issues
💡 [N] Suggestions

**Automated Fixes**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 ${FIX_COUNT} fixes available
   • High confidence: [N]
   • Medium confidence: [N]
   Apply with option 3 in menu

**Dependency Impact**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 [N] high-impact changes
⚠️  [N] potential breaking changes

**Saved**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 $${SAVED_COST} with smart agent selection
⏱️  ~30-45 min of human review time
📊 Metrics committed to PR

**Next Steps**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Review quality dashboard (.claude/pr-metrics/)
2. Address [N] critical/high priority issues
3. Consider applying ${FIX_COUNT} automated fixes
4. Review [N] high-impact dependency changes
5. Post review to GitHub when ready

Thank you for using AI Code Review v3.0! 🤖
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Notes

**New in v3.0 (Phase 1 & 2)**:

1. ✅ **Smart Agent Selection**: Analyzes PR to determine which agents are needed (saves $1-3)
2. ✅ **Progressive Review Modes**: Quick ($0.50), Standard ($2-4), Deep ($6-10)
3. ✅ **Automated Fix Generation**: Agents generate bash scripts to auto-fix common issues
4. ✅ **Codebase Context Search**: Agents search before flagging to reduce false positives
5. ✅ **Dependency Impact Analysis**: Tracks high-impact files and breaking changes
6. ✅ **Historical Metrics Dashboard**: Quality trends committed to each PR
7. ✅ **Interactive Menu**: View metrics, apply fixes, post review, check dependencies

**Improvements from v2.0**:

1. ✅ **More Context**: Agents now read full files, not just diffs
2. ✅ **Domain-Specific Agents**: Added Financial Accuracy and MPDX Standards agents
3. ✅ **Improved Risk Scoring**: Four-level system (LOW/MEDIUM/HIGH/CRITICAL)
4. ✅ **Better Consensus**: Numeric severity scores (1-10) for precise consensus
5. ✅ **MPDX-Specific Checks**: Dedicated agent for CLAUDE.md standards
6. ✅ **Cost Transparency**: Shows estimated and actual costs throughout

**Performance by Mode**:

**Quick Mode**:
- Time: ~2 minutes
- Agents: 3 (Testing, UX, Standards)
- Model: Haiku
- Cost: ~$0.50
- Use for: Minor UI tweaks, documentation

**Standard Mode** (Recommended):
- Time: ~5 minutes
- Agents: 3-6 (smart selection)
- Model: Sonnet/Opus
- Cost: ~$2-4
- Use for: Normal feature development

**Deep Mode**:
- Time: ~10 minutes
- Agents: All 7
- Model: Opus
- Cost: ~$6-10
- Use for: Critical security/financial changes

**Cost Savings**:
- Smart agent selection: $1-3 per review (20-40% reduction)
- Monthly savings (20 PRs): $20-60
- Time saved per review: 30-45 minutes of human time

**Model Configuration**:
- Quick: Haiku for all agents
- Standard: Smart mix (Sonnet/Opus based on agent)
- Deep: Opus for all agents (maximum quality)

**Risk Levels**:
- **LOW** (0-3): Entry-level+ can review
- **MEDIUM** (4-6): Entry-level+ can review
- **HIGH** (7-9): Experienced developer+ should review
- **CRITICAL** (10+): Senior developer (Caleb Cox) must review

**Phase 3 Features** (Not Yet Implemented):
- AI Learning from Past Reviews
- Team Knowledge Base Integration

---

_Multi-Agent Code Review System v3.0_
_Phase 1 & 2 Complete | Phase 3 Deferred_
