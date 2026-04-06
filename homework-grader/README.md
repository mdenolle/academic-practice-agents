# homework-grader

A browser-based AI homework grader for STEM courses. Upload student submissions (PDF or image of handwritten or typed work), grade them against an instructor-provided solution key using Claude's vision API, and export results as CSV — no backend required.

---

## What this is

Each grader is a self-contained React component that:

1. Accepts student submissions as PDF or image files (handwritten, typed, iPad export)
2. Sends each submission to Claude along with your solution key as a system prompt
3. Returns per-question scores, feedback, and a flag for uncertain cases
4. Lets you override any score before exporting
5. Outputs a CSV with scores and feedback ready for a gradebook

The grader runs entirely in the browser. There is no server, no database, and no persistent storage. API calls go directly from the browser to the Anthropic Messages API.

---

## What VLM does it use?

`claude-sonnet-4-20250514` via the Anthropic Messages API (`/v1/messages`).

Each grading call sends:
- A **system prompt** containing your full solution key and grading rubric
- The student submission as a `document` block (PDF) or `image` block (JPEG/PNG)
- Optional additional content blocks for supplementary files (reference plots, code output, dispersion curves)

To change the model, update the `model` field in the `callClaude` function inside any grader JSX file:

```js
model: "claude-sonnet-4-20250514",  // change this line
```

---

## Repository structure

```
homework-grader/
├── README.md                        ← you are here
├── apps/
│   ├── hw4-grader.jsx               # ESS 412/512 HW4: plane waves, stress-tensor, FD shear wave
│   ├── hw5-grader.jsx               # ESS 412/512 HW5: Fermat's principle → Snell's law
│   ├── hw6-grader.jsx               # ESS 412/512 HW6: corner refraction, Love wave dispersion
│   └── template-grader.jsx          # Generic template — start here for a new homework
├── skills/
│   ├── SKILL.md                     # Claude Code skill: grade handwritten submissions via chat
│   └── references/
│       ├── matching-and-grading.md  # Question matching logic and partial credit rubric
│       ├── parsing-strategy.md      # Image parsing and OCR guidance
│       └── spreadsheet-schema.md    # xlsx output schema
├── solution-keys/
│   ├── README.md                    # How to write a solution key
│   └── sample-solution-key.md       # Fictional seismology example (format reference only)
└── examples/
    └── student-list-example.js      # How to define the NAMES array
```

---

## How to run it

### Option A — Drop into a React project (Vite or Create React App)

```bash
# 1. Clone the repo
git clone https://github.com/mdenolle/academic-practice-agents.git
cd academic-practice-agents/homework-grader

# 2. Create a minimal Vite project
npm create vite@latest my-grader -- --template react
cd my-grader
npm install

# 3. Copy the desired grader into src/
cp ../apps/template-grader.jsx src/App.jsx

# 4. Run
npm run dev
```

Open `http://localhost:5173` in your browser or whatever default localhost it asked for. The default app has to be App.jsx, so overwrite the file with your current homework. 

