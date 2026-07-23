## Related issue

Closes or advances: <!-- #issue-number -->

## Delivery identity

- Exact base SHA: <!-- 40-character SHA -->
- Current PR head SHA: <!-- 40-character SHA -->
- Themis reviewed SHA: <!-- 40-character SHA or pending -->
- CI run: <!-- URL or run ID -->
- CI SHA: <!-- 40-character SHA or pending -->
- Review timestamp (UTC): <!-- YYYY-MM-DDTHH:MM:SSZ or pending -->

> Any push, rebase, or amend changes the current PR head and invalidates prior exact-head CI and Themis review. Refresh both before technical acceptance.

## Summary

- TODO
- TODO

## Changed files

- TODO

## Acceptance criteria

- [ ] Issue acceptance criteria are satisfied or explicitly marked as partial.
- [ ] Scope stayed inside the issue/task boundaries.

## Verification

Paste real command output or link to CI logs.

```text
./scripts/maelk-harness-check.sh

```

```text
git diff --check

```

Additional checks, browser smoke, screenshots, or logs when relevant:

- TODO

## Browser/runtime evidence

- Runtime/user path: <!-- path/scenario or N/A with reason -->
- Observable result and invariants: <!-- result -->
- Evidence: <!-- screenshot/log/console/response link or N/A -->

## Risk and rollback

- Risk class and reason: <!-- Green/Yellow/Red -->
- Side effects: <!-- local/external/none -->
- Rollback: <!-- concrete reversal path -->

## Approval state

These are separate gates; technical acceptance or Themis Pass does not authorize merge, release, or deploy.

- [ ] Technical acceptance recorded by ANANKE for the current PR head.
- [ ] **Mads explicitly approves merge of the current PR head.**
- [ ] Release/deploy approval recorded by an authorized human, or marked not applicable.

## Safety checklist

- [ ] No secrets, credentials, tokens, or `.env` values were added or printed.
- [ ] No unapproved DNS, hosting, deployment, payment, branch-protection, repository/security, or external account settings were changed.
- [ ] No production data or live integration writes were introduced.
- [ ] No pricing, compliance, go-live, merge, or release decision is automated without human approval.
- [ ] No shop-floor/manufacturing execution scope was added.
- [ ] Retired repo-root GitHub Pages files were not reintroduced.

## Reviewer notes

- TODO
