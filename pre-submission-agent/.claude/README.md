# .claude/ — generated, do not hand-edit

Everything under here is produced by `scripts/install.sh` from the single source
of truth in `skills/pre-submission-reviewer/`. Re-run the script after editing the
source; do not edit these copies directly.

- `skills/pre-submission-reviewer/` — a working copy of the skill, so it travels
  with the repo for Claude Code.
- `agents/presub-*.md` — thin subagent personas (one per registry ID), each
  pointing at its reference file under `skills/pre-submission-reviewer/references/`.

Both are gitignored by default (see `.gitignore`); regenerate on clone with
`bash scripts/install.sh`.
