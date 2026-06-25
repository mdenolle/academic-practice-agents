#!/usr/bin/env python3
"""detect_changes.py — normalize a manuscript revision into changes.json.

The Pre-Submission Reviewer (SKILL.md Step 1.5) re-reviews only what changed on a
re-review. This wrapper turns any of three author-supplied change forms into a
single changes.json that the orchestrator consumes:

  --diff DIFF.tex                 a latexdiff file (\\DIFadd / \\DIFdel markup)
  --old OLD.tex --new NEW.tex     a before/after LaTeX pair (runs `latexdiff` if available)
  --old OLD.md  --new NEW.md      a before/after Markdown pair

Output (stdout, or --out PATH): changed sections, changed spans, the flags
references_changed / methods_or_data_changed, and a recommended subagent
re-dispatch list keyed to the registry (S-AB … S-CD).

Pure standard library. No network. Does not touch the manifest — that is the
orchestrator's job.
"""

import argparse
import difflib
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys

# --- registry mapping ------------------------------------------------------
# section-title keyword -> subagent ID. First match wins; order matters.
SECTION_KEYWORDS = [
    (r"abstract|plain.?language|title", "S-AB"),
    (r"introduction|background|motivation", "S-IN"),
    (r"data and method|methods?|methodology|approach|model setup|procedure", "S-ME"),
    (r"results?|observations?|findings", "S-RE"),
    (r"discussion|interpretation", "S-DI"),
    (r"conclusion|summary and conclusion|concluding", "S-CO"),
    (r"figure|table|caption", "S-FD"),
    (r"data availability|code availability|reproducib|software|open.?science|acknowledg", "S-RP"),
    (r"references|bibliography|works cited", "S-CD"),
]

REF_PATTERNS = re.compile(r"\\cite|\\bibitem|\\citep|\\citet|references|bibliography", re.I)
METHODS_DATA_PATTERNS = re.compile(
    r"\\url|\\href|\bdoi\b|https?://|zenodo|github|figshare|dryad|\.py\b|\.ipynb|"
    r"availability|reproducib|software|code|dataset|method", re.I)

TEX_SECTION_RE = re.compile(r"\\(?:sub)*section\*?\{([^}]*)\}", re.I)
MD_HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
DIFADD_RE = re.compile(r"\\DIFadd(?:begin)?\b|\\DIFaddFL?\{", re.I)
DIFDEL_RE = re.compile(r"\\DIFdel(?:begin)?\b|\\DIFdelFL?\{", re.I)


def map_section_to_id(title):
    t = title.lower()
    for pat, sid in SECTION_KEYWORDS:
        if re.search(pat, t):
            return sid
    return None


def sha256_text(text):
    return "sha256:" + hashlib.sha256(text.encode("utf-8", "replace")).hexdigest()


def normalize(text):
    """Cheap normalization for hashing: collapse whitespace."""
    return re.sub(r"\s+", " ", text).strip()


# --- section indexing ------------------------------------------------------
def index_sections(text, kind):
    """Return list of (char_or_line_pos, title). kind in {'tex','md'}."""
    sections = []
    if kind == "tex":
        for m in TEX_SECTION_RE.finditer(text):
            sections.append((m.start(), m.group(1).strip()))
    else:  # md
        for i, line in enumerate(text.splitlines()):
            m = MD_HEADING_RE.match(line)
            if m:
                sections.append((i, m.group(2).strip()))
    return sections


def section_for_pos(sections, pos):
    """Nearest preceding section title for a char/line position."""
    current = "(preamble / front matter)"
    for spos, title in sections:
        if spos <= pos:
            current = title
        else:
            break
    return current


# --- the three input modes -------------------------------------------------
def parse_latexdiff(diff_text):
    """Changed sections + spans from a latexdiff file."""
    sections = index_sections(diff_text, "tex")
    spans = []
    for rx, kind in ((DIFADD_RE, "add"), (DIFDEL_RE, "del")):
        for m in rx.finditer(diff_text):
            title = section_for_pos(sections, m.start())
            excerpt = diff_text[m.start():m.start() + 160].replace("\n", " ")
            spans.append({"section": title, "kind": kind, "excerpt": excerpt})
    return spans, diff_text


def run_latexdiff(old_path, new_path):
    if not shutil.which("latexdiff"):
        return None
    try:
        out = subprocess.run(
            ["latexdiff", old_path, new_path],
            capture_output=True, text=True, timeout=120)
        if out.returncode == 0 and out.stdout:
            return out.stdout
    except Exception:
        pass
    return None


