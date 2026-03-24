---
name: homework-grader
description: >
  Use this skill whenever a user wants to grade student homework from handwritten images — 
  whether scanned, photographed, or taken on an iPad. Triggers include: "grade these homeworks", 
  "mark student submissions", "check student answers against the solution key", "parse handwritten 
  homework", "score student assignments", or any request involving images of handwritten student 
  work that should be compared to a solution key. Also trigger when the user provides multiple 
  student image sets alongside a PDF or image solution key and wants a graded spreadsheet output. 
  Subject areas include geophysics, earth science, math, and equations. Always use this skill when 
  student work is handwritten and needs structured, scored grading output — even if the user just 
  says "can you grade these?" with images attached.
---

# Homework Grader Skill

Grades multi-page handwritten student homework submissions against a solution key. Outputs a 
consolidated Excel spreadsheet with per-question scores, partial credit, mismatch flags, and 
a total score per student.

---

## Overview of the Workflow

1. **Ingest the solution key** (PDF or image) → parse and number all questions
2. **Ingest student submissions** (multiple images per student) → parse, stitch pages, detect questions
3. **Match student answers to solution key questions** (auto-detect first, then anchor to key)
4. **Grade each matched answer** with partial credit scoring
5. **Flag mismatches** — missing questions, unmatched answers, ambiguous numbering
6. **Write the output spreadsheet** using the xlsx skill

Read `references/parsing-strategy.md` for detailed image parsing and OCR guidance.  
Read `references/matching-and-grading.md` for question matching logic and scoring rubrics.  
Read `references/spreadsheet-schema.md` for the exact output spreadsheet format.

---

## Step 1 — Collect Inputs

Ask the user for the following if not already provided:

- **Solution key**: a PDF (typed) or image. This is the ground truth.
- **Student submissions**: one or more images per student, grouped by student. Ask the user how the students are identified (file name convention, folder, or manually labelled).
- **Point values**: Does each question have equal weight, or does the user want to specify per-question points? Default: equal weight, total = 100.
- **Partial credit policy**: Default policy is described in `references/matching-and-grading.md`. Ask only if the user wants to override.

If the user uploads files directly in the chat, accept them. If files are on disk, they will be at `/mnt/user-data/uploads/`.

---

## Step 2 — Parse the Solution Key

Follow the detailed parsing guidance in `references/parsing-strategy.md`, Section 1.

**Quick summary:**
- If PDF: extract text directly using `pdfplumber` (preferred) or `pymupdf`. Fall back to vision if extraction yields garbled text (scanned PDF).
- If image: send directly to Claude vision with the structured extraction prompt in `references/parsing-strategy.md`.
- Output: a numbered list of questions with their canonical answers, e.g.:

```
Q1: Define P-wave velocity. Answer: Speed of compressional waves through a medium, ~6 km/s in continental crust.
Q2: Calculate depth given two-way travel time of 1.2s and v=3000 m/s. Answer: depth = (v × t) / 2 = 1800 m
...
```

Store this as `solution_key: list[dict]` with fields `q_num`, `q_text`, `answer_text`, `points`.

---

## Step 3 — Parse Student Submissions

For each student, process their image set in order. Follow `references/parsing-strategy.md`, Section 2.

**Key rules:**
- Treat multiple images as ordered pages of a single document. Sort by filename if numeric suffix is present (e.g., `student1_p1.jpg`, `student1_p2.jpg`); otherwise ask the user for page order.
- Use Claude's vision to extract all handwritten content from each image.
- Concatenate extracted text across pages before attempting question detection.
- Extract student identifier from filename or ask the user.

Output per student: `raw_text: str`, `detected_answers: list[dict]` with fields `detected_q_label` (what the student wrote, e.g. "Q3", "3.", "iii", or None if no label), `answer_text`, `page_number`.

---

## Step 4 — Match Student Answers to Solution Key

Follow `references/matching-and-grading.md`, Section 1 for full logic.

**Two-pass matching strategy:**

**Pass 1 — Auto-detect:** Try to map `detected_q_label` to `q_num` in the solution key.
- Normalise labels: "Q3", "3.", "3)", "iii", "(3)" all → `3`
- If all detected labels map cleanly and cover ≥ 70% of solution key questions → use auto-detect mapping

**Pass 2 — Content anchor fallback:** If auto-detect fails (missing labels, ambiguous numbering, <70% coverage):
- Use semantic similarity: compare `answer_text` content to `answer_text` in solution key
- For math/equations: check if numerical values, variables, and formula structure match
- For geoscience: check for domain-specific keywords (velocity, impedance, reflection coefficient, etc.)
- Assign best content-match if similarity score > threshold (see `references/matching-and-grading.md`)

**Flag the following as mismatches:**
- `MISSING`: A solution key question has no matched student answer
- `UNMATCHED`: A student answer has no plausible match in solution key
- `AMBIGUOUS`: Two or more student answers could match the same solution key question
- `REORDERED`: Answer matched via content (not label) — note the original label vs. matched label

---

## Step 5 — Grade Each Matched Answer

Follow `references/matching-and-grading.md`, Section 2 for rubric details.

**Score each matched answer on a 0–4 scale (then scale to point value):**

| Score | Meaning |
|-------|---------|
| 4 | Fully correct — key facts, values, units all present and correct |
| 3 | Mostly correct — minor error, missing unit, small numeric rounding |
| 2 | Partially correct — correct approach, significant error or missing step |
| 1 | Minimal credit — relevant attempt, mostly wrong |
| 0 | Incorrect, blank, or unmatched |

For math/equations:
- Check formula structure first, then numerical result
- Award partial credit for correct setup with arithmetic error

For geoscience/written answers:
- Check for required key concepts (listed in solution key)
- Each missing key concept deducts proportionally

**MISSING questions** → score 0 automatically.  
**UNMATCHED answers** → score 0, flag for instructor review.

---

## Step 6 — Build the Output Spreadsheet

Read `/mnt/skills/public/xlsx/SKILL.md` before writing the spreadsheet.

Follow the schema in `references/spreadsheet-schema.md` exactly.

**Sheet 1: Grade Summary**
- One row per student
- Columns: Student ID, Q1 score, Q2 score, … Qn score, Total Score, Total %, Flags (count of mismatches)

**Sheet 2: Mismatch Flags**
- One row per flagged item
- Columns: Student ID, Flag Type (MISSING / UNMATCHED / AMBIGUOUS / REORDERED), Solution Key Q#, Student Label, Notes

**Sheet 3: Parsed Answers (Detail)**
- One row per student × question
- Columns: Student ID, Q#, Student's Answer (transcribed), Expected Answer, Score (0–4), Points Awarded, Max Points, Grader Notes

Apply conditional formatting:
- Red fill for score = 0 in Grade Summary
- Yellow fill for REORDERED or AMBIGUOUS flags
- Orange fill for MISSING flags

Save to `/mnt/user-data/outputs/homework_grades.xlsx` and present to user.

---

## Step 7 — Present Results

After writing the file, give the user a brief summary:
- Total students graded
- Class average score (%)
- Number of students with at least one mismatch flag
- Most commonly missed question (if any)

Call `present_files` with the xlsx path.

---

## Error Handling

- **Image too blurry to parse**: Note in Parsed Answers sheet as `ILLEGIBLE`, score 0, flag for manual review.
- **Student wrote in a language other than expected**: Flag as `LANGUAGE_MISMATCH`, attempt translation, note uncertainty.
- **Solution key has sub-questions (1a, 1b)**: Treat each sub-question as an independent question row.
- **Duplicate student IDs**: Warn the user and append `_dup` to the second occurrence.
