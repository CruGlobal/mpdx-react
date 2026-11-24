## Links

- Work item: <!-- Flightdeck or Jira link (required) -->
- Spec: <!-- link to the spec, if there is one -->

## Description

Please give a bullet-point summary of the changes.
List any PRs that this PR depends on.

## Testing

<!--
Please tell the reviewer how to test your changes. What steps should they take to prove that the code fixed the bug or to see the new feature added?

Example:
- Go to the dashboard
- Click on the search icon
- Check that the search box appears
-->

- Go to ...
- Do ...
- Check that ...

## AI review

Findings I did not fix, and why:

## Checklist:

- [ ] My PR title is the work item key, then a summary of 80 characters or less (example: `MPDX-1234 Add sortable columns`)
- [ ] I have applied the appropriate labels (_Add the label "Preview Environment" to automatically create a preview environment_)
- [ ] I have run the Claude Code `/agent-review:review` command locally and fixed each finding or listed it above
- [ ] The `github-actions` bot has approved the PR (it approves once `/agent-review:review` leaves no open blockers; it never approves a one-way door)
- [ ] I have asked a person to review, if this is a one-way door (it touches a path `.github/CODEOWNERS` gives an owner)
- [ ] I have tested my changes in preview or in staging
- [ ] I have cleaned up my commit history