def parse_pair(old_text, new_text, kind):
    """Changed sections + spans from a before/after pair (tex or md)."""
    sections = index_sections(new_text, kind)
    spans = []
    if kind == "tex":
        old_lines = old_text.splitlines(keepends=True)
        new_lines = new_text.splitlines(keepends=True)
    else:
        old_lines = old_text.splitlines()
        new_lines = new_text.splitlines()

    sm = difflib.SequenceMatcher(a=old_lines, b=new_lines)
    # build a line-index -> char-position map for tex section lookup
    if kind == "tex":
        char_pos, acc = [], 0
        for ln in new_lines:
            char_pos.append(acc)
            acc += len(ln)

    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            continue
        if kind == "tex":
            pos = char_pos[j1] if j1 < len(char_pos) else (char_pos[-1] if char_pos else 0)
        else:
            pos = j1
        title = section_for_pos(sections, pos)
        snippet = " ".join((new_lines[j1:j2] or old_lines[i1:i2])).strip()
        spans.append({"section": title, "kind": tag, "excerpt": snippet[:160]})
    return spans, new_text


# --- assembly --------------------------------------------------------------
def build_changes(spans, full_text, manuscript_id, fmt):
    changed_sections = sorted({s["section"] for s in spans})
    blob = " ".join(s["excerpt"] for s in spans) + " " + " ".join(changed_sections)

    references_changed = bool(REF_PATTERNS.search(blob))
    methods_or_data_changed = bool(METHODS_DATA_PATTERNS.search(blob))

    redispatch = set()
    for sec in changed_sections:
        sid = map_section_to_id(sec)
        if sid:
            redispatch.add(sid)
    if references_changed:
        redispatch.add("S-CD")
    if methods_or_data_changed:
        redispatch.add("S-RP")
    # any results/discussion/abstract change implies a C4 evidence re-trace
    c4_retrace = any(s in redispatch for s in ("S-RE", "S-DI", "S-AB", "S-CO"))

    return {
        "manuscript_id": manuscript_id,
        "format": fmt,
        "manuscript_hash": sha256_text(normalize(full_text)) if full_text else None,
        "changed_sections": changed_sections,
        "changed_spans": spans,
        "references_changed": references_changed,
        "methods_or_data_changed": methods_or_data_changed,
        "recommend_redispatch": sorted(redispatch),
        "c4_evidence_retrace": c4_retrace,
        "notes": (
            "Diffs are textual: a changed equation, swapped figure, or moved "
            "number may not register as a section change. The orchestrator should "
            "re-dispatch S-RP/S-CD and the C4 trace when their INPUTS change, not "
            "just when prose section labels change (SKILL.md Step 1.5 caveat)."
        ),
    }


def read(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--diff", help="a latexdiff .tex file")
    ap.add_argument("--old", help="before file (.tex or .md)")
    ap.add_argument("--new", help="after file (.tex or .md)")
    ap.add_argument("--manuscript-id", default="manuscript")
    ap.add_argument("--out", help="write changes.json here (default: stdout)")
    args = ap.parse_args()

    if args.diff:
        diff_text = read(args.diff)
        spans, full = parse_latexdiff(diff_text)
        fmt = "latexdiff"
    elif args.old and args.new:
        ext = os.path.splitext(args.new)[1].lower()
        old_text, new_text = read(args.old), read(args.new)
        if ext in (".tex", ".latex"):
            generated = run_latexdiff(args.old, args.new)
            if generated is not None:
                spans, _ = parse_latexdiff(generated)
                fmt = "tex-pair (latexdiff)"
            else:
                spans, _ = parse_pair(old_text, new_text, "tex")
                fmt = "tex-pair (line diff; latexdiff not found)"
            full = new_text
        elif ext in (".md", ".markdown"):
            spans, full = parse_pair(old_text, new_text, "md")
            fmt = "md-pair"
        else:
            ap.error("--new must be .tex or .md")
    else:
        ap.error("supply either --diff, or both --old and --new")

    result = build_changes(spans, full, args.manuscript_id, fmt)
    payload = json.dumps(result, indent=2, ensure_ascii=False)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(payload + "\n")
        print(f"wrote {args.out}  "
              f"({len(result['changed_sections'])} changed sections, "
              f"re-dispatch: {', '.join(result['recommend_redispatch']) or 'none'})",
              file=sys.stderr)
    else:
        print(payload)


if __name__ == "__main__":
    main()
