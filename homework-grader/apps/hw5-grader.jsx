import { useState, useCallback } from "react";

// ─── Solution Key ─────────────────────────────────────────────────────────────
const SOLUTION_KEY = `
// TODO: paste your solution key here — see solution-keys/README.md
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const QS  = [{ label: "Q1", pts: 8, desc: "Fermat's principle → Snell's law" }];
const MAX = 8;

const NAMES = [
  "Hiroto Bito", "Amelia Bossoma", "Nicolas Chang", "Will Dienstfrey",
  "Mark Han", "Michael Hemmett", "Meetsingh Ranumaneet", "Rathy Rengitharathy",
];

// ─── API ──────────────────────────────────────────────────────────────────────
const callClaude = async (system, content) => {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system,
      messages: [{ role: "user", content }],
    }),
  });
  if (!r.ok) throw new Error(`API ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const d = await r.json();
  return d.content.map(b => b.text || "").join("\n");
};

const parseJSON = raw => {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch {}
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) try { return JSON.parse(m[0]); } catch {}
  return null;
};

const toB64 = f => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result.split(",")[1]);
  r.onerror = () => rej(new Error("Read failed"));
  r.readAsDataURL(f);
});

const SYS = `You are a grading assistant for ESS 412/512 Introduction to Seismology (University of Washington). You are grading Homework 5 on ray theory and Fermat's principle.

${SOLUTION_KEY}

GRADING INSTRUCTIONS:
Grade Q1 out of 8 points using the breakdown provided in the solution key.
Assess the student's handwritten derivation carefully — partial credit applies at each step.

Return ONLY valid JSON (no markdown fences, no preamble):
{"grades":[{"label":"Q1","score":6,"max":8,"feedback":"one or two concise sentences explaining what was correct and what was missing","flag":false}],"overall_comment":"one concise sentence"}

Set flag:true if handwriting is unclear or you are uncertain about the grade.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pct  = (s, m) => m > 0 ? Math.round(s / m * 100) : 0;
const col  = p => p >= 85 ? "#22c55e" : p >= 65 ? "#3b82f6" : p >= 45 ? "#f59e0b" : "#ef4444";
const ST_C = { pending: "#64748b", uploading: "#f59e0b", grading: "#3b82f6", done: "#22c55e", flagged: "#f97316", error: "#ef4444" };
const ST_L = { pending: "Pending", uploading: "Reading…", grading: "Grading…", done: "✓ Done", flagged: "⚑ Review", error: "Error" };

function Chip({ c, children }) {
  const tc = c === "#16a34a" ? "#4ade80" : c === "#d97706" ? "#fbbf24" : "#60a5fa";
  return (
    <span style={{ background: c + "22", color: tc, border: `1px solid ${c}44`, borderRadius: 8, padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>
      {children}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HW5Grader() {
  const [students, setStudents] = useState(
    NAMES.map((name, i) => ({
      id: i, name,
      file: null, b64: null, mediaType: null,
      status: "pending", results: null, error: null,
    }))
  );
  const [expanded,   setExpanded]   = useState(null);
  const [gradingAll, setGradingAll] = useState(false);
  const [log,        setLog]        = useState([]);
  const [csvText,    setCsvText]    = useState("");
  const [copied,     setCopied]     = useState(false);

  const upd    = (id, patch) => setStudents(s => s.map(x => x.id === id ? { ...x, ...patch } : x));
  const addLog = msg => setLog(l => [...l.slice(-30), `${new Date().toLocaleTimeString()} ${msg}`]);

  const handleFile = async (id, file) => {
    if (!file) return;
    upd(id, { file, status: "uploading" });
    try {
      const b64 = await toB64(file);
      const mediaType = file.type?.startsWith("image/") ? file.type : "application/pdf";
      upd(id, { b64, mediaType, status: "pending" });
      addLog(`📄 ${file.name} → ${NAMES[id]}`);
    } catch {
      upd(id, { status: "error", error: "Could not read file" });
    }
  };

  const gradeOne = useCallback(async (id) => {
    const s = students.find(x => x.id === id);
    if (!s?.b64) return;
    upd(id, { status: "grading", error: null });
    addLog(`⏳ Grading ${s.name}…`);

    const isImg = s.mediaType?.startsWith("image/");
    const fileBlock = isImg
      ? { type: "image",    source: { type: "base64", media_type: s.mediaType, data: s.b64 } }
      : { type: "document", source: { type: "base64", media_type: s.mediaType || "application/pdf", data: s.b64 } };

    try {
      const raw = await callClaude(SYS, [
        { type: "text", text: `Grade HW5 for student: ${s.name}. Read carefully and return only JSON.` },
        fileBlock,
      ]);
      const parsed = parseJSON(raw);
      if (!parsed?.grades) throw new Error("Could not parse grader response");
      upd(id, { results: parsed, status: parsed.grades.some(g => g.flag) ? "flagged" : "done" });
      const tot = parsed.grades.reduce((a, g) => a + g.score, 0);
      addLog(`✓ ${s.name}: ${tot}/${MAX} (${pct(tot, MAX)}%)`);
    } catch (err) {
      upd(id, { status: "error", error: err.message });
      addLog(`✗ ${s.name}: ${err.message.slice(0, 80)}`);
    }
  }, [students]);

  const gradeAll = async () => {
    setGradingAll(true);
    for (const s of students.filter(x => x.b64 && x.status === "pending")) await gradeOne(s.id);
    setGradingAll(false);
  };

  const override = (sid, label, val) =>
    setStudents(s => s.map(x => {
      if (x.id !== sid || !x.results) return x;
      const q = QS.find(q => q.label === label);
      return {
        ...x, results: {
          ...x.results,
          grades: x.results.grades.map(g =>
            g.label === label ? { ...g, score: Math.min(q?.pts ?? g.max, Math.max(0, Number(val))) } : g
          ),
        },
      };
    }));

  const buildCSV = () => {
    const hdrs = ["Student", ...QS.map(q => `${q.label} Score`), "Total", "Percent", ...QS.map(q => `${q.label} Feedback`), "Overall Comment"];
    const rows = students.filter(s => s.results).map(s => {
      const gmap  = Object.fromEntries(s.results.grades.map(g => [g.label, g]));
      const total = s.results.grades.reduce((a, g) => a + g.score, 0);
      return [
        s.name,
        ...QS.map(q => gmap[q.label]?.score ?? "-"),
        total, pct(total, MAX) + "%",
        ...QS.map(q => gmap[q.label]?.feedback ?? ""),
        s.results.overall_comment || "",
      ];
    });
    return [hdrs, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  };

  const copyCSV = async () => {
    const csv = buildCSV();
    setCsvText(csv);
    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      addLog("📋 CSV copied");
    } catch {
      addLog("⚠ Auto-copy blocked — select all text below and copy manually");
    }
  };

  const graded = students.filter(s => s.results);
  const doneN  = students.filter(s => s.status === "done" || s.status === "flagged").length;
  const readyN = students.filter(s => s.b64 && s.status === "pending").length;
  const flagN  = students.filter(s => s.status === "flagged").length;
  const avgTot = graded.length
    ? (graded.reduce((a, s) => a + s.results.grades.reduce((b, g) => b + g.score, 0), 0) / graded.length).toFixed(1)
    : null;
  const q1Avg = graded.length
    ? (graded.map(s => s.results.grades.find(g => g.label === "Q1")?.score ?? 0).reduce((a, x) => a + x, 0) / graded.length).toFixed(1)
    : null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: "#0a0f1e", minHeight: "100vh", color: "#e2e8f0", paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg,#0f2744,#1a1f3a)", padding: "20px 28px", borderBottom: "1px solid #1e3a5f" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 34 }}>📐</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#f1f5f9" }}>ESS 412/512 · HW5 Grader</div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Ray Theory · Fermat's Principle · {MAX} pts · {NAMES.length} students</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {doneN > 0  && <Chip c="#16a34a">{doneN}/{NAMES.length} graded</Chip>}
            {flagN > 0  && <Chip c="#d97706">{flagN} flagged</Chip>}
            {avgTot     && <Chip c="#2563eb">avg {avgTot}/{MAX}</Chip>}
          </div>
        </div>

        {/* Q pill */}
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "4px 12px", fontSize: 12, display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ color: "#60a5fa", fontWeight: 700 }}>Q1</span>
            <span style={{ color: "#94a3b8" }}>8pt</span>
            <span style={{ color: "#334155" }}>·</span>
            <span style={{ color: "#64748b" }}>Fermat's principle → Snell's law</span>
            {q1Avg && <span style={{ color: col(pct(Number(q1Avg), 8)), fontWeight: 600, marginLeft: 3 }}>avg {q1Avg}</span>}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: 960, margin: "0 auto" }}>

        {/* ── Action bar ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={gradeAll} disabled={gradingAll || readyN === 0} style={{
            padding: "10px 22px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14,
            background: readyN > 0 && !gradingAll ? "linear-gradient(90deg,#1d4ed8,#2563eb)" : "#1e293b",
            color: readyN > 0 && !gradingAll ? "#fff" : "#475569",
            cursor: readyN > 0 && !gradingAll ? "pointer" : "not-allowed",
          }}>
            {gradingAll ? "⏳ Grading…" : `⚡ Grade All (${readyN} ready)`}
          </button>

          {doneN > 0 && (
            <button onClick={copyCSV} style={{
              padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer",
              border: copied ? "1px solid #16a34a44" : "1px solid #334155",
              background: copied ? "#16a34a22" : "transparent",
              color: copied ? "#4ade80" : "#94a3b8", transition: "all .2s",
            }}>
              {copied ? "✓ Copied!" : "📋 Copy CSV"}
            </button>
          )}

          <span style={{ marginLeft: "auto", fontSize: 11, color: "#374151" }}>
            Upload PDF or image · Grade · Copy CSV
          </span>
        </div>

        {/* ── Student cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {students.map(s => {
            const total  = s.results?.grades.reduce((a, g) => a + g.score, 0) ?? 0;
            const isOpen = expanded === s.id;

            return (
              <div key={s.id} style={{
                background: "#111827", borderRadius: 12, overflow: "hidden",
                border: `1px solid ${s.status === "flagged" ? "#f97316" : s.status === "done" ? "#1e3a5f" : "#1f2937"}`,
              }}>
                {/* Card row */}
                <div
                  onClick={() => s.results && setExpanded(isOpen ? null : s.id)}
                  style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, cursor: s.results ? "pointer" : "default", flexWrap: "wrap" }}
                >
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9", minWidth: 210 }}>{s.name}</span>
                  <span style={{ fontSize: 12, color: ST_C[s.status], fontWeight: 600 }}>{ST_L[s.status]}</span>

                  {!s.b64 && s.status !== "uploading" && (
                    <label onClick={e => e.stopPropagation()}
                      style={{ padding: "4px 12px", borderRadius: 8, border: "1px dashed #334155", color: "#64748b", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                      + Upload PDF / Image
                      <input type="file" accept=".pdf,image/*" style={{ display: "none" }}
                        onChange={e => e.target.files[0] && handleFile(s.id, e.target.files[0])} />
                    </label>
                  )}

                  {s.b64 && s.status === "pending" && (
                    <button onClick={e => { e.stopPropagation(); gradeOne(s.id); }}
                      style={{ padding: "4px 14px", borderRadius: 8, border: "none", background: "#1d4ed8", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      Grade
                    </button>
                  )}

                  {s.results && (
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 72, height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${pct(total, MAX)}%`, height: "100%", background: col(pct(total, MAX)), borderRadius: 3, transition: "width .4s" }} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "#f1f5f9", minWidth: 36 }}>{total}/{MAX}</span>
                      <span style={{ fontSize: 12, color: col(pct(total, MAX)), fontWeight: 600, minWidth: 36 }}>{pct(total, MAX)}%</span>
                      <span style={{ color: "#334155", fontSize: 13 }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  )}
                </div>

                {/* File name */}
                {s.file && s.status !== "uploading" && (
                  <div style={{ paddingLeft: 16, paddingBottom: 6, fontSize: 11, color: "#374151" }}>📄 {s.file.name}</div>
                )}

                {/* Error */}
                {s.status === "error" && (
                  <div style={{ padding: "7px 16px", background: "#dc262610", color: "#f87171", fontSize: 12, borderTop: "1px solid #dc262620", display: "flex", alignItems: "center" }}>
                    ⚠ {s.error}
                    {s.b64 && (
                      <button onClick={() => gradeOne(s.id)}
                        style={{ marginLeft: 10, color: "#60a5fa", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>
                        Retry
                      </button>
                    )}
                  </div>
                )}

                {/* Expanded grades */}
                {isOpen && s.results && (
                  <div style={{ borderTop: "1px solid #1f2937", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {s.results.grades.map(g => {
                      const q = QS.find(x => x.label === g.label);
                      const p = pct(g.score, g.max);
                      return (
                        <div key={g.label} style={{
                          background: "#0a0f1e", borderRadius: 10, padding: "10px 14px",
                          borderLeft: `3px solid ${g.flag ? "#f97316" : col(p)}`,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>{g.label}</span>
                            <span style={{ fontSize: 11, color: "#475569" }}>{q?.desc}</span>
                            {g.flag && <span style={{ fontSize: 11, color: "#fb923c", border: "1px solid #f9741640", borderRadius: 6, padding: "1px 7px" }}>⚑ Review</span>}
                            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                              <input type="number" min={0} max={g.max} value={g.score}
                                onChange={e => override(s.id, g.label, e.target.value)}
                                style={{ width: 46, padding: "3px 6px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9", fontSize: 13, textAlign: "center" }} />
                              <span style={{ color: "#475569", fontSize: 12 }}>/ {g.max}</span>
                              <span style={{ fontWeight: 700, fontSize: 13, color: col(p) }}>{p}%</span>
                            </div>
                          </div>
                          <div style={{ marginTop: 7, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{g.feedback}</div>
                        </div>
                      );
                    })}
                    {s.results.overall_comment && (
                      <div style={{ fontSize: 12, color: "#475569", fontStyle: "italic", paddingTop: 2 }}>💬 {s.results.overall_comment}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── CSV panel ── */}
        {csvText && (
          <div style={{ marginTop: 20, background: "#111827", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #1f2937", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>📋 CSV — click inside, Ctrl+A then Ctrl+C</span>
              <button onClick={() => setCsvText("")} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            <textarea readOnly value={csvText} onClick={e => e.target.select()}
              style={{ width: "100%", height: 160, padding: "12px 16px", background: "#0a0f1e", color: "#64748b", fontSize: 11, fontFamily: "'Courier New',monospace", border: "none", resize: "vertical", boxSizing: "border-box", outline: "none", lineHeight: 1.5 }} />
          </div>
        )}

        {/* ── Summary table ── */}
        {graded.length >= 2 && (
          <div style={{ marginTop: 24, background: "#111827", borderRadius: 12, overflow: "hidden", border: "1px solid #1f2937" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1f2937", fontWeight: 700, color: "#f1f5f9", fontSize: 14, display: "flex", justifyContent: "space-between" }}>
              <span>📊 Grade Summary</span>
              <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}>{graded.length} of {NAMES.length} graded</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#0a0f1e" }}>
                    <th style={{ padding: "8px 14px", textAlign: "left", color: "#475569", fontWeight: 600 }}>Student</th>
                    <th style={{ padding: "8px 10px", color: "#475569", fontWeight: 600, textAlign: "center" }}>
                      Q1<br /><span style={{ fontSize: 10, fontWeight: 400 }}>8pt</span>
                      {q1Avg && <><br /><span style={{ fontSize: 10, color: col(pct(Number(q1Avg), 8)) }}>{q1Avg}</span></>}
                    </th>
                    <th style={{ padding: "8px 14px", color: "#475569", fontWeight: 600, textAlign: "center" }}>Total</th>
                    <th style={{ padding: "8px 14px", color: "#475569", fontWeight: 600, textAlign: "center" }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {graded.map(s => {
                    const tot  = s.results.grades.reduce((a, g) => a + g.score, 0);
                    const p    = pct(tot, MAX);
                    const q1   = s.results.grades.find(g => g.label === "Q1")?.score ?? 0;
                    return (
                      <tr key={s.id} style={{ borderTop: "1px solid #1f2937" }}>
                        <td style={{ padding: "8px 14px", color: "#e2e8f0" }}>{s.name}</td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <span style={{ color: col(pct(q1, 8)), fontWeight: 700 }}>{q1}</span>
                        </td>
                        <td style={{ padding: "8px 14px", textAlign: "center", fontWeight: 800, color: "#f1f5f9" }}>{tot}/{MAX}</td>
                        <td style={{ padding: "8px 14px", textAlign: "center", fontWeight: 700, color: col(p) }}>{p}%</td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: "2px solid #334155", background: "#0a0f1e" }}>
                    <td style={{ padding: "8px 14px", color: "#475569", fontWeight: 600, fontStyle: "italic" }}>Class avg</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>{q1Avg ?? "—"}</td>
                    <td style={{ padding: "8px 14px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>{avgTot ?? "—"}</td>
                    <td style={{ padding: "8px 14px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>
                      {avgTot ? pct(Number(avgTot), MAX) + "%" : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Activity log ── */}
        {log.length > 0 && (
          <div style={{ marginTop: 20, background: "#0a0f1e", borderRadius: 10, border: "1px solid #1f2937", padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: "#374151", fontWeight: 700, marginBottom: 6, letterSpacing: "0.08em" }}>ACTIVITY LOG</div>
            {log.slice(-12).map((e, i) => (
              <div key={i} style={{ fontSize: 11, color: "#475569", fontFamily: "'Courier New',monospace", lineHeight: 1.7 }}>{e}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
