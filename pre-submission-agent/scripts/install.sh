#!/usr/bin/env bash
#
# install.sh — wire the Denolle pre-submission reviewer into Claude Code / Desktop
# and build the claude.ai upload bundle.
#
# The single source of truth is skills/pre-submission-reviewer/ (SKILL.md +
# references/ + profiles/). This script only *copies* and *generates* from it:
#
#   1. project copy   -> .claude/skills/pre-submission-reviewer/   (regenerated)
#   2. user copy      -> ~/.claude/skills/pre-submission-reviewer/  (every project)
#   3. subagents      -> .claude/agents/presub-*.md                 (thin personas)
#   4. upload bundle  -> dist/pre-submission-reviewer.zip           (for claude.ai)
#
# Re-run it after editing the source. Nothing here is hand-maintained.
#
# Flags:  --no-user   skip the ~/.claude copy (project-only install)
#         --no-zip    skip building the claude.ai zip
#         --help
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="$REPO_ROOT/skills/pre-submission-reviewer"
SKILL_NAME="pre-submission-reviewer"

DO_USER=1
DO_ZIP=1
for arg in "$@"; do
  case "$arg" in
    --no-user) DO_USER=0 ;;
    --no-zip)  DO_ZIP=0 ;;
    --help|-h)
      sed -n '2,30p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) echo "unknown flag: $arg (try --help)" >&2; exit 2 ;;
  esac
done

[ -f "$SRC/SKILL.md" ] || { echo "ERROR: source not found at $SRC" >&2; exit 1; }

say() { printf '  %s\n' "$1"; }

echo "Pre-submission reviewer — install"
echo "source: $SRC"

# --- 1. project copy -------------------------------------------------------
PROJ_SKILLS="$REPO_ROOT/.claude/skills/$SKILL_NAME"
rm -rf "$PROJ_SKILLS"
mkdir -p "$PROJ_SKILLS"
cp -R "$SRC/." "$PROJ_SKILLS/"
say "project skill -> .claude/skills/$SKILL_NAME/"

# --- 2. user copy ----------------------------------------------------------
if [ "$DO_USER" -eq 1 ]; then
  USER_SKILLS="$HOME/.claude/skills/$SKILL_NAME"
  rm -rf "$USER_SKILLS"
  mkdir -p "$USER_SKILLS"
  cp -R "$SRC/." "$USER_SKILLS/"
  say "user skill    -> ~/.claude/skills/$SKILL_NAME/"
else
  say "user skill    -> skipped (--no-user)"
fi

# --- 3. subagent personas (generated from references/) ---------------------
AGENTS_DIR="$REPO_ROOT/.claude/agents"
mkdir -p "$AGENTS_DIR"
rm -f "$AGENTS_DIR"/presub-*.md

# name | ID | reference file | scope
SUBAGENTS=(
  "presub-abstract|S-AB|section_abstract.md|Title, abstract, plain-language summary"
  "presub-introduction|S-IN|section_introduction.md|Introduction"
  "presub-methods|S-ME|section_methods.md|Methods / Data & Methods"
  "presub-results|S-RE|section_results.md|Results"
  "presub-discussion|S-DI|section_discussion.md|Discussion"
  "presub-conclusions|S-CO|section_conclusions.md|Conclusions"
  "presub-figures-data|S-FD|section_figures_data.md|Figures, tables, captions, equations (cross-cutting)"
  "presub-reproducibility|S-RP|section_reproducibility.md|Whole computational workflow — reproducibility & open science"
  "presub-citation-diversity|S-CD|section_citation_diversity.md|Whole reference list — citation & idea diversity"
)

for entry in "${SUBAGENTS[@]}"; do
  IFS='|' read -r name id file scope <<<"$entry"
  cat > "$AGENTS_DIR/$name.md" <<EOF
---
name: $name
description: Pre-submission reviewer subagent $id — $scope. Spawned by the pre-submission-reviewer orchestrator; not invoked directly by the user.
tools: Read, Grep, Glob
---

You are subagent **$id** of the Denolle pre-submission reviewer.

Your full system prompt and checklist is the reference file:
\`skills/pre-submission-reviewer/references/$file\`
Read it first and follow it exactly.

Scope: **$scope** — review ONLY this slice of the manuscript.

Rules:
- Apply only your own checklist. Do not review other sections.
- Honor the author voice profile passed by the orchestrator (voice and citation
  values only; never override soundness, reproducibility, or evidence checks).
- Emit ONE findings block keyed by your ID (e.g. \`$id.1 PASS — …\`), with the tier
  feed and ordered top fixes your reference file specifies.
- You NEVER write the final report. The orchestrator synthesizes the blocks.
EOF
done
say "subagents     -> .claude/agents/presub-*.md (${#SUBAGENTS[@]} personas)"

# --- 4. claude.ai upload bundle -------------------------------------------
if [ "$DO_ZIP" -eq 1 ]; then
  if command -v zip >/dev/null 2>&1; then
    DIST="$REPO_ROOT/dist"
    mkdir -p "$DIST"
    ZIP="$DIST/$SKILL_NAME.zip"
    rm -f "$ZIP"
    ( cd "$REPO_ROOT/skills" && zip -r -q "$ZIP" "$SKILL_NAME" -x '*.DS_Store' )
    say "upload bundle -> dist/$SKILL_NAME.zip"
  else
    say "upload bundle -> skipped (zip not installed)"
  fi
else
  say "upload bundle -> skipped (--no-zip)"
fi

echo "Done."
echo
echo "Next:"
echo "  Claude Code   : restart, then 'run a pre-submission review on this paper'"
echo "  Claude.ai     : Settings -> Capabilities -> Skills -> Upload skill -> dist/$SKILL_NAME.zip"
echo "  Cursor/Copilot/Codex: no install — adapters are committed (see README)."
