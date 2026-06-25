# Review manifest — provenance & iteration state

This file documents the **review manifest**: the JSON record that makes the
Pre-Submission Reviewer *stateful across drafts*. It is loaded in `SKILL.md`
Step 0.5, consumed throughout reconciliation mode, and rewritten in Step 5. It is
**not** a subagent — it has no `S-` ID and no checklist. It is the spine that lets
every iteration be a strict improvement on the last, and the provenance record
that lets us trace what was reviewed, by which version, and what changed.

---

## Why it exists

A stateless reviewer re-derives findings from scratch each run and surfaces a
different subset every time. That makes "every iteration is an improvement" and
"never raise issues not raised before" impossible to honor. The manifest fixes
this by persisting the **Issue Ledger** (the closed set of findings, keyed by
durable IDs) plus **provenance** (version, model, iteration, hash) so the next
run *reconciles* the prior findings instead of re-discovering them.

---

## Location & naming

By default one manifest per manuscript:

```
reviews/<manuscript-id>.review.json
```

`<manuscript-id>` is a stable slug the author chooses (e.g. `denolle2026-tremor`).
The orchestrator looks here in Step 0.5; if absent, this is iteration 1.

---

## Schema

```json
{
  "manuscript_id": "denolle2026-tremor",
  "title": "Deep tremor migration beneath the Olympic Peninsula",
  "skill_version": "2.3",
  "model": "claude-opus-4-8",
  "profile": "default",
  "target_journal": "GRL",
  "manuscript_type": "research article",
  "iteration": 3,
  "manuscript_hash": "sha256:1f3a…",
  "created": "2026-05-01",
  "updated": "2026-06-24",

  "history": [
    {"iteration": 1, "date": "2026-05-01", "model": "claude-opus-4-8",
     "readiness": "Major revision required", "open": 22, "manuscript_hash": "sha256:9b0c…"},
    {"iteration": 2, "date": "2026-06-10", "model": "claude-opus-4-8",
     "readiness": "Revise before submission", "open": 9, "manuscript_hash": "sha256:c44e…"}
  ],

  "ledger": [
    {
      "id": "S-ME.11",
      "criterion": "C2",
      "tier": "Fair",
      "status": "PARTIALLY ADDRESSED",
      "summary": "Sampling rate and taper for the cross-correlation are unstated.",
      "location": "Methods ¶3",
      "first_seen": 1,
      "last_changed": 3,
      "bucket": null
    },
    {
      "id": "S-RP.4",
      "criterion": "C3",
      "tier": "Fatal",
      "status": "NOT ADDRESSED",
      "summary": "No DOI for the processing code; 'available upon request' is non-compliant at AGU.",
      "location": "Data Availability",
      "first_seen": 1,
      "last_changed": 1,
      "bucket": null
    },
    {
      "id": "S-DI.7",
      "criterion": "C4",
      "tier": "Good",
      "status": "INTRODUCED-IN-REVISION",
      "summary": "New paragraph claims a depth dependence not shown in any figure.",
      "location": "Discussion ¶5 (added this revision)",
      "first_seen": 2,
      "last_changed": 2,
      "bucket": "INTRODUCED-IN-REVISION"
    }
  ]
}
```

### Field notes

- **`skill_version` / `model` / `profile` / `target_journal` / `manuscript_type`**
  — the provenance four-plus. If any changed since the last run, the orchestrator
  says so (a changed journal re-calibrates the bar; a changed profile changes
  voice handling).
- **`iteration`** — monotonically increasing; incremented at Step 0.5 on every
  reconciliation run.
- **`manuscript_hash`** — `sha256` of the normalized manuscript text. Used to (a)
  confirm the draft actually changed, and (b) match a "current vs. prior" diff
  when the author supplies no explicit diff.
- **`history`** — append-only; one entry per past iteration with the readiness
  verdict and open-finding count, so the trajectory (22 → 9 → …) is visible.
