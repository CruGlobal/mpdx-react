---
name: pr
description: Push and open the PR, get CI green with the full suite, run agent-review if the repo has it, and stop only when everything the agent can do is done. Remove the answer keys before the review; after approval, merge and close the ticket.
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
   one with gh pr create --draft --label "Preview Environment", so CI runs
   once and the developer gets a preview link to walk the feature. The PR's CI
   runs the full suite (see CLAUDE.md).
   Once pr-guard has run, read the tier label (gh pr view --json labels). If it
   is one-way-door and the spec said "Risky: no", tell the developer: the PR is
   a one-way door after all.
7. Watch CI. If a check fails, read its log (gh run view <run-id> --log-failed)
   and decide whether this change caused it: run that test alone, and check
   whether it also fails on the base branch. Fix, push and check again. Tell the
   developer what failed and why.
8. Delete the answer-key folder in its own commit, along with anything that
   existed only for it, and push. Do this before the review: any push after the
   bot approves takes its approval back. Write down the SHA of the commit just
   before the deletion: <last answer-key commit>. For risky work, use the tip
   of answer-key/<KEY> instead.
9. If the repo has agent-review set up (it has .claude/review/config.yml), run
   /agent-review:yolo-review. It reviews the PR, fixes every blocker itself,
   re-reviews and waits for the bot's approval. It needs a clean working tree.
   If it pushed fixes, check CI is green again, and run the answer keys
   locally once more against those fixes: git checkout <last answer-key
   commit> -- <answer-key folder> plus any helpers step 8 deleted, run them,
   then git rm -r --cached those paths and delete them again. Never commit them
   back.
10. Now stop. This is the first time the developer is needed since the spec.
    Give them the PR link, the scenarios and preview links to try,
    agent-review's result ("Approved", "ready for a human", or the blockers it
    could not fix), the PR's tier label, and anything left open. When they say
    it works, run gh pr ready and request review. A one-way-door PR also needs
    a person from .github/CODEOWNERS to approve: request one.
    Merge only when GitHub allows it, never with an admin override. Use
    gh pr merge --auto --squash for a two-way door. For a one-way door, wait
    until a code owner has approved before you merge: main may not enforce it.
    After any push, read the tier label again. If it is now one-way-door, run
    gh pr merge --disable-auto and wait for a code owner. If a reviewer asks
    for changes, push the fixes, run step 9 of this skill again, and ask the
    code owner to look again.
11. Once the PR has actually merged, watch the base branch's CI on the merge
    commit. If this change broke it,
    revert first, then fix forward.
12. Check the ticket moved to Done, and add a short comment: what shipped and
    the PR link. Return the PR URL.
