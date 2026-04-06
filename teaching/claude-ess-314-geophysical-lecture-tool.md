---
name: claude-ess-314-geophysical-lecture-tool
description: >
  Use for converting, refactoring, or authoring ESS 314 geophysics content: lectures, slide decks,
  figure scripts, discussion sections, labs, AI literacy activities, or build pipeline config.
  Triggers: "convert this lecture", "audit this deck", "replace figures", "design a discussion",
  "update the TOC", or any ESS 314 reference. Always use when project PDFs are ZIP archives of
  JPEG slides. Supersedes geophysics-lecture-author.
---
 
# Unified Skill File: Agentic AI for Open-Access Course Authorship
 
## About This Document
 
This is the complete, annotated skill file used to convert a proprietary slide-deck-based geophysics course into an open-access, ADA-compliant JupyterBook textbook — the first openly licensed introductory geophysics textbook for undergraduate Earth Sciences students.
 
**Course:** ESS 314 – Introduction to Geophysics, University of Washington, Spring 2026
**Live site:** [uw-geophysics-edu.github.io/ess314](https://uw-geophysics-edu.github.io/ess314)
**Repository:** [github.com/uw-geophysics-edu/ess314](https://github.com/uw-geophysics-edu/ess314)
**Author:** Marine Denolle, University of Washington
 
### How this file works
 
This document is a *machine-readable pedagogical specification*. It tells an AI assistant — in this case, Claude (Anthropic) — exactly what standards to meet when generating course content. A parallel instruction set governs code generation in GitHub Copilot (VS Code). Together, they form a two-agent architecture:
 
| Agent | Platform | Role | Key Strengths |
|-------|----------|------|---------------|
| **Content Author** | Claude (claude.ai, Projects) | Lecture prose, slide decks, figure scripts, discussion guides, assessments | Long-context reasoning, pedagogical structuring, research synthesis, MyST Markdown |
| **Build Engineer** | GitHub Copilot (VS Code) | JupyterBook build pipeline, CI/CD, environment management, figure rendering | Code completion, file-system awareness, terminal integration, Git workflow |
 
The instructor is the orchestrating layer — providing domain expertise, quality judgment, and the "accept/reject/redirect" decisions that keep both agents on track.
 
### Why publish this?
 
Three reasons:
 
1. **Reproducibility.** Other educators can adapt this skill file for their own courses.
2. **Transparency.** If we ask students to document their AI use (LO-7), we should model that practice.
3. **Contribution to the discourse.** Most accounts of AI in education focus on student-facing tools. This documents the *instructor-facing* workflow — AI as a collaborator in course design, not just a tutoring chatbot.
 
---
 
## Part I — Course Context (Shared Across Both Agents)
 
Both the Claude skill and the Copilot instructions share this foundational context. It defines *what* we are building and *why*, independent of any specific AI tool.
 
### The Problem We Are Solving
 
The starting materials for ESS 314 were:
 
- **A paywalled textbook** (Lowrie & Fichtner, 2020) used as the primary reference — excellent content, but not open-access
- **A proprietary slide deck** (~40 lectures) containing screenshots of research figures, textbook diagrams, and paper figures — not ADA-compliant, with pervasive copyright issues
- **Weekly labs** partially misaligned with lecture content and not designed around a coherent pedagogical arc
 
The goal is not to change *what* is taught, but to radically improve *how* it is delivered:
 
- **Open access:** Every figure Python-generated or openly licensed. No paywalled screenshots.
- **ADA compliant:** Alt text on every figure, colorblind-safe palettes, high-contrast slides, logical reading order.
- **Pedagogically coherent:** Every lecture follows the same reasoning arc (motivation → physics → math → forward problem → inverse problem → application). No more "list of methods" lectures.
- **Computationally reproducible:** Every figure has a generating script. Every derivation has a companion notebook.
- **AI-literate:** AI literacy woven throughout as a learning objective, not bolted on.
 
### Course Architecture
 
The repository structure is modeled after the proven layout from `uw-geophysics-edu/ess-412-512-intro2seismology`, adapted for the broader scope of ESS 314:
 
```
ess314/                          # Public repository
├── _config.yml                  # JupyterBook configuration
├── _toc.yml                     # Table of contents (format: jb-book, parts for modules)
├── intro.md                     # Course landing page
├── syllabus.md                  # Full syllabus with LOs and LO-OUTs
├── lectures/
│   ├── 01_intro_course.md       # MyST Markdown lecture files
│   ├── 02_what_is_geophysics.md
│   ├── ...
│   └── 29_synthesis.md
├── notebooks/
│   ├── Lab1-Intro-Python.ipynb  # Every notebook: Colab badge as first cell
│   ├── ...
│   └── Lab8-Magnetics.ipynb
├── slides/
│   ├── week01/
│   │   ├── lecture_01_slides.md  # Marp slide decks
│   │   └── lecture_02_slides.md
│   └── ...
├── discussions/
│   ├── session_01.md            # Discussion section guides
│   └── ...
├── assets/
│   ├── figures/                 # Python-generated figures
│   ├── scripts/                 # Figure generation scripts
│   └── ai_gen/                  # AI-generated illustrations with logged prompts
├── _static/
│   ├── logo.png                 # Course logo (light variant)
│   ├── logo-dark.png            # Course logo (dark variant)
│   ├── favicon.png              # Browser favicon
│   └── custom.css               # Custom JupyterBook styling
├── .github/
│   └── workflows/
│       └── deploy-book.yml      # GitHub Actions: build & deploy to Pages
├── ai_skills/                   # Student-facing AI literacy materials
├── career/                      # Career prospects module
├── references.bib               # Shared BibTeX bibliography
├── pixi.toml                    # Pixi environment & task definitions
├── LICENSE                      # Open-source license
└── CONTRIBUTING.md              # Contribution guidelines
 
ess314-instructor/               # Private repository (sibling directory)
├── assessment_keys/
├── ta_guides/
├── student_exemplars/
└── governance/
```
 
**Structural convention:** In `_toc.yml`, labs are collected under a single "Labs" section at the end of the TOC, after all lecture modules. This keeps the reader's navigation focused on the conceptual arc while labs remain easily accessible.
 
### Learning Objectives (LO-1 through LO-7)
 
Every artifact produced by either agent must map explicitly to at least two of these:
 
| ID | Objective |
|----|-----------|
| LO-1 | Analyze and explain how geophysical observables arise from Earth properties and physical processes |
| LO-2 | Apply simplified physical models and mathematical frameworks to predict how subsurface structure influences observations |
| LO-3 | Formulate the relationship between data, model parameters, and forward models; interpret misfit; recognize non-uniqueness |
| LO-4 | Critically evaluate the strengths, assumptions, and limitations of geophysical methods |
| LO-5 | Use computational tools to implement forward models, explore parameter sensitivity, and compare with observations |
| LO-6 | Communicate geophysical reasoning through figures, written reports, and discussion with explicit assumptions and uncertainties |
| LO-7 | Use generative AI tools responsibly to support coding, visualization, and self-assessment while critically evaluating outputs |
 
### Learning Outcomes (LO-OUT-A through LO-OUT-H)
 
These are the demonstrable skills students practice. At least two must be directly practiced or assessed in each lecture:
 
| ID | Learning Outcome |
|----|-----------------|
| LO-OUT-A | Sketch a survey geometry and predict qualitatively how an interface or anomaly affects an observation |
| LO-OUT-B | Compute simple travel times, ray paths, reflection/refraction geometry, or gravity/magnetic responses |
| LO-OUT-C | Explain *why* a method works physically, not just how to run it |
| LO-OUT-D | Set up a simple inverse problem (parameters, observations, forward relation, residual) |
| LO-OUT-E | Interpret residuals and discuss non-uniqueness, uncertainty, and resolution |
| LO-OUT-F | Decide which method fits a given Earth question and scale |
| LO-OUT-G | Produce a reproducible notebook with labeled figures, units, assumptions, and interpretation |
| LO-OUT-H | Critique a research figure or AI-generated explanation for correctness and hidden assumptions |
 
---
 
## Part II — The Claude Skill File (Content Authorship Agent)
 
This is the operational specification that governs content generation in Claude. It is attached as a "skill" to a Claude Project, meaning it is automatically loaded at the start of every conversation within that project.
 
### Trigger Conditions
 
Use this skill whenever the user wants to:
- Convert, refactor, or author geophysics lecture content from existing slide decks
- Generate MyST Markdown lecture files, Marp slide decks, or figure scripts
- Audit a legacy slide deck for copyright, accessibility, or pedagogical gaps
- Find open-access sources for any lecture topic
- Design discussion sections, assessments, or AI literacy activities
 
**Always use this skill when project files include `.pdf` files that are actually ZIP archives of JPEG slide images.** (The legacy slide decks were exported this way.)
 
---
 
### Input Format and Extraction Protocol
 
The legacy slide decks arrive as `.pdf` files that are actually ZIP archives containing:
- `manifest.json` — page metadata (page count, per-page `has_visual_content` flag, image paths)
- `N.jpeg` — rasterized slide images (1456 × 840 px)
- `N.txt` — extracted text per slide (often sparse; treat as hint, not ground truth)
 
**Extraction protocol (run before writing anything):**
 
```bash
cp /mnt/project/LECTURE_FILE.pdf /tmp/lecture.zip
unzip -o /tmp/lecture.zip -d /tmp/lecture_slides/
cat /tmp/lecture_slides/manifest.json
```
 
Then view each slide image. Read ALL slides before writing. Capture exact equation notation. For `has_visual_content: true` slides, always view the image — it *is* the content.
 
---
 
### Phase 1: Slide Audit (Always Produce First)
 
Before writing any content, produce a structured audit and present it for instructor confirmation:
 
```markdown
## Slide Audit: [Lecture Title]
**File:** filename.pdf | **Slides:** N | **Date:** [course date]
 
### Content Inventory
| # | Type | Summary | Figure Source | Copyright | Action |
|---|------|---------|---------------|-----------|--------|
| 1 | Title | ... | — | ✅ | — |
| 2 | Figure | Rayleigh wave diagram | Lowrie Fig 3.12 | ❌ | [PYTHON-REGEN] |
 
### Pedagogical Gap Analysis
| Criterion | Status | Gap to Fill |
|-----------|--------|-------------|
| LOs stated in deck | ❌/⚠️/✅ | |
| Geoscientific motivation | ❌/⚠️/✅ | |
| Mathematical framework complete | ❌/⚠️/✅ | |
| Forward problem addressed | ❌/⚠️/✅ | |
| Inverse problem addressed | ❌/⚠️/✅ | |
| Research horizon present | ❌ (always missing) | Add §8 |
| Societal relevance hook | ❌ (always missing) | Add §9 |
 
### Copyright Inventory
[Every figure with external source. Tag: PYTHON-REGEN | AI-GEN | OPEN-CC | OPEN-PD]
 
### Open-Access Sources to Search
[3–5 specific topics to search for supplementary material]
```
 
---
 
### Phase 2: Open-Access Source Research (Required Before Writing)
 
This phase is not optional. The entire point is to build a textbook *independent* of paywalled sources.
 
**Priority source hierarchy:**
 
**Tier 1 — Cite freely, reproduce with attribution:**
- MIT OCW: `ocw.mit.edu` — 12.201 Essentials of Geophysics, 12.510 Introduction to Seismology (CC BY-NC-SA)
- EarthScope/IRIS: `iris.edu` — Teachable Moments, animations, workshop notebooks (CC BY)
- seismo-live: `seismo-live.org` — Community Jupyter notebooks (open source)
- USGS: `usgs.gov` — Public domain (earthquake catalogs, hazard maps, educational publications)
- SCOPED: `scoped.codes` — Open computational seismology notebooks (NSF-funded, CC BY)
- Lowrie & Fichtner (2020) — Available free via UW Libraries; cite chapters, paraphrase (never reproduce text)
- arXiv — Preprints, often open access
 
**Tier 2 — Citation and concept grounding only (no reproduction):**
- Stein & Wysession (2003), Sheriff & Geldart (1995) — Cite section numbers only
- Any paywalled journal paper — Cite DOI, paraphrase concepts, never reproduce figures or text
 
**Search protocol (perform before writing each lecture):**
 
```
1. "[topic] open access lecture notes geophysics undergraduate site:ocw.mit.edu OR site:iris.edu"
2. "[topic] review 2022 2023 2024 open access geophysics"
3. "[topic] Jupyter notebook tutorial seismology obspy earthscope"
4. "[topic] societal applications hazards climate resources 2023 2024"
```
 
Record findings in a source table before writing.
 
---
 
### Phase 3: Write the Lecture Markdown
 
**Output path:** `lectures/lecture_NN_topic.md`
 
**Required front matter:**
 
```yaml
---
title: "[Lecture Title]"
week: W
lecture: N
date: "YYYY-MM-DD"
topic: "[Topic]"
course_lo: ["LO-1", "LO-2", "LO-5"]
learning_outcomes: ["LO-OUT-B", "LO-OUT-C"]
open_sources:
  - "Lowrie & Fichtner 2020 Ch. N (UW Libraries)"
  - "MIT OCW 12.201 §4.X"
  - "IRIS/EarthScope [resource name]"
---
```
 
**Required section sequence (the "Geophysical Reasoning Arc"):**
 
| § | Section | Weight | Purpose |
|---|---------|--------|---------|
| 1 | The Geoscientific Question | ~10% | Motivating narrative — a field observation, scientific puzzle, or recent event |
| 2 | Governing Physics | ~20% | Physical principles; Key Concept admonition boxes |
| 3 | Mathematical Framework | ~30% | Full derivation with all intermediate steps; Notation table before first use |
| 4 | The Forward Problem | ~15% | Given a model, what do we predict? Link to companion notebook |
| 5 | The Inverse Problem | ~10% | How do we infer structure from data? Always present, even if brief |
| 6 | Worked Example | ~10% | Concrete calculation with numerical values; Concept Check questions |
| 7 | Course Connections | — | Explicit links to prior/future lectures, labs, cross-method connections |
| 8 | Research Horizon | — | 2–3 open-access papers from 2022–2025; entry points for graduate research |
| 9 | Societal Relevance | — | Concrete PNW example; specific follow-up resource |
| — | AI Literacy | — | One of four templates (Tool / Reasoning Partner / Epistemics / Prompt Lab) |
| — | Further Reading | — | ≥4 open-access references with DOIs/URLs |
 
### Register and Voice
 
This is a critical convention that emerged through iterative correction:
 
- **Formal textbook prose.** Authoritative declarative sentences. The register should read like Lowrie & Fichtner — not a tutorial, not a blog post, not conversational.
- **No second-person address.** Write "The wave equation describes..." not "You will learn about the wave equation." (The system prompt in Part III uses second-person for student-facing framing; the lecture *prose* does not.)
- **Active voice for physical processes.** "The P-wave arrives first because..." not "It can be shown that..."
- **Acknowledge uncertainty as central to geoscience.** "The data are consistent with..." and "One interpretation is..." are characteristic phrases.
 
---
 
### Phase 4: Figure Handling
 
Every figure in the course needs one of three dispositions, decided during the audit:
 
**Option A — Python Regeneration (preferred)**
 
Write `assets/scripts/fig_DESCRIPTION.py`:
 
```python
"""
fig_DESCRIPTION.py
 
Scientific content: [what the figure shows]
 
Reproduces the scientific content of:
  [Full citation: Author(s), Year. Title. Journal/Source. DOI/URL]
 
Output: assets/figures/fig_DESCRIPTION.png
License: CC-BY 4.0 (this script)
"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib as mpl
 
# ── Global rcParams (MANDATORY at top of every script) ──────────────
mpl.rcParams.update({
    "font.size": 13,           # Base font — never below 13
    "axes.titlesize": 15,
    "axes.labelsize": 13,
    "xtick.labelsize": 12,
    "ytick.labelsize": 12,
    "legend.fontsize": 11,     # Minimum for any individual argument: 11
    "figure.dpi": 150,
    "savefig.dpi": 300,
    "savefig.bbox_inches": "tight",
})
 
# Colorblind-safe palette — WCAG AA compliant
COLORS = ["#0072B2", "#E69F00", "#56B4E9", "#009E73",
          "#D55E00", "#CC79A7", "#000000"]
```
 
**Option B — AI Image Generation** (conceptual/illustrative figures only)
 
Log the prompt in `assets/scripts/fig_DESCRIPTION_prompt.md` with full citation of the original figure.
 
**Option C — Open-Licensed Figure** (CC-BY, CC0, or Public Domain)
 
Include directly with caption attribution. Verify license before embedding.
 
**Conventions enforced through iteration:**
- **Depth axis:** Depth = 0 at top, positive downward. This was a correction applied mid-session and must be enforced in all figure scripts.
- **Font sizes:** 13pt base minimum, no individual argument below 11pt. Enforced after early figures were unreadable at projection scale.
- **No Reddit/unknown-provenance images.** These confer no rights and must be replaced.
 
---
 
### Phase 5: Write the Marp Slide Deck (Required Companion Deliverable)
 
**Output path:** `slides/weekWW/lecture_NN_slides.md`
 
Every lecture produces a companion Marp slide deck. This is the in-class presentation, not a summary.
 
**Required slide sequence:**
1. Title slide (course info, date)
2. Learning objectives slide (LO tags present)
3. Slides 3–N following the pedagogical arc
4. Final slide: Concept Check (3 questions)
 
**Design rules:**
- ≤ 5 bullet points per slide (prefer 3)
- One idea per slide — equations and figures get their own slides
- Font size floor: never below 22px effective; captions 16px minimum
- Colorblind-safe palette for all colored elements
- Alt text on every image (written as `![alt text]`)
- Maximum 25 slides per lecture
- Background image slides: 50% dark overlay mandatory (`rgba(0,0,0,0.50)`)
 
**Figure sourcing in slides:** Every figure must come from Option A (Python-generated), Option B (AI-generated with logged prompt), or Option C (open-licensed via URL). No screenshots, no paywalled captures.
 
**Shared theme:** `ess314.css` with CSS `::before` overlay pattern for background images.
 
---
 
### AI Literacy Integration
 
Every lecture includes one AI literacy section, tied to LO-7. Choose from four templates:
 
1. **AI as a Tool** — ML/AI actively deployed in this subdomain (phase picking, fault detection, facies classification)
2. **AI as a Reasoning Partner** — Prompting strategies for derivations and concept-checking
3. **AI Epistemics** — When to trust AI-generated geoscience content; failure modes
4. **Prompt Lab** — 2–3 student-facing prompts with evaluation criteria
 
The AI literacy arc across the course follows three stages:
1. Passive tutor use (early weeks)
2. AI as writing coach with rubric critique (mid-course)
3. Designing rubric-driven agents (final weeks)
 
This arc is threaded across the course, not back-loaded.
 
---
 
### Accessibility Checklist
 
- [ ] Every figure: `:alt:` text conveys meaning without seeing the image
- [ ] No color-only information (use shape, pattern, or label as secondary encoding)
- [ ] All Python figures: colorblind-safe palette (WCAG AA)
- [ ] Figure captions: scientifically complete as standalone text
- [ ] Equations: all variables defined, units explicit
- [ ] No screenshots of copyrighted figures
 
### Copyright Checklist
 
- [ ] No verbatim text from paywalled sources
- [ ] Every figure: Python-generated | AI-generated (prompt logged) | open-licensed (CC noted)
- [ ] All citations: full reference with DOI or URL
- [ ] Open-access alternatives found and used for every key concept
 
---
 
### Quality Gate (Run Before Every Deliverable)
 
```
[ ] Slides fully read before writing
[ ] Open-access source research completed (≥4 sources found and recorded)
[ ] Slide audit produced and includes copyright inventory
[ ] Syllabus LOs and LO-OUTs mapped (≥2 each)
[ ] Learning objectives stated (3–5, ≥1 at Analysis level or above per Bloom's)
[ ] All 9 sections present (including §8 Research Horizon, §9 Societal Relevance)
[ ] Notation table present, all variables defined before use
[ ] All equations LaTeXed, labeled, with unit check
[ ] Forward problem and inverse problem both addressed
[ ] All figures: Python-gen OR AI-gen prompt OR open-license verified
[ ] AI literacy section present and tied to LO-7
[ ] §8: ≥2 citations to open-access papers from 2022–2025 (verified DOIs)
[ ] §9: specific PNW or real-world example, specific follow-up resource
[ ] Accessibility: alt text + colorblind-safe palette
[ ] Further Reading: ≥4 open-access references with DOIs/URLs
[ ] Cross-reference to companion notebook and lab
[ ] Marp slide deck generated
[ ] Slide deck: all figures use relative paths or verified open-license URLs
[ ] Slide deck: background image slides use 50% rgba overlay
[ ] Slide deck: ≤25 slides, ≤5 bullets/slide, alt text on every image
[ ] Formal register throughout — no second-person, no tutorial tone
[ ] Python figure font sizes: 13pt base, no argument below 11pt
[ ] Depth axis convention: 0 at top, positive downward
```
 
---
 
## Part III — The Copilot Instruction Set (Build Pipeline Agent)
 
This section reproduces the system prompt used in GitHub Copilot (VS Code), which governs the *build pipeline* and *code generation* side of the workflow. It operates on the repository directly and handles tasks that require file-system awareness, terminal integration, and Git workflow management.
 
The Copilot agent is framed as a "teaching assistant for a tenure-track geophysics faculty member" — its mission is to build and maintain the JupyterBook as a polished, professional course site deployed via GitHub Pages.
 
### Role and Scope
 
The Copilot agent handles:
- JupyterBook configuration (`_config.yml`, `_toc.yml`) with MyST Markdown rendering
- Pixi environment management (`pixi.toml`)
- GitHub Actions for automated deployment to GitHub Pages
- MyST Markdown for rich lecture notes with LaTeX, cross-references, admonitions, and bibliography
- Google Colab integration (every notebook starts with a Colab badge)
- Custom CSS, logos, favicons, responsive design, and clean typography
 
### Reference Architecture
 
All work is modeled after the proven structure at `uw-geophysics-edu/ess-412-512-intro2seismology`. This existing repository established the patterns (pixi tasks, deploy workflow, TOC organization) that ESS 314 inherits and extends.
 
### `_config.yml` Template
 
The Copilot agent maintains this configuration:
 
```yaml
title: "ESS 314: Geophysics"
author: "Marine Denolle"
copyright: "2026"
logo: _static/logo.png
 
execute:
  execute_notebooks: off
 
repository:
  url: https://github.com/uw-geophysics-edu/ess314
  branch: main
 
html:
  use_issues_button: true
  use_repository_button: true
  use_edit_page_button: true
  favicon: _static/logo.png
  extra_css:
    - _static/custom.css
 
launch_buttons:
  notebook_interface: jupyterlab
  colab_url: https://colab.research.google.com
 
bibtex_bibfiles:
  - references.bib
 
parse:
  myst_enable_extensions:
    - amsmath
    - dollarmath
    - linkify
    - smartquotes
    - substitution
 
sphinx:
  extra_extensions:
    - sphinxcontrib.bibtex
  config:
    bibtex_reference_style: author_year
    exclude_patterns:
      - ".pixi/**"
      - ".venv/**"
      - "_build/**"
      - "**/.ipynb_checkpoints/**"
```
 
### `_toc.yml` Organization Rules
 
The TOC uses `format: jb-book` with `parts:` for module grouping. Labs are collected under a single "Labs" section at the end — never scattered through lecture modules:
 
```yaml
format: jb-book
root: intro
 
parts:
  - caption: "Course Information"
    chapters:
      - file: syllabus
      - file: setup
      - file: lecture_slides
 
  - caption: "Module 1 — Introduction to Geophysical Methods"
    chapters:
      - file: lectures/01_intro_course
      - file: lectures/02_what_is_geophysics
 
  # ... more modules with lectures ...
 
  - caption: "Labs"
    chapters:
      - file: notebooks/Lab1-Intro-Python
      - file: notebooks/Lab2-Python-Ray-Tracing
      # ... all labs collected here ...
 
  - caption: "References"
    chapters:
      - file: bibliography
```
 
### Pixi Configuration
 
```toml
[workspace]
name = "ess314-geophysics"
channels = ["conda-forge"]
platforms = ["osx-64", "osx-arm64", "linux-64", "win-64"]
 
[dependencies]
python = ">=3.11,<3.13"
jupyter = ">=1.0"
jupyterlab = ">=3.0"
jupyter-book = ">=1.0,<2"
matplotlib = ">=3.5"
numpy = ">=1.20"
scipy = ">=1.7"
 
[tasks]
lab = "jupyter lab"
build-book = "jupyter book build ."
serve-book = "python -m http.server --directory _build/html 8000"
clean = "rm -rf _build"
```
 
### GitHub Actions Deployment
 
The `deploy-book.yml` workflow:
1. Checks out the repo
2. Sets up pixi (`prefix-dev/setup-pixi@v0.9.3`)
3. Builds the book (`pixi run build-book`)
4. Uploads `_build/html` as a Pages artifact
5. Deploys to GitHub Pages via `actions/deploy-pages@v4`
 
Triggers on pushes to `main` and `workflow_dispatch`.
 
### Notebook Conventions
 
**Colab badge (mandatory first cell in every notebook):**
 
```markdown
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/uw-geophysics-edu/ess314/blob/main/{PATH_TO_NOTEBOOK})
```
 
**Notebook structure:**
1. Colab badge (first cell — non-negotiable)
2. Title and learning objectives
3. Setup / imports cell
4. Content sections with clear headers
5. Exercises with scaffolded code cells
6. Summary / key takeaways
 
### MyST Markdown Conventions (Copilot-Specific)
 
- Inline math: `$...$` | Display math: `$$...$$` or `{math}` directive
- Citations: `{cite:t}\`Author2024\`` (textual) | `{cite:p}\`Author2024\`` (parenthetical)
- Filtered bibliography at bottom of pages that use citations:
  ````markdown
  ```{bibliography}
  :filter: docname in docnames
  ```
  ````
- Admonitions: `{note}`, `{warning}`, `{tip}`, `{important}`, `{seealso}`
- Figures: `{figure}` directive with `:name:`, `:alt:`, `:width:`, and caption
 
### Copilot Workflow (7-Step Protocol)
 
When asked to create or modify course content:
 
1. **Assess current state** — Read existing `_toc.yml`, `_config.yml`, `pixi.toml`, and directory structure
2. **Plan changes** — Break work into trackable steps
3. **Scaffold missing infrastructure** — Create config files, workflows, static assets if not present
4. **Create content** — Write lectures (MyST `.md`) or notebooks (`.ipynb`) as requested
5. **Update TOC** — Add new files to `_toc.yml`, keeping labs in the final "Labs" section
6. **Validate** — Check that all files referenced in `_toc.yml` exist, Colab badges are correct, pixi tasks work
7. **Test build** — Run `pixi run build-book` to verify
 
### Copilot Hard Constraints
 
- **Never** create a notebook without a Colab badge as the first cell
- **Never** scatter labs throughout the TOC — they go in one "Labs" section at the end
- **Never** use conda when pixi is available — pixi is the preferred environment manager
- **Never** skip `_toc.yml` updates when adding new content files
- **Never** use deprecated Jupyter Book v1 syntax — use current MyST/Sphinx patterns
- **Always** preserve existing content when reorganizing — never delete without confirmation
- **Always** use the reference architecture structure unless explicitly overridden
 
---
 
## Part IV — Operational Conventions (Learned Through Iteration)
 
These conventions were not in the original skill file or system prompt. They emerged through working sessions — corrections, redirections, and accumulated decisions that now govern all future output. This is arguably the most valuable section, because it documents what *only becomes apparent through practice*.
 
### Prose Register Corrections
 
**Problem discovered:** Early lecture drafts used tutorial-style second-person ("You will learn...", "Let's explore...") and conversational asides. This was inconsistent with the authoritative tone of the target textbook.
 
**Convention enforced:** Formal declarative prose throughout. "The wave equation describes the propagation of disturbances through an elastic medium" — not "In this lecture, we'll learn about the wave equation." The register matches Lowrie & Fichtner, not a MOOC transcript.
 
### Figure Font Size Enforcement
 
**Problem discovered:** Early Python-generated figures used matplotlib defaults (10pt), which were unreadable when projected in a lecture hall.
 
**Convention enforced:** Every figure script begins with an `mpl.rcParams.update()` block. Base font 13pt, no individual argument below 11pt. This is checked in the quality gate.
 
### Depth Axis Convention
 
**Problem discovered:** Some figure scripts plotted depth increasing upward (mathematical convention), while geophysics universally uses depth increasing downward.
 
**Convention enforced:** Depth = 0 at surface, positive downward. Applied retroactively to all existing figure scripts.
 
### SVG-to-PNG Rendering
 
**Problem discovered:** The course logo (SVG with CSS media queries for light/dark variants) could not be accurately exported to PNG using matplotlib or ImageMagick.
 
**Convention enforced:** Browser-based rendering via Playwright/Chromium for any SVG that uses CSS features. This is a build-pipeline concern handled by the Copilot agent.
 
### Copyright Figure Triage
 
**Problem discovered:** Every legacy slide deck contains copyrighted figures (Cambridge University Press, W.W. Norton, Agile Scientific). The default assumption must be that *every* figure in the old slides is copyrighted until proven otherwise.
 
**Convention enforced:** Python regeneration is the preferred replacement path. AI-generated images are the fallback for conceptual/illustrative figures. Open-license URLs (CC-BY/PD only, verified) are the third option. Reddit images and unknown-provenance web images confer no rights and are never used.
 
### Iterative Directive Communication
 
**Pattern observed:** The most productive working sessions use short, directive follow-up messages that build on prior outputs rather than full re-briefs. The instructor says "fix the axis labels" or "add a notation table before equation 3" rather than restating the entire context.
 
**Implication for skill design:** The skill file must be comprehensive enough that the agent maintains context across these short exchanges without drift. This is why the quality gate is long — it serves as a checklist the agent can re-verify after each incremental change.
 
### The Two-Repository Architecture
 
**Design decision:** The public repository (`ess314`) contains all student-facing materials. The private repository (`ess314-instructor`) contains assessment keys, TA guides, student exemplars (with consent workflow), and governance documents. Both are checked out as sibling directories.
 
**Implication for agents:** Neither agent should ever place assessment keys or solutions in the public repository. The Claude agent generates assessment content into the private repo path; the Copilot agent manages the Git workflow for both.
 
---
 
## Part V — Discussion Section Design (A Case Study in Agentic Output)
 
The discussion sections illustrate what this two-agent workflow can produce. Session 1 — "Why Does the Earth Make Noise?" — was designed entirely through the Claude skill, starting from a blank brief and ending with a complete TA guide:
 
- **Format:** 50-minute guided discussion around the IRIS Ground Motion Visualization of the 2011 Tōhoku earthquake
- **Pedagogical frame:** Observe → Hypothesize → Connect → Reflect
- **Exit card:** First entry in the Geophysical Reasoning Portfolio (a quarter-long student artifact)
- **AI literacy tie-in:** Students evaluate whether an AI-generated explanation of the GMV is physically accurate
 
All 10 discussion sessions were designed through the same workflow, with guest speaker sessions, debate formats, jigsaw activities, and a final portfolio synthesis.
 
---
 
## Part VI — How to Adapt This for Your Own Course
 
If you want to use this approach for your own course, here is what to adapt and what to keep:
 
### Keep (these are general principles)
 
- The phased workflow: audit → research → write → quality gate
- The separation of content authorship (long-context AI) from build pipeline (code-aware AI)
- The quality gate as a machine-checkable specification
- The copyright-clean figure pipeline (Python regeneration > AI generation > open-license)
- The accessibility checklist as a first-class concern, not an afterthought
- The principle that the skill file *is* the pedagogical specification
 
### Adapt (these are ESS 314–specific)
 
- The learning objectives and outcomes (replace with your course's)
- The "Geophysical Reasoning Arc" section structure (replace with your discipline's reasoning pattern — clinical reasoning, engineering design process, historical analysis, etc.)
- The source hierarchy (replace with your field's open-access ecosystem)
- The specific tools (MyST Markdown, Marp, pixi, ObsPy — replace with your stack)
- The Pacific Northwest context (replace with your local examples)
 
### What you will discover through iteration
 
No skill file is complete on first draft. Expect to add conventions for:
- Register and tone (you will correct it at least three times before it sticks)
- Domain-specific plotting conventions (axis directions, unit systems, color conventions)
- File naming patterns that your build pipeline requires
- Edge cases in your source material that the AI mishandles consistently
 
Document these as they arise. They are the most valuable part of the skill file.
 
---
 
## Appendix A — Tools and Infrastructure
 
| Tool | Purpose | Notes |
|------|---------|-------|
| JupyterBook + MyST Markdown | Course website and lecture format | `_config.yml` enables MathJax, Colab/Binder launch buttons |
| Marp CLI | Slide deck compilation | Shared `ess314.css` theme; KaTeX for equations |
| pixi | Environment management | Preferred over conda/pip; `pixi.toml` task definitions |
| GitHub Actions | CI/CD | `deploy-book.yml` builds and deploys to GitHub Pages via `actions/deploy-pages@v4` |
| Google Colab | Zero-setup notebook execution | Colab badge mandatory as first cell in every notebook |
| Python / matplotlib | All figure generation | `mpl.rcParams.update()` block mandatory |
| Playwright / Chromium | SVG-to-PNG rendering | Required for CSS media queries in SVG |
| ObsPy | Seismological data access | FDSN client for real earthquake data |
| IRIS / EarthScope | Open educational resources | GMV visualizations, FDSN data services |
| PNSN | Local seismic network | Pacific Northwest context throughout |
| Reference repo | `uw-geophysics-edu/ess-412-512-intro2seismology` | Established the patterns (pixi tasks, deploy workflow, TOC layout) that ESS 314 inherits |
 
## Appendix B — Color Palette
 
All figures, slides, and diagrams use this WCAG AA colorblind-safe palette:
 
| Color | Hex | Use |
|-------|-----|-----|
| Blue | `#0072B2` | Primary data, P-waves |
| Orange | `#E69F00` | Secondary data, S-waves |
| Sky blue | `#56B4E9` | Tertiary, interfaces |
| Green | `#009E73` | Positive anomalies |
| Vermilion | `#D55E00` | Negative anomalies, warnings |
| Pink | `#CC79A7` | Additional category |
| Black | `#000000` | Text, axes, outlines |
 
---
 
*This skill file is released under CC-BY 4.0. Adapt it for your own courses with attribution.*
 
*Last updated: April 2026. Live course: [uw-geophysics-edu.github.io/ess314](https://uw-geophysics-edu.github.io/ess314)*