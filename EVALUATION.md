# Evaluating academic-practice-agents

> **Status: early / build-toward.** This document defines the *shape* of an
> evaluation framework and how to contribute a case. There is no runner yet — a
> case a human or an LLM judge can apply by hand is a real contribution, and the
> accumulated cases are what a runner will later automate.

## Why evaluate

These skills are easy to change and hard to judge. A new prompt always *feels*
better. The purpose of the versioning discipline (see [CONTRIBUTING.md](CONTRIBUTING.md))
is to let us replace that feeling with evidence:

> "`presub-reviewer/v2.4` catches the missing-DOI case that `v2.3` missed, and
> still does not flag clear non-native phrasing as an error."

That sentence is only checkable if (a) we have the case written down, and (b) every
run records the exact skill version + commit that produced it. We now have (b).
This document is how we build (a).

## What we mean by "evaluating a skill"

Not a benchmark score — a set of **behavioral cases**. For each case we ask:
given this input, did the skill do the right thing, *and* avoid the wrong thing?

Two polarities, both required as the set grows:

- **Positive** — behavior the skill *must* exhibit (catch the unstated filter band;
  trace an abstract claim to a figure; ask before assuming a target journal).
- **Negative** — behavior it must *not* exhibit (flag clear non-native phrasing as
  an error; invent significance the authors didn't claim; grade an author's
  understanding in the verification pass).

Negatives matter as much as positives — most regressions are a skill becoming
*over*-eager, not under-eager.

## Anatomy of an eval case

Keep cases in markdown, tool-agnostic, one per file:

```
skill:        presub-reviewer
version_seen: presub-reviewer/v2.4   # the version this case was written against
polarity:     positive | negative
title:        Unstated filter band on the path to the headline result

FIXTURE
  A short, synthetic input scenario (a paragraph of "methods", a fake
  availability statement, etc.). Synthetic only — never real unpublished work.

EXPECTED
  What the skill should do: e.g. "raise a REPRODUCTION-STOP for the missing
  filter corners, severity BLOCKING, because it feeds the central result."

MUST NOT
  What would be a failure: e.g. "assume a default band and pass the step."

RUBRIC
  How a judge (human or LLM) decides pass/fail from the skill's output —
  the specific signal to look for.
```

The `evals/` set for a skill lives beside it (e.g.
`pre-submission-agent/evals/`). Fixtures must be **synthetic** — the same
no-proprietary-content rule as everywhere in this repo.

## Version-over-version comparison

Because every run records `skill_version` + `skill_commit`, the same case can be
replayed against two versions:

1. Check out (or deploy) each version by its tag: `git checkout presub-reviewer/v2.3`.
2. Run the case through both; capture outputs.
3. Compare against the rubric: **improvement** (v2.4 passes a case v2.3 failed),
   **regression** (v2.4 fails a case v2.3 passed), or **no change**.

A PR that claims to improve behavior should add the case that demonstrates it —
a regression test written in prose.

## Where the first cases come from

Every spec already has a **"Where it fails"** section. Those are the seed cases:
each documented failure mode is one negative (or a positive the skill currently
misses). Converting existing failure modes into `evals/` cases is the best first
contribution.

## How to contribute a case

1. Pick a skill and a behavior (start from its documented failure modes).
2. Write a synthetic fixture, the expected behavior, the must-not, and a rubric.
3. Note the `version_seen` tag it was written against.
4. Open a PR on a `eval/<skill>-<short>` branch (see CONTRIBUTING.md).

## Open questions (help shape these)

- **Judge:** human, LLM-as-judge, or both? An LLM judge is scalable but is itself a
  versioned dependency that needs its own provenance.
- **Layout:** per-skill `evals/` vs. a top-level `evals/`. Currently per-skill.
- **Runner:** what a minimal, tool-agnostic runner looks like once enough cases exist.

Bring these to [GitHub Discussions](../../discussions).
