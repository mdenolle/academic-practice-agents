# Publication pipeline: prompt → code → paper → journal, without losing the thread

**Version:** v0.1 · **Status:** active (validated on a real paper, see [Worked example](#worked-example)) · **Tag:** `publication-pipeline/v0.1`

> One-sentence purpose statement: version-control a paper the same way you version-control code, so that "what changed and why" is answerable at every stage from first prompt to journal PDF, and a colleague's comment in Overleaf can always be traced back to a line of code.

## The problem this solves

A typical academic paper's provenance looks like this: exploratory code in a notebook nobody kept, a chat log with an AI assistant that produced a paragraph nobody remembers the reasoning for, a `.docx` emailed between three co-authors with `_v2_final_ACTUALFINAL.docx` in the filename, and a LaTeX file hand-typeset from that prose the week before submission. None of it is in the same version-control system. A reviewer's comment three months later ("can you check this with a different frequency band?") requires reconstructing which script produced which number, from memory.

This guide describes a pipeline where **the code, the figures, and the paper text are versioned together in one git history**, the LaTeX a journal wants is *generated*, not hand-typeset, and the one genuinely manual step — turning a colleague's Overleaf comment into a code change — is captured as a GitHub issue instead of a Slack message that evaporates.

It is not a framework to install. It is five small, standard tools wired together in a specific order. Every piece is something you already have an account/license for as an academic: Python, git, GitHub, Quarto, Overleaf.

## The five stages

```
 (1) PROMPT/CODE           (2) MARKDOWN REPORT        (3) VERSION CONTROL
 Claude / Claude Code  →   .qmd or .ipynb narrating →  git commit, GitHub repo
 in your code repo         methods + results             (code AND prose, same repo)
                                                                │
                                                                ▼
 (5) COLLABORATIVE REVIEW  ←  (4) AUTOMATED TYPESET
 Overleaf (comments,          quarto render .qmd → .tex
 track changes, co-authors)   pushed to a paper-only GitHub repo
        │                     Overleaf's GitHub Sync pulls it
        ▼
 GitHub issue in the CODE repo  ──────────────────────────────┘
 ("Fig. 3b needs bigger fonts") → code edit → back to stage 4
```

Two repos, not one: a **code repo** (this project's actual analysis code, tests, and the paper's Markdown source) and a **paper repo** (nothing but the compiled `.tex`, bibliography, figures, and the journal's class files — the thing Overleaf actually reads). Splitting them matters for one reason: **Overleaf syncs a whole repo**, and you do not want your Python source, test suite, and CI history inside a project a co-author opens just to fix a typo in the abstract.

## Worked example

This pipeline is not hypothetical — it is running today on:
- **Code repo**: [`Denolle-Lab/codameter`](https://github.com/Denolle-Lab/codameter) — `paper/manuscript_marine.qmd` is the source, `paper/build.py` is the generator, `src/codameter/` is the analysis code the figures come from.
- **Paper repo**: [`Denolle-Lab/codameter-paper`](https://github.com/Denolle-Lab/codameter-paper) — synced automatically from the code repo, linked to an Overleaf project via Overleaf's GitHub Sync.
- **Sync automation**: `.github/workflows/sync-paper-to-overleaf.yml` in the code repo.

Every claim below is grounded in that project, not a hypothetical. The [`template/`](template/) folder in this guide is a genericized copy of the same two files, ready to adapt — note it names the workflow file `sync-to-overleaf.yml` (a more generic name than the worked example's own `sync-paper-to-overleaf.yml`); the two are the same file with different names, not different files.

---

## Stage 1 — Prompt → code

The AI assistant (Claude Code, or any agent) works **inside the code repo**, on the actual analysis modules and tests — not in a disposable chat window. The reason is not process for its own sake: an assistant that edits `src/yourpackage/figures.py` produces a diff you can review, test, and revert; an assistant that pastes a finished paragraph into a chat produces nothing you can check.

**Minimal-tooling choices:**
- Interaction happens as normal Python development — edit a module, run the test suite, look at the diff. No bespoke "agent workflow" tooling.
- Notebooks are for *exploration only* and are not the artifact of record — anything a paper depends on should end up as a tested function in a module, not a cell in a `.ipynb` that can be re-run out of order. If a notebook exists, treat it as disposable scratch work, same as you would a REPL session.
- Standing instructions for the assistant (tone, what to preserve, what never to guess) live in a checked-in `CLAUDE.md`/`AGENTS.md` at the repo root, not in a chat history that disappears. This is the "three-layer model" this repository (`academic-practice-agents`) already documents for agent specs generally — apply the same discipline here.

## Stage 2 — Code → Markdown report

The paper's prose lives in one **Quarto Markdown** file (`.qmd`). Markdown with inline citations (`[@key]`) and executable code blocks, not LaTeX, is the thing a human *and* an AI assistant edit directly. Figures are referenced by path, not pasted as images — regenerating a figure means re-running a script, not re-drawing something in Illustrator.

```
paper/manuscript.qmd          # the single editable source — never hand-edit the generated .tex
src/yourpackage/figures.py    # the actual figure-generating code the paper cites
literature/figs/*.png         # generated output, committed so the build is reproducible offline
```

Why Quarto over raw Pandoc or a bespoke script: it is one well-maintained binary, handles citation processing (`natbib`/`citeproc`) and LaTeX passthrough for tables/equations without extra plumbing, and — critically — it lets raw LaTeX blocks sit directly in the Markdown for anything Markdown cannot express (a `tabularx` table, a `keywords` environment your target class defines). You do not need to learn a new templating language; you need Markdown plus the ability to drop in a fenced ` ```{=latex} ` block when Markdown genuinely cannot say what you need.

## Stage 3 — GitHub for version control (code *and* prose, together)

Both the analysis code and the paper's `.qmd` are committed to the **same** git repository, on the same branches, reviewed through the same pull requests. This is the single highest-leverage decision in the whole pipeline: it means a commit that changes a coefficient in the model and a commit that updates the sentence describing that coefficient can be the *same* commit, and `git log -p -- paper/manuscript.qmd src/yourpackage/model.py` answers "did the paper text and the code actually change together?" — a question that is unanswerable once the paper lives in a `.docx` on someone's laptop.

Practical conventions that cost nothing and pay for themselves:
- **pre-commit hooks** (`ruff`, `black`, `mypy`, trailing-whitespace) on the code, so review time goes to substance, not formatting nits.
- **One feature branch per logical change**, PR review even if you are the sole author for now — it is the mechanism that makes `git bisect` and `git blame` useful later, and costs nothing more than typing `git checkout -b`.
- The generated `.tex` **is** committed (unusually, for a generated artifact) — because it is the thing the paper repo (stage 4) needs to sync, and because a reviewer wants to see the exact LaTeX diff, not just the Markdown diff, when a citation or equation changes.

## Stage 4 — Automated Markdown → journal LaTeX

One script, `paper/build.py`, does the whole render: regenerate any figures/tables that come from code, run `quarto render` (which runs the full `lualatex` + `bibtex` toolchain and emits both `.tex` and `.pdf`), and — the one non-obvious step — **patch the two or three things Quarto's own template hardcodes that your target journal's class disagrees with**, then recompile.

This last step deserves honesty: **Quarto's LaTeX template is opinionated, and it will not always agree with an old or unusual `.cls` file.** In the worked example, three separate small conflicts surfaced against a real 1998-vintage journal class (`gji.cls` for *Geophysical Journal International*):

1. Quarto's `\usepackage{natbib}` and the class's own `\newlength{\bibhang}` collide (`natbib` loads *after* the class in Quarto's template, and its own `\newlength` call errors if the class already claimed that register). **Fix pattern**: let whichever package loads first win; provide the value, not the definition, in your own preamble.
2. Quarto hardcodes the bibliography heading as the literal string `"References"`, overriding the class's own house style (which might want `"REFERENCES"`). **There is no YAML metadata key that fixes this under `cite-method: natbib`** — tested, confirmed absent. **Fix pattern**: a small, targeted string patch on the rendered `.tex`, applied by `build.py` itself (not by hand), followed by a recompile with `latexmk` (which re-runs `lualatex`/`bibtex` until stable, so you never have to hand-count how many passes a class needs).
3. Some classes' `\figure`/`\table` don't accept the `[htbp]` placement argument Markdown-generated LaTeX defaults to — it prints literally instead of being consumed. **Fix pattern**: know your class's own float defaults, and don't pass an argument it doesn't expect.

None of this is specific to GJI — it is the generic shape of "an old but real journal class meets a modern automated pipeline." The [gotchas appendix](#appendix-hard-won-latex--pandoc-gotchas) below catalogs the specific failures with their fixes, because the failure *messages* are searchable and the fixes are not obvious from the message alone.

**Minimal-tooling choice**: `build.py` is one plain Python script with no framework — `argparse`, `subprocess`, `pathlib`. It is the one piece of this pipeline worth reading end-to-end before you trust it, because it is the one piece doing something non-standard (patching a generated file). Keep it that way: resist the urge to grow it into a build system.

## Stage 5 — The paper repo, synced to Overleaf, and the return path

A **GitHub Action**, triggered on push to the code repo's `paper/**` (and the figures/class-files it depends on — see the [gotchas appendix](#appendix-hard-won-latex--pandoc-gotchas) for why the path list matters), copies the built `.tex`, bibliography, figures, and the journal's class/style files into a **separate, paper-only GitHub repo**. That repo is the thing Overleaf's **GitHub Sync** feature reads from — either automatically, or via a "Pull from GitHub" click in Overleaf's menu.

```yaml
# .github/workflows/sync-paper-to-overleaf.yml — the shape of it, as it actually
# runs in the worked example (Denolle-Lab/codameter); paths trimmed for
# readability. For the generic, ready-to-adapt version with different
# (more generic) filenames and paths, see template/.github/workflows/sync-to-overleaf.yml.
on:
  push:
    branches: [main]
    paths: ["paper/manuscript.tex", "paper/*.bib", "paper/*.cls", "literature/figs/**"]
jobs:
  sync:
    steps:
      - checkout the code repo (sparse: just paper/ and the figures)
      - checkout the paper repo, authenticated with a deploy key
      - copy the built files across
      - commit and push, only if something actually changed
```

Co-authors and reviewers then work in Overleaf exactly as they always have — comments, track changes, a shared editor — with **zero new tooling asked of them**. This is deliberate: the automation exists so that *you* don't hand-copy files, not so that your colleagues learn a new workflow.

### Deploy keys: the one credential this needs

The sync workflow needs write access to the paper repo. Use a **deploy key scoped to that one repo** (an SSH key pair, the public half registered on the paper repo with write access, the private half stored as a GitHub Actions secret on the code repo) — not a personal access token with broader account access. Generate it **outside any git working tree** (`~/.ssh/`, never a bare relative filename run from inside a checkout — that leaves the private key sitting untracked in a working directory, one `git add -A` away from a real leak). `gh repo deploy-key add` and `gh secret set` do the GitHub-side wiring from the command line; nothing about this needs a browser.

### The return path: comments back to code

This is the one stage that stays deliberately manual, and the reason is worth stating plainly: **the generated `.tex` is a one-way artifact.** If a colleague edits prose directly in Overleaf and that edit is not ported back into the `.qmd`, the *next* automated sync from the code repo will silently overwrite it — because the workflow always regenerates the paper repo's files from the code repo's build output.

Given that constraint, the practice that actually works:
1. Ask colleagues to use Overleaf's **comments**, not direct text edits, during review. (Overleaf's comments are Overleaf-side metadata — they do not travel through git at all, in either direction. This is a real limitation, not a bug to route around: automating comment-scraping would need a scraper against an UI Overleaf does not expose an API for, which is the opposite of minimal tooling.)
2. When you read a comment worth acting on, **open a GitHub issue in the code repo** describing it in one sentence — "Fig. 3b legend overlaps the data," "reviewer wants the $Q_c$ definition moved earlier." This is the paper trail. It costs one sentence and gives you `git log` provenance for why a figure changed.
3. Resolve the issue with a normal code change — edit the `.qmd` or the figure-generating function, rerun `build.py`, let the existing forward sync push the correction back to Overleaf. Close the issue.

This turns "a comment in a tool with no git history" into "an issue with a linked commit," which is the entire point of the exercise.

---

## Minimal-dependency principles

Every tool choice above was made against one test: *would an academic with no DevOps background be able to set this up and keep it running without a dedicated engineer?* Concretely:

| Choice | Not this | Why |
|---|---|---|
| Quarto | Bespoke Pandoc scripting, or a hand-rolled `.tex` template | One binary, handles citations and raw-LaTeX passthrough already |
| `paper/build.py`, plain Python | A build system (Make, a task runner) | One file you can read in five minutes; no new syntax to learn |
| GitHub Actions | A self-hosted CI server | Already included with the GitHub account you have |
| A scoped deploy key | A broad personal access token | Least privilege; one repo, one purpose, easy to revoke |
| Overleaf's native GitHub Sync | A custom Overleaf API integration | Zero new tooling for co-authors; they keep using Overleaf exactly as before |
| GitHub issues for feedback | A bespoke comment-import script | The friction (one sentence, one click) is the *feature* — it forces triage instead of blind automation |
| `git`/GitHub for the paper text | Google Docs / `.docx` with tracked changes | One history for code and prose; `git blame` works on both |

## Setup checklist

1. **Code repo**: add `paper/manuscript.qmd`, a `paper/build.py` (adapt from [`template/build.py`](template/build.py)), your journal's `.cls`/`.bst` if it has one, and a `_preamble.tex` for anything Quarto's YAML front matter cannot express.
2. **Build locally once**, end to end, before automating anything: `python paper/build.py`. Fix whatever your specific class disagrees with (see the [gotchas](#appendix-hard-won-latex--pandoc-gotchas)) *before* wiring up CI — debugging a LaTeX class conflict through a CI log is much slower than doing it in your own terminal.
3. **Create the paper repo** (empty, or seeded from your journal's official Overleaf template export).
4. **Generate a deploy key** in `~/.ssh/`, register the public half on the paper repo with write access, store the private half as a secret on the code repo (see [`template/`](template/) for the exact `gh` commands).
5. **Add the sync workflow** (adapt from [`template/.github/workflows/sync-to-overleaf.yml`](template/.github/workflows/sync-to-overleaf.yml)), listing every file your build touches in its trigger `paths:` (see the gotcha below).
6. **Link the paper repo to an Overleaf project** via Overleaf's GitHub Sync (Overleaf → New Project → Import from GitHub, or link an existing project via its menu).
7. Push a change to `paper/manuscript.qmd` in the code repo and confirm it appears in Overleaf within a few minutes.

## Appendix: hard-won LaTeX / pandoc gotchas

Each of these cost real debugging time on the worked example. They are recorded here because the *error message* is the thing you will search for, and the fix is rarely obvious from the message alone.

- **`Command \bibhang already defined`** — your journal's class and `natbib` both try to define the same length register. Let whichever loads first win; `\providecommand`/re-`\setlength` the value in your own preamble rather than `\newlength`-ing it again.
- **The bibliography heading won't match your class's house style** — Quarto hardcodes it and blanks the class's own heading mechanism to avoid a double heading. There is no `reference-section-title` effect under `cite-method: natbib` (tested). Patch the rendered `.tex` directly in your build script, and patch **both** the visible `\section*{...}` and the matching `\addcontentsline{toc}{section}{...}` together — the second one feeds the PDF bookmark panel via `hyperref` even when there is no printed table of contents, and leaving it inconsistent with the heading is its own small bug.
- **A stray `[htbp]` prints literally above every figure/table** — some classes redefine `\figure`/`\table` to take *no* placement argument at all (unlike standard LaTeX). Check your class's own `\fps@figure`/`\fps@table` defaults before passing one.
- **A closing `$` immediately followed by a digit doesn't parse as math** — e.g. `$\sim$0.02` silently escapes to garbled literal text instead of erroring, because Pandoc's dollar-math rule specifically disallows a digit right after the closing `$` (to avoid misreading `$20,000` as math). Merge into one span: `$\sim\!0.02\,\%$`.
- **A raw `\begin{table}...\end{table}` block leaks stray literal text right after it, silently corrupting any citations inside** — a real, reproducible Pandoc parsing edge case with no single isolated trigger found (tried caption length, LaTeX-style double-backtick quotes, custom macros, math-dollar adjacency — no single feature explained it in isolation). The reliable fix: wrap the whole table in an explicit raw-LaTeX fence (` ```{=latex} ... ``` `), which forces Pandoc to treat it as fully opaque. This means any `[@key]` citations *inside* the table must be converted to raw `\citep{key}` first, since a raw fence bypasses Pandoc's citation processing entirely.
- **Literal Unicode math symbols in YAML metadata (e.g. an `abstract:` field) render as missing glyphs** under an unusual class's font setup, even though the same symbols are fine in the body text once escaped through a macro. If your body prose already uses `\dvv\ ` (a macro, with an escaped trailing space to stop the macro eating it) instead of a literal `δv/v`, do the same in YAML metadata fields — don't assume they get the same LaTeX processing pass as body Markdown.
- **The sync trigger must cover every file the build touches.** If your class/style files carry local patches (like the `\bibhang` fix above), the paper repo needs *your* patched copies, not whatever it already has — and the workflow's `paths:` filter needs to include those class files, not just the manuscript and bibliography, or a class fix you make will never propagate.

## Version history

| Version | Date | Change | Reason |
|---|---|---|---|
| v0.1 | 2026-07-22 | Initial version, extracted from the `codameter`/`codameter-paper` pipeline | First validated end-to-end run: build, class-conflict fixes, deploy-key sync, all working on a real GJI submission draft |
