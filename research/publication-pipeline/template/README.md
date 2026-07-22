# Template: paper → Overleaf sync

Two files, adapted from a working pipeline (see the parent [README.md](../README.md) for the full write-up and the reasoning behind each choice). Copy both into your own project and edit the marked `CONFIG` blocks.

## Files

- **`build.py`** → copy to `paper/build.py`. Edit the three `CONFIG` blocks at the top: your manuscript's filename(s), any figure-regeneration commands, and (only if your journal's class needs it) the literal `.tex` string patches described in the parent README's gotchas appendix.
- **`.github/workflows/sync-to-overleaf.yml`** → copy to `.github/workflows/sync-to-overleaf.yml` in your code repo. Edit the four `CONFIG` blocks: branch name, trigger paths, paper repo name, and the exact filenames staged in the commit step.

## Order of operations

1. Get `build.py` working **locally** first — `python paper/build.py` should produce a clean `.pdf` before you touch the GitHub Action at all. Any LaTeX class conflict is far faster to debug in your own terminal than through a CI log.
2. Create the paper-only GitHub repo (empty, or seeded from your journal's Overleaf template export).
3. Generate a deploy key in `~/.ssh/` (commands in the workflow file's header comment) and wire it up with `gh repo deploy-key add` + `gh secret set`.
4. Push the edited workflow file. It will fail until the secret exists (expected) — once the secret is set, trigger it manually once via the Actions tab (`workflow_dispatch`) to test before relying on the automatic push trigger.
5. Link the paper repo to an Overleaf project via Overleaf's GitHub Sync.
