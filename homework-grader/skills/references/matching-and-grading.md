# Matching and Grading Reference

## Section 1 — Question Matching Logic

### Label normalisation

Before matching, normalise all detected labels to a canonical form:

```python
import re

def normalise_label(raw: str) -> str | None:
    if raw is None:
        return None
    s = raw.strip().lower()
    # Remove common prefixes and punctuation
    s = re.sub(r'^(question|q|problem|prob|part|ex|exercise)\.?\s*', '', s)
    s = re.sub(r'[().\s]', '', s)
    # Convert roman numerals (i, ii, iii, iv, v, vi, vii, viii, ix, x)
    roman = {'i':'1','ii':'2','iii':'3','iv':'4','v':'5',
             'vi':'6','vii':'7','viii':'8','ix':'9','x':'10'}
    if s in roman:
        return roman[s]
    # Convert letter suffixes: "1a" stays "1a", "a" stays "a"
    return s
```

### Pass 1 — Auto-detect matching

```python
def auto_detect_match(student_answers, solution_key):
    mapping = {}
    for ans in student_answers:
        norm = normalise_label(ans['detected_q_label'])
        if norm is None:
            continue
        # Find solution key question with matching normalised number
        for q in solution_key:
            if normalise_label(str(q['q_num'])) == norm:
                mapping[q['q_num']] = ans
                break
    coverage = len(mapping) / len(solution_key)
    return mapping, coverage
```

If coverage ≥ 0.70 → use this mapping and proceed.  
If coverage < 0.70 → proceed to Pass 2.

### Pass 2 — Content anchor fallback

When labels are missing, illegible, or cover < 70% of questions, match by content similarity.

**For geoscience / written answers:**

Send this prompt to Claude:
```
Given the following solution key questions and a student's answers, match each student answer 
to the most likely solution key question based on content similarity.

Solution key:
{json.dumps(solution_key, indent=2)}

Student answers:
{json.dumps(unmatched_student_answers, indent=2)}

For each student answer, identify the best matching solution key question number.
Return JSON: [{"student_answer_index": 0, "matched_q_num": "2", "confidence": "high", "reasoning": "..."}]
Only match if genuinely similar. If no good match exists, set matched_q_num to null.
```

**For math / equations:**

Apply structural matching heuristics first:
- Does the student answer contain a similar variable (e.g., `v`, `depth`, `TWT`, `ρ`)?
- Does the numerical answer (if present) match the solution's `numerical_value` within 5% tolerance?
- Does the formula structure match (same number of operands, same operator type)?

Score content similarity 0–1. Match if similarity > 0.5.

### Mismatch flags

After matching, scan for flags:

```python
def generate_flags(mapping, solution_key, student_answers):
    flags = []
    matched_q_nums = set(mapping.keys())
    matched_student_indices = set(v['index'] for v in mapping.values())

    for q in solution_key:
        if q['q_num'] not in matched_q_nums:
            flags.append({"type": "MISSING", "q_num": q['q_num'], "student_label": None,
                          "notes": "No student answer matched this question"})

    for i, ans in enumerate(student_answers):
        if i not in matched_student_indices:
            flags.append({"type": "UNMATCHED", "q_num": None, 
                          "student_label": ans['detected_q_label'],
                          "notes": f"Student answer '{ans['answer_text'][:60]}...' has no solution key match"})

    for q_num, ans in mapping.items():
        if ans.get('match_method') == 'content':
            flags.append({"type": "REORDERED", "q_num": q_num,
                          "student_label": ans['detected_q_label'],
                          "notes": f"Matched by content (student wrote '{ans['detected_q_label']}', mapped to Q{q_num})"})
    return flags
```

---

## Section 2 — Grading Rubric

### Default scoring scale: 0–4

| Score | Label | Criteria |
|-------|-------|----------|
| 4 | Full credit | All required elements present and correct |
| 3 | Strong | Minor error: missing unit, small rounding, one key concept absent |
| 2 | Partial | Correct approach/setup, significant error, missing major step |
| 1 | Minimal | Relevant attempt, substantial errors, but not blank |
| 0 | No credit | Blank, completely incorrect, or MISSING |

