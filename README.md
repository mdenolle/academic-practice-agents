# Academic Practice Agents

A curated, **version-tracked** collection of agent specifications for the many roles that tenure-track faculty play in their professional lives. The aim is *not* a laundry list of prompts but a small set of skills we can **track, improve, and evaluate over time**. Each is grounded in a **three-layer model** — a knowledge anchor (domain documents), standing instructions (persistent rules for tone, format, and guardrails), and a prompt intent (per-interaction request with deliverable and audience named) — and each carries a semantic version, a changelog, and a git release tag, so any output can be traced back to the exact version that produced it.

The north star is an **evaluation framework**: to move from "this prompt feels good" to measurable, reproducible evidence that a skill helps — and that each version is better than the last. Version tracking is the foundation that makes evaluation possible.

**Contributions are welcome** — new roles, improvements to existing skills, and especially evaluation cases. See [CONTRIBUTING.md](CONTRIBUTING.md) and [EVALUATION.md](EVALUATION.md).

## Role index

| Role | Folder | Status | Version |
|---|---|---|---|
| 🔬 Scientist | [`research/`](research/) | **active** | — |
| 📋 Project manager | [`project-management/`](project-management/) | planned | — |
| 🔍 Reviewer | [`review/`](review/) | **active** | — |
| 📝 Pre-submission reviewer | [`pre-submission-agent/`](pre-submission-agent/) | **active** | `presub-reviewer/v2.4` |
| 📣 Public communicator | [`communication/`](communication/) | planned | — |
| 📚 Curriculum builder | [`teaching/`](teaching/) | **active** | — |
| 🤝 Collaborator | [`collaboration/`](collaboration/) | planned | — |
| 💡 Pitch architect | [`proposal/`](proposal/) | planned | — |

Version `—` means the skill has not yet adopted the versioning convention below; `presub-reviewer/v2.4` is the reference implementation. Adopting it for the other active skills is a good first contribution.

---

## The three-layer model

Every spec in this repository makes three layers explicit:

| Layer | What it contains | Example (teaching) |
|---|---|---|
| **Knowledge anchor** | Uploaded documents that ground the model in the author's domain knowledge | Textbook chapters, syllabus, learning objectives |
| **Standing instructions** | Persistent rules governing tone, audience, format, guardrails, failure-mode handling | "Preserve the physics exactly. Do not simplify the math; simplify the explanation." |
| **Prompt intent** | Per-interaction request specifying deliverable, audience, and scope for *this* task | "Generate a whiteboard lecture and Jupyter notebook for Chapter 9.2 covering moment tensor decomposition." |

---

## Why instructions are not enough

This repository began as a collection of role-based agent instructions for academic life. Over time, a more important design principle became clear:

**Instructions alone do not make an agent robust.**

Instructions can externalize process. They can tell an agent how to act, what steps to follow, and what kind of output to produce. But strong performance in real academic work depends on more than a good instruction block.

Robust agents also need:

1. **Purpose**  
   What job is the agent actually helping with?

2. **Knowledge anchor / context**  
   What sources, documents, examples, or domain conventions should ground the work?

3. **Intent and audience**  
   Why is the user asking, and for whom is the output intended?

4. **Inputs**  
   What should the user provide so the agent can do meaningful work?

5. **Output structure**  
   What form should the result take?

6. **Constraints**  
   What must be preserved, avoided, or optimized?

7. **Failure modes**  
   What commonly goes wrong, and how should that be handled?

In academic settings, this matters a great deal. Research, teaching, mentoring, reviewing, and proposal writing all depend on local context, disciplinary norms, prior materials, and audience-specific expectations. An instruction that looks good in isolation can still produce shallow or misaligned work if those other elements are missing.

This repository therefore treats each agent not just as a prompt, but as a **role-specific specification** for AI-assisted academic work.
---

## Versioning & provenance

Skills here are **version-tracked** so a result can always be traced to the exact bytes that produced it — the precondition for improving them with evidence instead of vibes.

- **In-file semantic version + changelog.** Each skill declares its version (e.g. `Skill v2.4`) and keeps a changelog of what changed and why. Bump it on every meaningful change.
- **Scoped release tags.** Because this is a monorepo of independently-evolving skills, a release is marked with a *scoped* git tag — `<skill>/vX.Y`, e.g. `presub-reviewer/v2.4` — never a bare `v2.4`. Each skill versions on its own timeline.
- **Deployment provenance.** When a skill is installed into another project, it carries an `INSTALLED_FROM` stamp recording the source commit, so a copy running elsewhere still knows which version and commit it came from.
- **Traceable outputs.** Skills that produce a record (e.g. the pre-submission reviewer's review manifest) write the version *and* the source commit into that record. The version says *what* release; the commit pins *exactly which bytes*; together they resolve to the release tag.

The [`pre-submission-agent/`](pre-submission-agent/) is the reference implementation. See [CONTRIBUTING.md](CONTRIBUTING.md) for the exact bump-and-tag workflow.

---

## Toward an evaluation framework

The reason to version these skills is to be able to **evaluate** them — to say "v2.4 catches issues v2.3 missed, with no new false positives," not "the new prompt feels better."

We are early. The direction:

- **Eval cases per skill.** A case is a fixture (an input scenario), the behavior we expect, and a rubric for judging the output — including deliberate *negatives* (things the skill must *not* do, e.g. flag clear non-native phrasing as an error).
- **Version-over-version comparison.** Because every run records its skill version + commit, the same cases can be replayed against two versions to tell an improvement from a regression.
- **Failure modes as the first seeds.** Every spec already documents where it fails; those become the first eval cases.

This is a *build-toward*, not a finished harness. See [EVALUATION.md](EVALUATION.md) for the current shape and how to add a case — **evaluation contributions are as valuable as new skills.**

---

## ⚠️ Disclaimer

These specs began as **personal, experimental** tools and stay honest about their limits: they are living documents, not validated instruments, and every claim about what they do is provisional until an evaluation backs it. What is changing is the *discipline* around them — versioning, provenance, and (increasingly) evaluation — so that improvements are measurable and reproducible. Use them, fork them, and help make them better.

---

## 🤝 Contributing

Use these agents as you wish, and help build them out. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide — the fork → branch → PR workflow, the versioning convention, the evaluation direction, quality bar, and review checklist.

- **Propose a new role** — open a [new-role issue](.github/ISSUE_TEMPLATE/new-role.yml)
- **Improve an existing spec** — open an [improve-role issue](.github/ISSUE_TEMPLATE/improve-role.yml); bump the version and changelog
- **Add an evaluation case** — the highest-leverage contribution right now; see [EVALUATION.md](EVALUATION.md)
- **Adopt versioning for an unversioned skill** — give an active skill an in-file version, changelog, and tag
- **Discuss design questions** — use [GitHub Discussions](../../discussions)

New specs must follow [TEMPLATE.md](TEMPLATE.md) and include all three layers, a version + changelog, and at least one observed failure mode (which doubles as the first evaluation case).