- **`ledger`** — the closed set of findings. IDs are the same durable handles the
  subagents emit (`S-IN.4`, `C2.4`, `S-RP.4`). Each finding carries its current
  `status` and the iteration it was `first_seen` / `last_changed`.

### Status values (reconciliation verdicts)

| Status | Meaning |
|---|---|
| `OPEN` | First-review finding, not yet revised against |
| `RESOLVED` | Changed text demonstrably fixes it |
| `PARTIALLY ADDRESSED` | Improved but not closed |
| `NOT ADDRESSED` | Unchanged since raised |
| `REGRESSED` | Was better before; the revision worsened it |
| `INTRODUCED-IN-REVISION` | New defect in changed text (quarantine bucket) |
| `INTRODUCED-BY-RECALIBRATION` | New issue only because the target journal changed |

---

## Lifecycle

**Iteration 1 (no manifest).** Run the full review. Build the complete Issue
Ledger from the subagent findings, every item `OPEN`. Write the manifest with
`iteration: 1`, the provenance block, and the manuscript hash.

**Iteration N≥2 (manifest present).** Load it. Run Step 1.5 change detection.
For each ledger finding, assign a reconciliation verdict, citing changed text for
RESOLVED / REGRESSED. Add new findings only from changed spans, into the two
quarantine buckets. Apply the **monotonicity rule**: a finding may not move to a
worse tier than it held last iteration unless tied to changed text; the open set
should shrink or hold, not grow, except via the buckets. Append to `history`,
bump `iteration`, update `manuscript_hash` and `updated`, write back.

**Integrity guard.** A C2/C3/C4 finding is `RESOLVED` only when changed text fixes
it — never because an author asserts it or hand-edits the manifest. (Governance
rules 6–7.)

---

## Relationship to `changes.json`

`scripts/detect_changes.py` produces a `changes.json` (changed sections, changed
spans, `references_changed` / `methods_or_data_changed`, recommended re-dispatch
list). Step 1.5 consumes it to decide which subagents re-run. `changes.json` is
transient per-iteration scratch; the manifest is the durable record. Keep them
side by side (e.g. `reviews/<id>.changes.json` and `reviews/<id>.review.json`).

---

## AI-review disclosure stamp (in-paper)

Step 5 emits this for the manuscript's AI-use / Acknowledgments statement. It
records **process, not endorsement**. Fill the bracketed fields from the manifest:

> This manuscript was checked with the Denolle Group Pre-Submission Reviewer
> (v[skill_version], model [model]), an advisory AI tool, through [iteration]
> review iteration(s) prior to submission. All findings were reviewed and
> adjudicated by the authors. The tool does not run code, resolve links, or
> confirm results, and it does not endorse the manuscript's validity.

Do not reword this into a quality claim ("vetted," "validated," "approved"). It
attests only that the draft passed through the tool.

---

## Ledger for next iteration (copy-paste fallback)

Step 5 also prints the full ledger as a fenced block. In a CLI run this is
redundant with the JSON manifest, but it is the **only** way to carry state in a
session with no filesystem. Format:

```
LEDGER  (manuscript_id=denolle2026-tremor  iteration=3  skill=v2.3  model=claude-opus-4-8)
S-ME.11 | C2 | Fair | PARTIALLY ADDRESSED | Methods ¶3 | sampling rate/taper unstated
S-RP.4  | C3 | Fatal | NOT ADDRESSED      | Data Avail. | no code DOI
S-DI.7  | C4 | Good | INTRODUCED-IN-REVISION | Disc. ¶5 | unshown depth dependence
```

---

## Browser caveat (read this)

This reviewer is built for a **CLI / filesystem-backed agent** (Claude Code,
Codex, Cursor) because iteration requires persisting the manifest between runs.
**It is not meant for a stateless browser session (claude.ai Skills) past
iteration 1**: there is nowhere to store the ledger, so the no-new-issues and
monotonicity guarantees cannot be enforced automatically. If someone must use the
browser, the only path is to manually paste the *Ledger for next iteration* block
back in each time — treat that as a degraded fallback, not the supported workflow.
