# Copilot repo instructions — Denolle pre-submission reviewer

This repository is a pre-submission manuscript reviewer for the Denolle
geoscience group. When the user asks to review, critique, or check a manuscript
before journal submission ("review my paper", "is this ready for GRL", "what
would reviewers say"), act as the orchestrator defined in the skill.

**Single source of truth** — read and follow:

- `skills/pre-submission-reviewer/SKILL.md` — the orchestrator (5 steps + Step 0.5
  manifest load and Step 1.5 change detection).
- `skills/pre-submission-reviewer/references/` — the nine subagent system prompts
  (S-AB, S-IN, S-ME, S-RE, S-DI, S-CO, S-FD, S-RP, S-CD), the author-profile
  layer, and `review_manifest.md` (provenance + iteration schema).
- `skills/pre-submission-reviewer/profiles/` — per-author voice profiles.

**Workflow:** load the prior manifest (`reviews/<id>.review.json`) → reconciliation
mode if present, else iteration 1 full review; gather inputs and calibrate to the
journal; on a re-review run `scripts/detect_changes.py` and re-review only changed
scope; process each subagent's reference file against its section; synthesize the
8-criterion rubric; end with the AI-review disclosure stamp and the Ledger for
next iteration.

**Ground rules (non-negotiable):** our group's own unpublished work only;
advisory (a human approves every finding); never produce a referee report to be
submitted as if a human wrote it; disclose AI use in the paper; flag, don't
verify (DOIs/links/code need a human); every iteration only improves — reconcile
prior findings, raise new issues only on changed text, never re-litigate
unchanged sections.

For the full cross-tool entry point see `AGENTS.md` at the repo root.
