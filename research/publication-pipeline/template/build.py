#!/usr/bin/env python3
"""Build the manuscript: Quarto Markdown -> LaTeX -> PDF, one command.

Adapted from the validated pipeline in Denolle-Lab/codameter (see the parent
README.md for the full write-up). Copy this into your own paper/ directory
and edit the three CONFIG blocks below for your project; the rest should not
need changes.

The single editable source is a Quarto Markdown (.qmd) file. This script:

  1. (optionally) regenerates any figures/tables your analysis code produces;
  2. runs `quarto render <source>.qmd --to pdf`, which (with `keep-tex: true`
     set in the .qmd's YAML front matter) emits both `<source>.tex` and
     `<source>.pdf` via the full quarto->pandoc->lualatex->bibtex pipeline;
  3. if your journal's LaTeX class disagrees with something Quarto's own
     template hardcodes (see the README's gotchas appendix -- a wrong
     bibliography-heading case is the most common one), applies the targeted
     string patches you list in TEX_PATCHES and recompiles with `latexmk`
     (which re-runs lualatex/bibtex until stable, so you never have to
     hand-count passes).

So you edit Markdown; you get TeX and PDF.

Usage::

    python paper/build.py              # render PDF (+ TeX)
    python paper/build.py --figures    # also regenerate figures/tables first
    python paper/build.py --qmd manuscript.qmd  # pin the source explicitly
"""
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

# ---------------------------------------------------------------------------
# CONFIG 1 of 3 -- your manuscript's source filename(s).
#
# List candidates in preference order (not just one name): a manuscript source
# does get renamed mid-project, and a script that fails with a clear "no
# source found, looked for X/Y/Z" is much easier to debug than one that
# silently picks up nothing.
# ---------------------------------------------------------------------------
SOURCE_CANDIDATES = ["manuscript.qmd"]

# ---------------------------------------------------------------------------
# CONFIG 2 of 3 -- optional command(s) that regenerate figures/tables from
# your analysis code, run when --figures is passed. Each is
# [sys.executable, "path/to/script.py"] or similar, relative to ROOT.
# ---------------------------------------------------------------------------
FIGURE_COMMANDS: list[list[str]] = [
    # [sys.executable, "scripts/make_figures.py"],
]

# ---------------------------------------------------------------------------
# CONFIG 3 of 3 -- literal string patches to apply to the rendered .tex
# before the final compile, for anything your journal's class wants that
# Quarto's own LaTeX template does not expose a YAML-metadata knob for.
# Leave empty if your class has no such conflict. See the README's gotchas
# appendix for the two most common real examples (bibliography heading case,
# and its matching \addcontentsline entry so the PDF bookmark panel agrees).
#
# Example (uncomment and adapt):
#   TEX_PATCHES = [
#       (r"\section*{References}\label{references}",
#        r"\section*{REFERENCES}\label{references}"),
#       (r"\addcontentsline{toc}{section}{References}",
#        r"\addcontentsline{toc}{section}{REFERENCES}"),
#   ]
# ---------------------------------------------------------------------------
TEX_PATCHES: list[tuple[str, str]] = []


def run(cmd: list[str], cwd: Path) -> None:
    print(f"$ {' '.join(cmd)}  (in {cwd})")
    subprocess.run(cmd, cwd=cwd, check=True)


def find_source(explicit: str | None) -> Path:
    if explicit:
        p = HERE / explicit
        if not p.exists():
            sys.exit(f"error: --qmd {explicit!r} not found in {HERE}")
        return p
    for name in SOURCE_CANDIDATES:
        p = HERE / name
        if p.exists():
            return p
    found = sorted(q.name for q in HERE.glob("*.qmd"))
    sys.exit(
        "error: no manuscript source found (looked for "
        f"{', '.join(SOURCE_CANDIDATES)} in {HERE}).\n"
        f"       .qmd files present: {found or '(none)'}\n"
        "       pass --qmd <file> to pin one explicitly, or edit "
        "SOURCE_CANDIDATES at the top of this script."
    )


def patch_and_recompile(tex: Path) -> None:
    if not TEX_PATCHES:
        return
    text = tex.read_text(encoding="utf-8")
    changed = False
    for old, new in TEX_PATCHES:
        if old in text:
            text = text.replace(old, new)
            changed = True
        else:
            # Silently doing nothing here would mask a typo'd target string
            # or an upstream Quarto/pandoc template change -- either way you'd
            # get an unexpectedly unpatched PDF with no signal that anything
            # was wrong.
            preview = old if len(old) <= 60 else old[:60] + "..."
            print(f"warning: TEX_PATCHES target not found in {tex.name}, skipped: {preview!r}")
    if not changed:
        return
    tex.write_text(text, encoding="utf-8")
    print(f"patched {tex.name} (applied TEX_PATCHES)")
    if not shutil.which("latexmk"):
        print(
            "warning: 'latexmk' not found -- .tex was patched but the .pdf "
            "still reflects the pre-patch text. Install latexmk (part of any "
            "TeX Live install) to recompile automatically."
        )
        return
    run(["latexmk", "-pdflua", "-interaction=nonstopmode", tex.name], tex.parent)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "--figures", action="store_true", help="regenerate figures/tables first"
    )
    ap.add_argument(
        "--qmd", default=None, help="manuscript source filename (default: autodetect)"
    )
    args = ap.parse_args()

    if shutil.which("quarto") is None:
        sys.exit("error: 'quarto' not found on PATH (install from quarto.org).")

    source = find_source(args.qmd)
    print(f"manuscript source: {source.relative_to(ROOT)}")

    if args.figures:
        for cmd in FIGURE_COMMANDS:
            run(cmd, ROOT)

    # Quarto reads/writes relative to the .qmd directory.
    run(["quarto", "render", source.name, "--to", "pdf"], HERE)

    pdf = source.with_suffix(".pdf")
    tex = source.with_suffix(".tex")
    if tex.exists():
        patch_and_recompile(tex)

    print("\nBuild complete:")
    for p in (tex, pdf):
        print(f"  {'ok ' if p.exists() else 'MISSING '}{p.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
