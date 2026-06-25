# reviews/ — per-manuscript review state

This folder holds the **review manifests** that make the Pre-Submission Reviewer
stateful across drafts. One manuscript → one manifest:

```
reviews/<manuscript-id>.review.json     ← durable Issue Ledger + provenance
reviews/<manuscript-id>.changes.json    ← transient per-iteration diff (from detect_changes.py)
```

- The orchestrator reads `*.review.json` at SKILL.md **Step 0.5** and writes it
  back at **Step 5**. Schema and lifecycle: `../skills/pre-submission-reviewer/references/review_manifest.md`.
- `*.changes.json` is produced by `../scripts/detect_changes.py` and consumed at
  **Step 1.5**. It is scratch — safe to delete between iterations.

## Privacy

Manifests contain review findings about **unpublished** manuscripts (no full
manuscript text, but section locations and issue summaries). Decide as a group
whether to commit them:

- **Commit** if you want the review trajectory (iteration 1 → 2 → 3) in git
  history for the group.
- **Gitignore** (default below) if manifests should stay local to each author.

A `.gitignore` here ignores the JSON by default; drop it if you choose to commit.
