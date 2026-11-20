---
name: answer-key
description: Write answer-key tests from the spec, before any code exists. Run after /spec.
argument-hint: '[path-to-spec]'
disable-model-invocation: true
---

Write answer-key tests for the spec at $ARGUMENTS.

If the spec says "Risky: yes" and this session wrote the spec or saw the code
discussion, stop. Tell the developer to start a fresh session and run this skill
there. A fresh session goes on: it commits the tests on a new branch
answer-key/<KEY>, then switches back to the ticket branch, so the builder never
sees them.

1. Read the ticket and the spec. Do not plan the build yet.
2. Write tests that prove the spec has been implemented. Do not implement
   anything. Write at least one test per acceptance criterion. If the spec
   names a feature flag, test with the flag on and off.
3. Test what the user sees and what the system does, not how it is built:
   - no class, method or helper names, unless the spec fixes them
   - for layout, test the spec's rules, not exact pixel positions
4. Put them in their own folder named for the ticket, where the test runner
   finds it, for example src/answer-key/<KEY>/. Check the folder and file names
   don't trip the repo's own checks (linters, scanners, tests that search file
   names or contents).
5. Run them. They must fail because the feature is missing, not because of
   a typo or a bad import. Import only modules that exist today: test a new
   module through the existing page or component that will use it, so the
   typecheck and ESLint still pass. Do not push until /pr: pre-push runs the
   tests next to changed files.
6. Commit them. Then read .claude/skills/implement/SKILL.md and follow it for
   this spec, without stopping. (Risky change: stop here instead, and tell the
   developer to run /implement in their main session.)

Do not write a plan or app code.
