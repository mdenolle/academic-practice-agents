# AGENTS.md

Denolle group pre-submission manuscript reviewer. This repository holds one
agent and its nine subagents, packaged so the same source works across Claude,
Cursor, GitHub Copilot, and Codex.

`AGENTS.md` is an open standard read automatically by Codex, Cursor, Copilot,
Gemini CLI, and Windsurf. It is the cross-tool entry point. Tool-native wrappers
live in `.claude/`, `.cursor/`, and `.github/` for a better experience in each.

## The agent

The canonical agent is the Claude skill at:

```
skills/pre-submission-reviewer/SKILL.md
skills/pre-submission-reviewer/references/   # the nine subagents
```

Everything else in this repo points back to those files. Edit them, not the
copies.

## When to run it

Run the pre-submission reviewer when someone asks to review, critique, or
check a geoscience manuscript before submitting it to a journal — e.g. "review
my paper," "is this ready for GRL," "what would reviewers say."

There is also an optional **Author Verification** pass (`S-AV`), run when someone
asks to be quizzed on their own paper — "quiz me on my paper," "verify I
understand my methods," "check I'm in control of the workflow." It examines the
authors on the data-processing/signal-processing and interpretation choices they
must own, records their answers, and certifies process, not competence. It is a
separate axis from the review — accountability, not quality — and gates nothing.

## How to run it

1. Open `skills/pre-submission-reviewer/SKILL.md` and follow it as the
   orchestrator.
1a. Check for a prior review manifest at `reviews/<manuscript-id>.review.json`
   (Step 0.5). None → iteration 1, full review. Present → reconciliation mode:
   load the Issue Ledger and provenance, review only what changed.
2. Gather inputs (manuscript, target journal, paper type) and calibrate to the
   journal.
2a. On a re-review, run `scripts/detect_changes.py` on the author's latexdiff or
   before/after pair to get `changes.json` (Step 1.5), then re-dispatch only the
   subagents whose scope changed.
3. Dispatch the nine subagents in
   `skills/pre-submission-reviewer/references/` — one per slice of the paper
   (S-AB, S-IN, S-ME, S-RE, S-DI, S-CO, S-FD) plus reproducibility (S-RP) and
   citation & idea diversity (S-CD). In
   Codex/Cursor, read each subagent file and apply it to its section in turn;
   the orchestrator alone writes the report.
4. Synthesize into the eight-criterion rubric and produce the report described
   in the SKILL.
5. **(Optional) Author Verification (Step 6).** If asked to quiz/verify the
   authors, follow `references/section_author_verification.md`: examine one topic
   at a time (workflow first), record verbatim answers, classify only whether each
   was answered, and write the transcript to
   `reviews/<manuscript-id>.verification.json` plus a process-only in-paper
   statement. The agent never grades understanding; a named human adjudicates.

## Scope and ground rules (non-negotiable)

- Our group's own unpublished work only. Never another group's manuscript —
  that breaks journal confidentiality.
- Advisory. A human approves every finding before a submission decision.
- Never write a referee report to be submitted to a journal as if a person
  wrote it.
- Disclose AI help in the paper, and tell co-authors the pre-review was run. Each
  report emits an AI-review disclosure stamp to paste in — it records process, not
  endorsement.
- The agent flags; it does not verify. DOIs, links, and code still need a human.
- Iterations only improve: reconcile prior findings, raise new issues only on
  changed text, never re-litigate unchanged sections. State lives in the review
  manifest. This is a filesystem/CLI tool — not for stateless browser sessions
  past iteration 1.
- Author Verification certifies process, not competence. The quiz and its in-paper
  statement record that an examination happened and what was answered — never that
  an author understands the work. The agent asks and records; a named human judges.
  It gates nothing and never overrides a soundness/reproducibility/evidence finding.

## Repo conventions

- Markdown only; no build step.
- Keep `SKILL.md` and the subagent files as the single source of truth.
- Treat the files under `.claude/`, `.cursor/`, `.github/` as thin pointers.
