# Contributing to academic-practice-agents

These agent specifications are personal, experimental, and designed to evolve through use. Contributions are welcome.

---

## Workflow

1. **Fork → branch → PR.** Fork this repository, create a branch named `role/short-description` (e.g., `role/grant-reviewer`), and open a pull request against `main`.
2. **One spec per PR.** Keep PRs focused — one new role or one set of changes to an existing spec at a time.
3. **Reference an issue.** Link your PR to a `new-role` or `improve-role` issue so the motivation is documented.

---

## Proposing a new role

Use the [new-role issue template](.github/ISSUE_TEMPLATE/new-role.yml) to start the conversation before opening a PR. Describe:

- The academic role and what job the agent is helping with.
- Why this role is distinct from any existing spec in the repository.
- A draft three-layer breakdown (knowledge anchor, standing instructions, prompt intent).

---

## Improving an existing spec

Use the [improve-role issue template](.github/ISSUE_TEMPLATE/improve-role.yml). Quote the specific section being changed and explain the motivation. The iteration log in the spec must be updated with the date and reason.

---

## Quality bar

Every PR must:

- Follow the structure in [TEMPLATE.md](TEMPLATE.md).
- Make all three layers explicit and clearly separated:
  - **Knowledge anchor** — what documents ground the agent
  - **Standing instructions** — persistent rules for tone, format, guardrails
  - **Prompt intent** — at least one concrete example with named deliverable and audience
- Include at least one honest failure mode in "Where it fails."
- Keep the iteration log up to date.
- Contain no proprietary content — describe document *types* and *patterns*, not verbatim content from proposals, student work, or unpublished manuscripts.

---

## Tone

These are living documents, not polished publications. Write in plain language, first person, and be honest about limitations. If you have not observed a failure mode, you have not used the agent enough to contribute the spec.

---

## Review checklist

When reviewing a PR that adds or modifies a spec:

- [ ] File is in the correct role folder.
- [ ] Follows TEMPLATE.md structure.
- [ ] Knowledge anchor section lists concrete document types (not vague references).
- [ ] Standing instructions include audience, tone, format, and at least one guardrail.
- [ ] Prompt intent section includes at least one worked example with deliverable and audience named.
- [ ] "Where it fails" section is present and honest.
- [ ] Iteration log has an entry for this change.
- [ ] No proprietary content (proposals, student data, unpublished manuscripts) is included verbatim.
- [ ] Language is plain, first person, and consistent with the repo's tone.

---

## Channels

| Purpose | Where |
|---|---|
| Design questions, use-case discussion, failure-mode sharing | [GitHub Discussions](../../discussions) |
| New role proposals, bug reports, spec revisions | [GitHub Issues](../../issues) |
