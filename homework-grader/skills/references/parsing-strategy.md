# Parsing Strategy Reference

## Section 1 — Parsing the Solution Key

### PDF (typed)

```python
import pdfplumber

def extract_solution_key_pdf(path):
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text
```

If `pdfplumber` returns empty or garbled text (common with scanned PDFs), fall back to vision:
- Render each page as an image at 150 DPI using `pdf2image`
- Send each page image to Claude vision with the solution key extraction prompt below

**Install if needed:**
```bash
pip install pdfplumber pdf2image --break-system-packages
apt-get install -y poppler-utils 2>/dev/null
```

### Solution Key Extraction Prompt (vision)

Use this prompt when sending solution key images to Claude vision:

```
You are extracting questions and answers from a typed homework solution key.

For each question found, output a JSON array with this structure:
[
  {
    "q_num": "1",
    "q_text": "Full text of the question",
    "answer_text": "Full expected answer",
    "key_concepts": ["concept1", "concept2"],  // for written answers
    "numerical_value": null,  // fill if answer is a number
    "units": null             // fill if applicable (e.g., "km/s", "m", "MPa")
  }
]

Rules:
- Preserve all sub-questions as separate entries (e.g., "1a", "1b")
- For math: include the formula structure AND the final numeric answer
- For geoscience: list 2-5 key concepts the student must mention for full credit
- Do not skip any question
- Return ONLY the JSON array, no preamble
```

---

## Section 2 — Parsing Student Handwritten Submissions

### Pre-processing images

Before sending to vision, check image quality:
```python
from PIL import Image

def check_image_quality(path):
    img = Image.open(path)
    w, h = img.size
    # Warn if image is very small
    if w < 800 or h < 600:
        return "LOW_RESOLUTION"
    return "OK"
```

If image is low resolution, note it but proceed — Claude vision is robust to moderate quality.

### Page ordering

Sort student images by filename. Common conventions:
- `studentname_1.jpg`, `studentname_2.jpg` → sort numerically on suffix
- `IMG_0042.jpg`, `IMG_0043.jpg` → sort numerically
- No clear order → ask the user before proceeding

### Student Submission Extraction Prompt (vision)

Send **one image at a time**. Use this prompt for each page:

```
You are transcribing a student's handwritten homework submission. This is page {page_num} of {total_pages}.

Extract all written content as accurately as possible. Pay special attention to:
- Mathematical equations and formulas (use LaTeX-like notation if helpful, e.g., v = d/t)
- Numbers and units (e.g., "3.2 km/s", "1800 m", "0.45 g/cm³")
- Question labels the student wrote (e.g., "Q1", "1.", "i)", "(a)")
- Crossed-out text (note as [CROSSED OUT: ...])
- Arrows, diagrams described in words (note as [DIAGRAM: brief description])
- Greek letters and subscripts (e.g., ρ, v_p, Δt)

Output a JSON array — one object per detected answer block:
[
  {
    "detected_q_label": "Q1",  // what the student wrote, or null if unlabelled
    "answer_text": "Full transcribed answer text",
    "has_diagram": false,
    "confidence": "high"  // "high", "medium", or "low" based on legibility
  }
]

If the entire page is illegible, return: [{"detected_q_label": null, "answer_text": "ILLEGIBLE", "confidence": "low"}]
Return ONLY the JSON array.
```

### Multi-page stitching

After extracting all pages for a student, concatenate their `detected_answers` lists in page order. Do **not** merge across pages — keep page_number provenance. This matters for mismatch detection (e.g., a student who skipped Q3 entirely vs. one who answered it on a different page).

### Handling iPad stylus notes

iPad notes (e.g., GoodNotes, Notability exports) are typically cleaner than photos. They may come as:
- **JPEG/PNG exports**: Treat as normal images
- **PDF exports**: Use the PDF extraction path — these often have selectable text, so try `pdfplumber` first

### Handling photos of handwritten notes

- Lighting variations are common — Claude vision handles these well
- Skewed/rotated pages: Claude vision is robust; no need to pre-rotate
- Pencil vs. pen: pencil may be lower contrast — note `"confidence": "low"` in extraction
- Ruled vs. blank paper: no impact on extraction quality
