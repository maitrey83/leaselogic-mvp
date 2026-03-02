Create a pull request from the current branch.

## Steps

1. Run `git log --oneline main..HEAD` to see all commits on this branch
2. Run `git diff main...HEAD --stat` to see files changed
3. Check if the branch is pushed: `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
4. If not pushed, push with: `git push -u origin $(git branch --show-current)`
5. Draft PR title and body:
   - Title: under 70 chars, describes the feature/fix
   - Body format:

```
## Summary
- [1-3 bullet points of what this PR does]

## Changes
- [list of key files changed and why]

## Test plan
- [ ] Backend integration tests pass (52/52)
- [ ] [feature-specific manual test steps]
- [ ] Production smoke test after deploy

## Notes
- [any deployment steps, env var changes, migration needs]
```

6. Confirm with user before running `gh pr create`

## Rules
- Never create PRs with secrets in the description
- Always include test plan
- Tag breaking changes clearly
