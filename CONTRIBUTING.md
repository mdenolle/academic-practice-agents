# Contributing to academic-practice-agents

This repository is a **curated, version-tracked** set of agent skills for academic
work — not a catalogue of prompts. The goal is a small number of skills we can
**improve and evaluate over time**, so contributions are held to that bar:
versioned, provenance-aware, and (increasingly) backed by evaluation cases.

Contributions are welcome, and the most valuable ones right now are **evaluation
cases** and **adopting the versioning convention** for skills that lack it — not
only new roles.

---

## Ways to contribute

| You want to… | Do this |
|---|---|
| **Propose a new role/skill** | Open a [new-role issue](.github/ISSUE_TEMPLATE/new-role.yml) first, then a PR following [TEMPLATE.md](TEMPLATE.md). |
| **Improve an existing skill** | Open an [improve-role issue](.github/ISSUE_TEMPLATE/improve-role.yml), then a PR that **bumps the version + changelog**. |
| **Add an evaluation case** | See [EVALUATION.md](EVALUATION.md). Start from a documented failure mode. |
| **Adopt versioning for an unversioned skill** | Add an in-file version, a changelog, and a scoped tag (below). |
| **Discuss design or share a failure mode** | [GitHub Discussions](../../discussions). |

---

## Workflow

1. **Fork → branch → PR.** Create a branch named `role/short-description`
   (e.g. `role/grant-reviewer`) or `eval/skill-case` for eval work, and open a PR
   against `main`.
2. **One change per PR.** One new skill, one focused revision, or one set of eval
   cases — not several at once.
3. **Reference an issue** so the motivation is documented.

---

## The three-layer requirement

Every skill spec must make all three layers explicit and separated:

- **Knowledge anchor** — the *types* of documents that ground the agent (not their
  verbatim content).
- **Standing instructions** — persistent rules for audience, tone, format, and at
  least one guardrail.
- **Prompt intent** — at least one worked example naming the deliverable and audience.

Plus at least one honest **failure mode** ("Where it fails"). Follow
[TEMPLATE.md](TEMPLATE.md).

---

## Versioning

Every skill is version-tracked so an output can be traced to exact bytes. This is
the precondition for evaluation.

**1. In-file semantic version + changelog.** Each skill declares a version and
keeps a changelog of what changed and why (see `pre-submission-agent/` — the
`Skill v2.4` footer and its `vX.Y change:` log are the model). Bump on every
meaningful change:

| Bump | When | Example |
|---|---|---|
| **patch** `vX.Y.Z` | wording, docs, provenance plumbing — no behavior change | fix a typo; add a provenance field |
| **minor** `vX.Y` | new capability or changed checklist — same purpose, new behavior | add a subagent; add a review criterion |
| **major** `vX` | re-scope, or a breaking change to how it's invoked or what it outputs | change the output contract |

(These are docs-skills, so semver is a discipline, not a compiler — approximate is fine, but *always bump something*.)

**2. Scoped release tags.** This is a monorepo of independently-evolving skills, so
tag with a **scoped** name — never a bare `v2.4`:

```bash
git tag -a presub-reviewer/v2.4 -m "Pre-submission reviewer v2.4 — <one line>"
git push origin presub-reviewer/v2.4
```

The tag name maps 1:1 to the in-file version. **Never move a tag once it is
pushed** — cut a new version instead. (A local, unpushed tag may be moved.)

**3. Provenance.** If a skill is deployed into other projects, its installer should
stamp an `INSTALLED_FROM` file (source commit + version) into each copy, and any
record the skill produces should carry the version *and* source commit — so a
result made by a deployed copy still resolves to a tag. See
`pre-submission-agent/scripts/install.sh` and `references/review_manifest.md`.

---

## Evaluation

The point of versioning is to enable evaluation. As a skill matures, changes should
come with — or add to — its eval cases (see [EVALUATION.md](EVALUATION.md)).

- A **failure mode** in a spec is a first-class eval seed: turn it into a case.
- A change that claims to *fix* or *improve* behavior should add a case that would
  have caught the old behavior (a regression test in prose form).
- Cases include **negatives** — behavior the skill must *not* exhibit.

Eval cases are as welcome as new skills. You do not need a runner; a well-specified
case a human (or an LLM judge) can apply is the contribution.

---

## Quality bar

Every PR must:

- Follow [TEMPLATE.md](TEMPLATE.md); land in the correct role folder.
- Make the three layers explicit, with at least one guardrail and one worked example.
- Include at least one honest failure mode.
- **Bump the version and update the changelog** for any change to an existing skill.
- **Tag the release** (scoped) if the change is a version boundary you want to mark.
- Add or extend an eval case when the change alters behavior (encouraged; required
  once a skill has an `evals/` set).
- Contain **no proprietary content** — describe document *types* and *patterns*,
  never verbatim text from proposals, student work, or unpublished manuscripts.

---

## Tone

These are living documents, not polished publications. Write in plain language,
first person, and be honest about limitations. If you have not observed a failure
mode, you have not used the skill enough to contribute the spec.

---

## Review checklist

When reviewing a PR that adds or modifies a skill:

- [ ] In the correct role folder; follows TEMPLATE.md.
- [ ] Knowledge anchor lists concrete document *types* (not vague references).
- [ ] Standing instructions include audience, tone, format, and ≥1 guardrail.
- [ ] Prompt intent includes ≥1 worked example with deliverable and audience named.
- [ ] "Where it fails" is present and honest.
- [ ] **Version bumped and changelog updated** for changes to an existing skill.
- [ ] **Scoped tag** applied/planned if this is a release boundary.
- [ ] Eval case added or extended when behavior changed (or a note on why not).
- [ ] No proprietary content included verbatim.
- [ ] Language is plain, first person, consistent with the repo's tone.

---

## Channels

| Purpose | Where |
|---|---|
| Design questions, use-case discussion, failure-mode sharing | [GitHub Discussions](../../discussions) |
| New role proposals, bug reports, spec revisions, eval cases | [GitHub Issues](../../issues) |
