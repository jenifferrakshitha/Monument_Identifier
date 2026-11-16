# Branching and collaboration workflow

## Branches

- `main` is the default branch and always contains reviewed, releasable work. Do not push directly to it; changes arrive through pull requests.
- Create short-lived branches from an up-to-date `main`: `feature/<issue>-<summary>`, `fix/<issue>-<summary>`, or `docs/<summary>`. Delete merged branches.
- Keep commits focused and use Conventional Commit prefixes, for example `feat: add monument image lookup` or `docs: describe branching workflow`.

## Team of three

For each pull request, one developer authors the change, a second developer reviews it, and the third coordinates integration and checks the build. Rotate these roles so every developer reviews and integrates work. The author cannot approve their own pull request.

## Pull request and merge rules

1. Update the branch from `main`, run the relevant checks, and open a pull request with a summary and test results.
2. Require at least one approval from another teammate, resolved review comments, and passing checks before merging.
3. Use a merge commit to retain the feature branch in history. Delete the feature branch after merge. Tag releases from `main` when needed.

## Conflict-resolution demonstration

The feature branch and `main` independently added `CONFLICT_DEMO.txt` with competing changes. The add/add conflict was resolved by combining both concerns in the final line below.

Resolved line: Identify monuments from uploaded images; require peer review before release.

## Useful commands

```bash
git switch main
git pull --ff-only
git switch -c feature/42-monument-image-lookup
# Make focused changes and commit them with meaningful messages.
git fetch origin
git merge origin/main
# Resolve any conflicts, run checks, then commit the resolution.
git push -u origin feature/42-monument-image-lookup
# Open a pull request targeting main.
git log --graph --oneline --decorate --all
```
