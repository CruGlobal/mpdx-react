---
description: Interactive rebase helper - rebase current branch onto a target (usage: /rebase-branch [target] [old-parent])
---

You are helping the user rebase their current feature branch.

## Command Usage

- `/rebase-branch` - Interactive mode, detect everything
- `/rebase-branch master` - Rebase onto master, auto-detect old parent
- `/rebase-branch master parent-branch` - Explicit: rebase onto master, excluding parent-branch commits

## Your Task

### Step 1: Parse Arguments and Detect Context

**If no arguments provided:**
- Ask user what they want to rebase onto (default: master)
- Try to detect the old parent branch

**If target provided (arg 1):**
- Target branch = arg 1 (e.g., "master", "staging")
- Auto-detect old parent if not provided

**If both target and old-parent provided:**
- Target = arg 1
- Old parent = arg 2

### Step 2: Validate Current State

Check:
- Current branch name (must not be master/main/staging/develop)
- Working directory is clean (`git status`)
- Target branch exists
- Old parent branch exists (if specified)

If working directory is dirty:
- Show status
- Ask if user wants to stash changes or abort

### Step 3: Show Preview

Display:
```
Current branch: <branch-name>
Target branch: <target-branch>
Old parent: <old-parent-branch> (or "none - simple rebase")

Commits to keep (unique to your branch):
<list commits with git log --oneline>

Commits that will be excluded (already in target):
<list commits from old parent if applicable>
```

Ask for confirmation to proceed.

### Step 4: Create Safety Backup

```bash
git branch backup-<current-branch>-<timestamp>
```

Tell user: "Created backup branch: backup-<name> (you can delete this later)"

### Step 5: Update Target Branch

```bash
git fetch origin <target-branch>:<target-branch>
```

### Step 6: Execute Rebase

**If old-parent specified:**
```bash
git rebase --onto <target> <old-parent> <current-branch>
```

**If no old-parent (simple rebase):**
```bash
git rebase <target>
```

### Step 7: Handle Conflicts

If conflicts occur:
- Show the conflicting files
- Provide guidance:
  ```
  To resolve:
  1. Edit conflicting files
  2. git add <resolved-files>
  3. git rebase --continue

  To abort:
  git rebase --abort
  git checkout backup-<branch-name>
  ```

### Step 8: Verify Result

After successful rebase:
```bash
# Show resulting commits
git log --oneline <current-branch> --not <target>

# Show branch divergence
git status
```

### Step 9: Offer to Push

Ask user:
```
Rebase successful! Would you like to:
1. Force push to remote (git push --force-with-lease)
2. Just show the push command
3. Do nothing (you can push later)
```

If user chooses 1:
```bash
git push --force-with-lease origin <current-branch>
```

If push fails due to remote changes, explain and suggest reviewing remote changes first.

### Step 10: Cleanup

Offer to delete backup branch:
```
Delete backup branch 'backup-<name>'? (You can always recover from reflog if needed)
```

If yes: `git branch -D backup-<name>`

## Detection Logic for Old Parent

To auto-detect old parent branch:

```bash
# Get the tracking branch
git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null

# Find merge-base with common branches
git merge-base HEAD master
git merge-base HEAD staging
git merge-base HEAD develop

# Show commit count divergence
git rev-list --count HEAD..master
git rev-list --count master..HEAD
```

Look for branch that:
- Has some (but not all) of the current branch's commits
- Is not the target branch
- Makes sense as a parent

If ambiguous, ask user.

## Safety Warnings

Before proceeding, warn if:
- ⚠️  Branch has upstream tracking with different name (might be shared)
- ⚠️  More than 20 commits to rebase (could be complex)
- ⚠️  No backup branch could be created
- ⚠️  Working directory is dirty

## Example Outputs

### Example 1: Simple rebase
```
$ /rebase-branch master

Analyzing current branch 'feature-xyz'...
Target: master
Old parent: (none - simple rebase)

Commits to rebase (3):
abc123 Fix typo
def456 Add feature
ghi789 Update tests

✓ Working directory is clean
✓ Created backup: backup-feature-xyz-20250121

Proceed with rebase? [y/n]
```

### Example 2: Rebase with parent exclusion
```
$ /rebase-branch master old-feature-branch

Analyzing current branch 'new-feature'...
Target: master
Old parent: old-feature-branch (commits from this will be excluded)

Commits to keep (2 unique to new-feature):
abc123 Add new feature
def456 Update tests

Commits to exclude (5 from old-feature-branch, already in master):
111111 Old change 1
222222 Old change 2
... (3 more)

✓ Working directory is clean
✓ Created backup: backup-new-feature-20250121

Proceed with rebase? [y/n]
```

### Example 3: Interactive mode
```
$ /rebase-branch

Current branch: feature-abc
Where do you want to rebase onto? [master]:  ← (user can press enter for default)

Checking for parent branch...
Found potential parent: old-feature (10 shared commits)

Is 'old-feature' the parent branch you want to exclude? [y/n/other]:
```

## Edge Cases

1. **If already up to date:**
   - Inform user no rebase needed
   - Show they're already based on target

2. **If fast-forward possible:**
   - Suggest `git merge --ff-only` instead

3. **If target doesn't exist locally:**
   - Fetch it: `git fetch origin <target>:<target>`

4. **If conflicts are too complex:**
   - Suggest `git rebase --abort`
   - Offer to help resolve conflicts one by one
   - Consider `git rebase -i` for complex cases

## Final Summary

After completion, show:
```
✅ Rebase complete!

Summary:
- Rebased 'feature-branch' onto 'master'
- 3 commits rebased successfully
- Backup available: backup-feature-branch-20250121
- Branch is ready for PR to master

Next steps:
1. Review changes: git log --oneline master..HEAD
2. Push to remote: git push --force-with-lease origin feature-branch
3. Create PR: feature-branch → master
```
