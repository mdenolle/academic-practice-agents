# Writing Solution Keys for the Homework Grader

This guide explains how to write a solution key that works well with the AI grader. A well-structured solution key is the single most important factor in grading accuracy.

---

## What the grader needs

The model reads your solution key as a system prompt and uses it as the ground truth against which it evaluates student submissions. The key must contain enough information for the model to grade confidently without making judgment calls you haven't anticipated.

**Required for each question:**

- The full correct answer, including all intermediate steps for derivations
- The point value and how points are distributed across steps
- Numerical answers with explicit tolerances (e.g., `[accept 9.8–10.2 m/s²]`)
- A list of the most common student errors and how to penalize them
- Whether the derivation cap applies (see below)

**Helpful but optional:**

- Accepted alternative correct approaches (e.g., graphical vs. algebraic derivation)
- Key concepts that must appear for full credit on conceptual questions
- Units that are required or commonly forgotten

---

## Formatting math questions

For derivation or calculation questions, show every step of the solution with intermediate values. The model checks formula structure before checking the numerical result.

```
=== Q2 (6 points) — Calculate wave speed ===

Given: frequency f = 5 Hz, wavelength λ = 1.2 km

Step 1 — Apply v = f·λ:
  v = 5 Hz × 1200 m = 6000 m/s = 6 km/s
  [accept 5880–6120 m/s, i.e. ±2%]

Step 2 — Convert units correctly:
  Must use consistent units (either all SI or all km/s/km)
  [deduct 0.5 pt for unit inconsistency that doesn't affect final answer]

GRADING: 3 pts correct formula setup; 3 pts correct numerical answer with units
COMMON ERROR: using λ in km and f in Hz without converting → answer off by 10³
```

---

## Formatting conceptual questions

For written-answer questions, list the key concepts the student must mention for full credit. Be explicit — the model will look for these terms.

```
=== Q3 (4 points) — Explain why S-waves cannot propagate in fluids ===

Required key concepts (all four needed for full credit):
  1. S-waves require shear stress to propagate
  2. Fluids have zero shear modulus (μ = 0)
  3. No restoring force for transverse displacement in a fluid
  4. Only P-waves (compressional) can propagate in fluids

Accept any phrasing that correctly captures the physics.
Partial credit: 1 pt per key concept present, up to 4 pts.
```

---

## Specifying partial credit rules inline

Write partial credit rules directly in the question section so the model applies them consistently:

```
PARTIAL CREDIT NOTES:
  - Correct formula but wrong numerical substitution: max 3/5
  - Correct answer without any working shown: max 2/5 (derivation cap)
  - Off by factor of 2 due to sign error in exponent: −1 pt
  - Missing units on final answer: −0.5 pt
  - Used approximation sin θ ≈ θ (valid for small angles): full credit if noted
```

---

## Derivation cap policy

By default, the grader enforces a **derivation cap**: if a student writes a correct final answer but shows no intermediate working, they receive at most 50% of the available points for that question.

To **disable the cap for a specific question**, add this note in that question's section:

```
DERIVATION CAP: not applicable for this question (answer-only is acceptable)
```

To **disable the cap entirely** for the homework, remove the `DERIVATION CAP RULE` paragraph from the `SYS` constant in the JSX file.

---

## Keep your solution key private

Real solution keys must **never** be committed to a public repository. They defeat the purpose of the homework and violate academic integrity policies.

The workflow is:
1. Write your solution key in a private file on your machine
2. Paste it into the `SOLUTION_KEY` constant in your local copy of the JSX file
3. Run the grader locally — the key is never sent anywhere except the Anthropic API call
4. The `SOLUTION_KEY` in this repo is always left as a `// TODO` placeholder

The `solution-keys/` folder in this repo contains only the `sample-solution-key.md` as a format reference using a **fictional, original problem**. It does not contain any actual course material.