**Convert to points:** `points_awarded = (score / 4) × max_points_for_question`

### Geoscience / Written answer grading

Use this prompt to grade each matched pair:

```
Grade the following student answer against the solution.

Question: {q_text}

Solution key answer: {answer_text}
Required key concepts: {key_concepts}

Student answer: {student_answer_text}

Score the student answer on a 0–4 scale using this rubric:
4 = All key concepts present, correct interpretation
3 = Most key concepts present, minor error or omission  
2 = Some key concepts present, significant gaps or errors
1 = Minimal relevant content, mostly incorrect
0 = Blank or completely wrong

Return JSON: {"score": 3, "grader_notes": "Missing mention of wave impedance contrast, otherwise correct"}
```

### Math / Equations grading

Apply this two-stage check:

**Stage 1 — Formula structure (worth 50% of points):**
- Is the correct formula used?
- Are variables correctly defined and substituted?

**Stage 2 — Numerical result (worth 50% of points):**
- Does the final answer match within 2% tolerance (rounding)?
- Are units correct?

```python
def grade_math_answer(student_text, solution_q):
    score = 0
    notes = []
    
    # Check numerical value
    sol_val = solution_q.get('numerical_value')
    if sol_val is not None:
        # Extract numbers from student answer
        nums = re.findall(r'-?\d+\.?\d*', student_text)
        student_val = float(nums[-1]) if nums else None
        if student_val is not None:
            pct_err = abs(student_val - sol_val) / abs(sol_val) if sol_val != 0 else abs(student_val)
            if pct_err <= 0.02:
                score += 2  # correct numerical result
            elif pct_err <= 0.10:
                score += 1  # close (rounding error)
                notes.append(f"Numerical result off by {pct_err:.1%}")
            else:
                notes.append(f"Incorrect numerical result: got {student_val}, expected {sol_val}")
    
    # Check units
    sol_units = solution_q.get('units', '')
    if sol_units and sol_units.lower() in student_text.lower():
        score += 1
    elif sol_units:
        notes.append(f"Missing or wrong units (expected {sol_units})")
    
    # Check formula structure via vision if needed
    # (handled in SKILL.md by sending to Claude for complex equations)
    
    # Clamp to 0–4
    score = min(score + 1, 4) if score > 0 else 0  # +1 base for attempting
    return score, "; ".join(notes) if notes else "Correct"
```

### Partial credit for REORDERED answers

Apply a small penalty for answers that required content-based matching (suggesting the student may not have answered questions in order, or labelled them differently). Deduct 0.5 from the raw 0–4 score, minimum 0. Note in grader notes: "Answer required content matching; possible question confusion."

### UNMATCHED and MISSING

- **MISSING**: Automatically score 0. Grader note: "No answer found for this question."
- **UNMATCHED**: Score 0. Flag for instructor manual review. Grader note: "Student wrote something here but it could not be matched to any solution key question — instructor review recommended."

---

## Section 3 — Geoscience Domain Keywords

When performing content-anchor matching or grading written geoscience answers, watch for these domain terms as strong matching signals:

**Seismics / Wave propagation:**
velocity, P-wave, S-wave, compressional, shear, impedance, reflection, refraction, Snell's law,
two-way travel time (TWT), normal moveout (NMO), stacking, migration, wavelet, frequency

**Rock physics:**
density, porosity, bulk modulus, shear modulus, Gassmann, fluid substitution, Vp/Vs ratio,
lithology, saturation, compaction

**Well logs / Borehole:**
sonic log, density log, gamma ray, resistivity, neutron porosity, lithology column, depth,
formation top, synthetic seismogram

**Geomechanics:**
stress, strain, Young's modulus, Poisson's ratio, pore pressure, fracture gradient, overburden

**Processing:**
convolution, deconvolution, frequency filter, bandpass, AGC, gain, noise, SNR