**If you see `⚠ Failed to fetch` when grading** — this means no API key is set. Fix it before doing anything else (see [Adding your API key](#adding-your-api-key) below).

### Option B — Paste into claude.ai as an artifact

Copy the full contents of any JSX file (with your solution key pasted in) and paste it into a claude.ai conversation. Claude will render it as a live React app in the artifact panel. No setup needed.

---

## Adding your API key

> **Skip this section if you are using Option B (claude.ai artifact)** — the platform injects the key automatically.

When running locally with Vite, every grading request goes directly from your browser to the Anthropic API. Without a key the fetch fails immediately with `⚠ Failed to fetch`.

### Step 1 — Get your key

Go to [console.anthropic.com](https://console.anthropic.com) → **API Keys** → **Create Key**. Copy the `sk-ant-...` string.

### Step 2 — Add it to the JSX file

Open `src/App.jsx` and find the `callClaude` function near the top (search for `const callClaude`). Find the `headers` block and add the two lines shown:

```js
const callClaude = async (system, content) => {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "sk-ant-...",          // ← paste your key here
      "anthropic-version": "2023-06-01",  // ← add this line exactly as shown
    },
```

Save the file. Vite hot-reloads automatically — no need to restart `npm run dev`.

### Step 3 — Try grading again

Upload a submission and click **Grade**. The `⚠ Failed to fetch` error should be gone.

### Keeping your key safe

- **Never commit `sk-ant-...` to git.** Add `src/App.jsx` to `.gitignore` if it contains your key, or strip the key before pushing.
- For a cleaner setup, use a Vite environment variable instead of a hardcoded string:
  1. Create a file called `.env.local` in the root of your Vite project (next to `package.json`)
  2. Add one line: `VITE_ANTHROPIC_KEY=sk-ant-...`
  3. In `App.jsx`, replace the hardcoded key with: `import.meta.env.VITE_ANTHROPIC_KEY`
  4. Add `.env.local` to `.gitignore`

```js
"x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
```

---

## How to adapt the rubric for grading

### 1. Paste your solution key

Open the JSX file and find the `SOLUTION_KEY` constant at the top. Replace the `// TODO` placeholder with your full solution:

```js
const SOLUTION_KEY = `
=== Q1 (10 points) — Your question title ===

Step 1: ... (3 pts)
Step 2: ... (4 pts)
Final answer: ... [accept ±2%]
Common errors: ...
`;
```

See `solution-keys/README.md` for the recommended format.

### 2. Update the questions array

Edit `QS` to match your homework:

```js
const QS = [
  { label: "Q1", pts: 10, desc: "Brief description" },
  { label: "Q2", pts: 5,  desc: "Brief description" },
];
const MAX = QS.reduce((a, q) => a + q.pts, 0);
```

### 3. Add your student roster

Replace the `NAMES` array with your students. See `examples/student-list-example.js` for patterns.

### 4. Edit the rubric in `SYS`

All five customization points (`SOLUTION_KEY`, `QS`, `NAMES`, `SYS`, file slots) are constants defined at the top of the file, before the React component.

Open your JSX file and find the `SYS` constant (search for `const SYS`). It contains the full system prompt sent to Claude, including the `RUBRIC:` block. Edit the percentage thresholds to match your grading policy:

```js
const SYS = `You are a grading assistant...

${SOLUTION_KEY}

RUBRIC:
- 100% = correct method AND correct answer with units
- 80%  = correct method, minor arithmetic error
- 50%  = correct approach, significant error
- 20%  = relevant formula, no working
- 0%   = blank or completely wrong
...
`;
```

Everything between the backticks is plain text sent to Claude — you can rewrite it freely. Common edits:
- Change the percentage thresholds
- Add course-specific grading notes (e.g. "always deduct 0.5 pt for missing units")
- Change the `"feedback"` line in the JSON schema to control feedback length (see section below)

### 5. The derivation cap

Also inside `SYS`. Find the `DERIVATION CAP RULE` paragraph and remove it to disable the cap entirely, or leave it to enforce it for all questions. To disable it for one specific question only, add `DERIVATION CAP: not applicable` in that question's section of your `SOLUTION_KEY`.

---

## How to add multiple input files per submission

`hw6-grader.jsx` shows the full pattern for multiple file slots per student:

- `b64` — main submission (PDF or image)
- `b64Q1Plot` — optional reference/answer-key plot for Q1
- `b64Plot` — optional computer-generated plot for Q2b

To add a new slot in `template-grader.jsx`:

**Step 1** — Add the fields to the student state initializer:

```js
NAMES.map((name, i) => ({
  id: i, name,
  file: null, b64: null, mediaType: null,
  fileExtra: null, b64Extra: null, mediaTypeExtra: null,  // add this
  status: "pending", results: null, error: null,
}))
```

**Step 2** — Add an upload button in the card row:

```jsx
{s.b64 && !s.b64Extra && (
  <label onClick={e => e.stopPropagation()}
    style={{ padding: "4px 12px", borderRadius: 8, border: "1px dashed #7c3aed",
             color: "#a78bfa", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
    + Extra File
    <input type="file" accept=".pdf,image/*" style={{ display: "none" }}
      onChange={e => e.target.files[0] && handleFile(s.id, e.target.files[0], "extra")} />
  </label>
)}
```

**Step 3** — Handle the slot in `handleFile` and push a content block in `gradeOne`:

```js
// in handleFile:
else if (slot === "extra") upd(id, { fileExtra: file, b64Extra: b64, mediaTypeExtra: mediaType });

// in gradeOne, after mainBlock:
if (s.b64Extra) {
  const isImgE = s.mediaTypeExtra?.startsWith("image/");
  contentArr.push({ type: "text", text: "The following is the student's submitted plot for Q2:" });
  contentArr.push(isImgE
    ? { type: "image",    source: { type: "base64", media_type: s.mediaTypeExtra, data: s.b64Extra } }
    : { type: "document", source: { type: "base64", media_type: s.mediaTypeExtra || "application/pdf", data: s.b64Extra } }
  );
}
```

The text prefix before each extra block tells Claude what the file contains. Be specific.

---

## How to design the tone and length of feedback

Feedback is controlled entirely by the `SYS` system prompt. Change the JSON schema line:

**Short, direct (default):**
```
"feedback": "one concise sentence"
```

**Longer, student-facing:**
```
"feedback": "two to three sentences suitable for returning directly to the student,
             explaining what was correct, what was missing, and how to improve"
```

**Encouraging tone** — add to SYS:
```
Write feedback in an encouraging tone. Acknowledge what the student did correctly
before identifying errors.
```

**Strict/terse** — add to SYS:
```
Be direct and concise. State only the error and the correct approach.
```

The feedback string is rendered inside each grade card and included in the CSV export. It can be pasted directly into a gradebook comment field or returned to students as-is.

---

## Customization checklist (quick-start)

- [ ] Replace `NAMES` array with your student roster
- [ ] Replace `SOLUTION_KEY` placeholder with your solution text
- [ ] Update `QS` array with your question labels and point values
- [ ] Edit the `RUBRIC` block in `SYS` for your grading policy
- [ ] Add or remove file upload slots as needed
- [ ] Adjust feedback tone in the JSON schema line of `SYS`
- [ ] Add your API key (local dev only — never commit it)

---

## The skills/ folder

The `skills/` folder contains a Claude Code skill (`SKILL.md`) and reference documents that enable Claude to grade handwritten submissions conversationally — without the React app. This is useful when you want to grade a small batch in a chat interface rather than running the full app.

To use the skill, install it in Claude Code and upload your student images to the chat. Claude will follow the workflow in `SKILL.md` to parse, match, and score each submission, then write an xlsx gradebook.

---

## Contributing

PRs welcome. To add a new homework grader:

1. Copy `apps/template-grader.jsx` to `apps/hw#-grader.jsx`
2. Fill in `QS`, `NAMES`, and update the `SYS` prompt — but leave `SOLUTION_KEY` as the `// TODO` placeholder
3. Test that the app loads and the UI renders correctly (you can grade with a dummy submission)
4. Open a PR with only the app logic

If you want to contribute a sample solution key for documentation purposes, add a **fictional, original problem** to `solution-keys/` — not any actual course material. Never commit a real solution key to this repo.
