// student-list-example.js
// ─────────────────────────────────────────────────────────────
// Shows how to define the NAMES array in any grader JSX file.
// Copy one of these patterns into the NAMES constant at the
// top of your grader file.
// ─────────────────────────────────────────────────────────────

// Pattern 1: Simple list of full names (most common)
const NAMES = [
  "Alice Chen",
  "Bob Martinez",
  "Carol Johnson",
  "David Kim",
  "Eva Patel",
];

// Pattern 2: Names loaded from a roster CSV (Node.js / build-time only)
// If you're running in the browser, use Pattern 1 instead.
//
// const fs = require("fs");
// const NAMES = fs.readFileSync("roster.csv", "utf8")
//   .split("\n")
//   .slice(1)                        // skip header row
//   .map(line => line.split(",")[0].trim())  // first column = name
//   .filter(Boolean);

// Pattern 3: Names with section labels (for multi-section courses)
// Modify the grader card rendering to show the section tag if needed.
//
// const ROSTER = [
//   { name: "Alice Chen",    section: "AA" },
//   { name: "Bob Martinez",  section: "AB" },
//   { name: "Carol Johnson", section: "AA" },
// ];
// const NAMES = ROSTER.map(r => r.name);

// ─────────────────────────────────────────────────────────────
// Notes:
// - Order doesn't matter; students are identified by name, not index.
// - The name shown in the UI and exported to CSV comes directly from
//   this array — format it exactly as you want it to appear.
// - For large rosters (50+ students), Grade All processes them
//   sequentially to avoid rate-limit errors. Each student takes
//   roughly 5–15 seconds depending on submission length.
// ─────────────────────────────────────────────────────────────
