# Spreadsheet Output Schema

## File: `homework_grades.xlsx`

Three sheets as described below. Build using `openpyxl` (see `/mnt/skills/public/xlsx/SKILL.md`).

---

## Sheet 1: Grade Summary

One row per student. Freeze top row. Auto-fit column widths.

| Column | Header | Type | Notes |
|--------|--------|------|-------|
| A | Student ID | string | From filename or user-provided label |
| B | Q1 Score | float | Points awarded (not raw 0–4 score) |
| C | Q2 Score | float | … |
| … | … | … | One column per solution key question |
| Last-2 | Total Score | float | Sum of all question scores |
| Last-1 | Max Score | float | Sum of max points |
| Last | % Score | float | Total / Max × 100, formatted as percentage |
| +1 | Flags | int | Count of MISSING + UNMATCHED + AMBIGUOUS flags |

**Conditional formatting:**
- Cell fill RED (`FFCCCC`) if `% Score < 50`
- Cell fill YELLOW (`FFFFCC`) if `Flags > 0`
- Score cells: RED if `score == 0`, GREEN if `score == max`

**Add a summary row at the bottom:**
- "Class Average" in Student ID column
- AVERAGE formula for each score column
- AVERAGE for Total Score and % Score

---

## Sheet 2: Mismatch Flags

One row per flag. Sort by Student ID, then Flag Type.

| Column | Header | Type | Notes |
|--------|--------|------|-------|
| A | Student ID | string | |
| B | Flag Type | string | MISSING / UNMATCHED / AMBIGUOUS / REORDERED |
| C | Solution Key Q# | string | The affected question number, or blank |
| D | Student Label | string | What the student wrote, or blank |
| E | Notes | string | Explanation |

**Conditional formatting by Flag Type:**
- MISSING → orange fill (`FFB347`)
- UNMATCHED → red fill (`FF6B6B`)
- AMBIGUOUS → yellow fill (`FFD700`)
- REORDERED → light blue fill (`ADD8E6`)

If no flags exist, write a single row: "No mismatches detected ✓"

---

## Sheet 3: Parsed Answers (Detail)

One row per (student × question). Sort by Student ID, then Q#.

| Column | Header | Type | Notes |
|--------|--------|------|-------|
| A | Student ID | string | |
| B | Q# | string | Solution key question number |
| C | Student Label | string | What the student wrote as question label |
| D | Match Method | string | "auto" or "content" |
| E | Student Answer (Transcribed) | string | Full extracted text; wrap text, max row height 80pt |
| F | Expected Answer | string | From solution key |
| G | Raw Score (0–4) | float | |
| H | Points Awarded | float | |
| I | Max Points | float | |
| J | Grader Notes | string | Why this score was given |
| K | Confidence | string | "high" / "medium" / "low" — from OCR confidence |

**Column widths:** A=15, B=6, C=15, D=10, E=40, F=40, G=12, H=14, I=12, J=40, K=10

---

## Styling constants

```python
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

HEADER_FONT = Font(bold=True, size=11)
HEADER_FILL = PatternFill("solid", fgColor="2E4057")  # dark navy
HEADER_FONT_COLOR = Font(bold=True, color="FFFFFF", size=11)

RED_FILL   = PatternFill("solid", fgColor="FFCCCC")
GREEN_FILL = PatternFill("solid", fgColor="CCFFCC")
YELLOW_FILL = PatternFill("solid", fgColor="FFFFCC")
ORANGE_FILL = PatternFill("solid", fgColor="FFE0B2")
BLUE_FILL  = PatternFill("solid", fgColor="DDEEFF")

WRAP = Alignment(wrap_text=True, vertical="top")
CENTER = Alignment(horizontal="center", vertical="center")

THIN_BORDER = Border(
    left=Side(style='thin'), right=Side(style='thin'),
    top=Side(style='thin'), bottom=Side(style='thin')
)
```
