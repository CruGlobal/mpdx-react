---
name: pr
description: Push and open the PR, get CI green with the full suite, run agent-review if the repo has it, and stop only when everything the agent can do is done. After approval, remove the answer keys, merge and close the ticket.
disable-model-invocation: true
---

1. Rebase on the latest base branch once, right before the final test run. If
   anything changed, run step 9 of /implement again.
2. Find the base branch. Read git log <base>..HEAD and git diff <base>...HEAD.
3. Get the ticket key from the branch name (/spec puts the work on a branch
   named for the key). Find the spec in
   docs/superpowers/specs/ and the plan in docs/superpowers/plans/.
4. Title: "<KEY> <what changed>", plain words, 80 characters or less.
5. Fill every section of .github/PULL_REQUEST_TEMPLATE.md. Link the spec and
   the plan. List the review's nits and anything left open. Say only what the
   diff and the spec show.
6. Push. If the branch has an open PR, update its title and body. If not, open
   one with gh pr create --draft. Make sure the PR's CI runs the full suite
   (see CLAUDE.md).
7. Watch CI. If a check fails, read its log (gh run view <run-id> --log-failed)
   and decide whether this change caused it: run that test alone, and check
   whether it also fails on the base branch. Fix, push and check again. Tell the
   developer what failed and why.
8. Delete the answer-key folder in its own commit, along with anything that
   existed only for it, and push. Do this before the review: any push after the
   bot approves takes its approval back.
9. If the repo has agent-review set up (it has .claude/review/config.yml), run
   /agent-review:yolo-review. It reviews the PR, fixes every blocker itself,
   re-reviews and waits for the bot's approval. It needs a clean working tree.
   If it pushed fixes, check CI is green again.
10. Now stop. This is the first time the developer is needed since the spec.
    Give them the PR link, the scenarios and links to try on staging,
    agent-review's result ("Approved", "ready for a human", or the blockers it
    could not fix), the PR's tier label, and anything left open. When they say
    it works, run gh pr ready and request review. A one-way-door PR also needs
    a person from .github/CODEOWNERS to approve: request one.
    Merge only when GitHub allows it (gh pr merge --auto --squash), never with
    an admin override. Do not push again after approval.
11. Watch the base branch's CI on the merge commit. If this change broke it,
    revert first, then fix forward.
12. Check the ticket moved to Done, and add a short comment: what shipped and
    the PR link. Return the PR URL.
