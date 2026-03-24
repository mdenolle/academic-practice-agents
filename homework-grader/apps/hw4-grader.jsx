import { useState, useCallback } from "react";

// ─── Solution Key ─────────────────────────────────────────────────────────────
const SOLUTION_KEY = `
// TODO: paste your solution key here — see solution-keys/README.md
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const QS_412 = [
  { label: "Q1", pts: 6,  desc: "Stress tensor — plane waves" },
  { label: "Q2", pts: 4,  desc: "Max displacement vs period" },
  { label: "Q3", pts: 2,  desc: "Spherical symmetry for S-waves" },
];
const QS_512 = [
  ...QS_412,
  { label: "Q4", pts: 15, desc: "FD shear wave (ESS512 only)" },
];
const MAX_412 = 12;
const MAX_512 = 27;

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
      max_tokens: 1800,
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

const makeSYS = (is512) => `You are a grading assistant for ESS ${is512 ? "512" : "412"}/512 Introduction to Seismology (University of Washington). You are grading Homework 4 on plane waves and stress-strain relations.

${SOLUTION_KEY}

STUDENT COURSE: ESS ${is512 ? "512" : "412"}
${!is512
    ? "Q4 is NOT applicable for this student (ESS412). Do not include Q4 in the grades array."
    : "Q4 IS required for this student (ESS512). Include Q4 in the grades array."}

GRADING RUBRIC:
- 100% = correct method AND correct answer with units
- 80%  = correct method, minor arithmetic error or missing units
- 50%  = correct approach, significant error or missing key step
- 20%  = relevant formula only, no working shown
- 0%   = blank, completely wrong, or off-topic

For Q3 (conceptual): award full credit for any answer that correctly identifies S-waves as transverse and explains why spherical symmetry is geometrically impossible.
For Q4 (ESS512): grade the submitted plot and/or code. If only a plot is submitted, maximum 10/15.

${is512
    ? `Return ONLY valid JSON (no markdown, no preamble):
{"grades":[{"label":"Q1","score":5,"max":6,"feedback":"one concise sentence","flag":false},{"label":"Q2","score":3,"max":4,"feedback":"one concise sentence","flag":false},{"label":"Q3","score":2,"max":2,"feedback":"one concise sentence","flag":false},{"label":"Q4","score":12,"max":15,"feedback":"one concise sentence","flag":false}],"overall_comment":"one concise sentence"}`
    : `Return ONLY valid JSON (no markdown, no preamble):
{"grades":[{"label":"Q1","score":5,"max":6,"feedback":"one concise sentence","flag":false},{"label":"Q2","score":3,"max":4,"feedback":"one concise sentence","flag":false},{"label":"Q3","score":2,"max":2,"feedback":"one concise sentence","flag":false}],"overall_comment":"one concise sentence"}`}

Set flag:true if you are uncertain about the grade or handwriting/content is unclear.`;

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

function CourseToggle({ is512, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", background: "#1e293b", borderRadius: 8, padding: 3 }}>
      {["ESS412", "ESS512"].map(label => {
        const active = label === "ESS512" ? is512 : !is512;
        return (
          <button key={label} onClick={() => onChange(label === "ESS512")}
            style={{
              padding: "4px 14px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700,
              cursor: "pointer", background: active ? "#1d4ed8" : "transparent",
              color: active ? "#fff" : "#475569", transition: "all .15s",
            }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HW4Grader() {
  const [students, setStudents] = useState(
    NAMES.map((name, i) => ({
      id: i, name,
      file: null, b64: null, mediaType: null,
      file2: null, b64_2: null, mediaType2: null,
      status: "pending", results: null, error: null,
      is512: false,
    }))
  );
  const [expanded,   setExpanded]   = useState(null);
  const [gradingAll, setGradingAll] = useState(false);
  const [log,        setLog]        = useState([]);
  const [csvText,    setCsvText]    = useState("");
  const [copied,     setCopied]     = useState(false);

  const upd    = (id, patch) => setStudents(s => s.map(x => x.id === id ? { ...x, ...patch } : x));
  const addLog = msg => setLog(l => [...l.slice(-30), `${new Date().toLocaleTimeString()} ${msg}`]);

  const handleFile = async (id, file, slot) => {
    if (!file) return;
    const isSlot2 = slot === 2;
    upd(id, isSlot2 ? { file2: file, status: "uploading" } : { file, status: "uploading" });
    try {
      const b64 = await toB64(file);
      const mediaType = file.type?.startsWith("image/") ? file.type : "application/pdf";
      upd(id, isSlot2
        ? { b64_2: b64, mediaType2: mediaType, status: "pending" }
        : { b64, mediaType, status: "pending" }
      );
      addLog(`📄 ${file.name} → ${NAMES[id]}`);
    } catch {
      upd(id, { status: "error", error: "Could not read file" });
    }
  };

  const gradeOne = useCallback(async (id) => {
    const s = students.find(x => x.id === id);
    if (!s?.b64) return;
    upd(id, { status: "grading", error: null });
    addLog(`⏳ Grading ${s.name} (ESS${s.is512 ? "512" : "412"})…`);

    const isImg = s.mediaType?.startsWith("image/");
    const mainBlock = isImg
      ? { type: "image",    source: { type: "base64", media_type: s.mediaType, data: s.b64 } }
      : { type: "document", source: { type: "base64", media_type: s.mediaType || "application/pdf", data: s.b64 } };

    const contentArr = [
      { type: "text", text: `Grade HW4 for student: ${s.name} (ESS${s.is512 ? "512" : "412"}). Read carefully and return only JSON.` },
      mainBlock,
    ];

    if (s.is512 && s.b64_2) {
      const isImg2 = s.mediaType2?.startsWith("image/");
      contentArr.push({ type: "text", text: "The following is the student's submitted plot/code for Q4:" });
      contentArr.push(isImg2
        ? { type: "image",    source: { type: "base64", media_type: s.mediaType2, data: s.b64_2 } }
        : { type: "document", source: { type: "base64", media_type: s.mediaType2 || "application/pdf", data: s.b64_2 } }
      );
    }

    try {
      const raw = await callClaude(makeSYS(s.is512), contentArr);
      const parsed = parseJSON(raw);
      if (!parsed?.grades) throw new Error("Could not parse grader response");
      upd(id, { results: parsed, status: parsed.grades.some(g => g.flag) ? "flagged" : "done" });
      const MAX = s.is512 ? MAX_512 : MAX_412;
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
      const QS = x.is512 ? QS_512 : QS_412;
      const q  = QS.find(q => q.label === label);
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
    const allLabels = ["Q1", "Q2", "Q3", "Q4"];
    const hdrs = ["Student", "Course", ...allLabels.map(l => `${l} Score`), "Total", "Percent", ...allLabels.map(l => `${l} Feedback`), "Overall Comment"];
    const rows = students.filter(s => s.results).map(s => {
      const gmap  = Object.fromEntries(s.results.grades.map(g => [g.label, g]));
      const MAX   = s.is512 ? MAX_512 : MAX_412;
      const total = s.results.grades.reduce((a, g) => a + g.score, 0);
      return [
        s.name, s.is512 ? "ESS512" : "ESS412",
        ...allLabels.map(l => gmap[l]?.score ?? "-"),
        total, pct(total, MAX) + "%",
        ...allLabels.map(l => gmap[l]?.feedback ?? "N/A"),
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

  const qAvg = (label) => {
    const vals = graded.map(s => s.results.grades.find(g => g.label === label)).filter(Boolean).map(g => g.score);
    return vals.length ? (vals.reduce((a, x) => a + x, 0) / vals.length).toFixed(1) : null;
  };

  const avgFor = (is512) => {
    const sub = graded.filter(s => s.is512 === is512);
    if (!sub.length) return null;
    const MAX = is512 ? MAX_512 : MAX_412;
    return (sub.reduce((a, s) => a + s.results.grades.reduce((b, g) => b + g.score, 0), 0) / sub.length / MAX * 100).toFixed(0) + "%";
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: "#0a0f1e", minHeight: "100vh", color: "#e2e8f0", paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg,#0f2744,#1a1f3a)", padding: "20px 28px", borderBottom: "1px solid #1e3a5f" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 34 }}>🌊</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#f1f5f9" }}>ESS 412/512 · HW4 Grader</div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Plane Waves · Stress-Strain · ESS412: 12 pts · ESS512: 27 pts</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {doneN > 0       && <Chip c="#16a34a">{doneN}/{NAMES.length} graded</Chip>}
            {flagN > 0       && <Chip c="#d97706">{flagN} flagged</Chip>}
            {avgFor(false)   && <Chip c="#2563eb">412 avg {avgFor(false)}</Chip>}
            {avgFor(true)    && <Chip c="#7c3aed">512 avg {avgFor(true)}</Chip>}
          </div>
        </div>

        {/* Q pills */}
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          {QS_512.map(q => {
            const avg = qAvg(q.label);
            return (
              <div key={q.label} style={{ background: "#1e293b", borderRadius: 8, padding: "4px 12px", fontSize: 12, display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ color: q.label === "Q4" ? "#a78bfa" : "#60a5fa", fontWeight: 700 }}>{q.label}</span>
                <span style={{ color: "#94a3b8" }}>{q.pts}pt{q.label === "Q4" && <span style={{ color: "#7c3aed", fontSize: 10 }}> 512</span>}</span>
                <span style={{ color: "#334155" }}>·</span>
                <span style={{ color: "#64748b" }}>{q.desc}</span>
                {avg && <span style={{ color: col(pct(Number(avg), q.pts)), fontWeight: 600, marginLeft: 3 }}>avg {avg}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: 980, margin: "0 auto" }}>

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
            Set ESS412/512 per student · Upload submission · Grade
          </span>
        </div>

        {/* ── Student cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {students.map(s => {
            const QS     = s.is512 ? QS_512 : QS_412;
            const MAX    = s.is512 ? MAX_512 : MAX_412;
            const total  = s.results?.grades.reduce((a, g) => a + g.score, 0) ?? 0;
            const isOpen = expanded === s.id;

            return (
              <div key={s.id} style={{
                background: "#111827", borderRadius: 12, overflow: "hidden",
                border: `1px solid ${s.status === "flagged" ? "#f97316" : s.status === "done" ? (s.is512 ? "#3b1f6e" : "#1e3a5f") : "#1f2937"}`,
              }}>
                {/* Card row */}
                <div
                  onClick={() => s.results && setExpanded(isOpen ? null : s.id)}
                  style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, cursor: s.results ? "pointer" : "default", flexWrap: "wrap" }}
                >
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9", minWidth: 190 }}>{s.name}</span>

                  <div onClick={e => e.stopPropagation()}>
                    <CourseToggle is512={s.is512} onChange={v => upd(s.id, { is512: v, results: null, status: s.b64 ? "pending" : "pending" })} />
                  </div>

                  <span style={{ fontSize: 12, color: ST_C[s.status], fontWeight: 600 }}>{ST_L[s.status]}</span>

                  {!s.b64 && s.status !== "uploading" && (
                    <label onClick={e => e.stopPropagation()}
                      style={{ padding: "4px 12px", borderRadius: 8, border: "1px dashed #334155", color: "#64748b", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                      + Upload PDF / Image
                      <input type="file" accept=".pdf,image/*" style={{ display: "none" }}
                        onChange={e => e.target.files[0] && handleFile(s.id, e.target.files[0], 1)} />
                    </label>
                  )}

                  {s.is512 && s.b64 && !s.b64_2 && (
                    <label onClick={e => e.stopPropagation()}
                      style={{ padding: "4px 12px", borderRadius: 8, border: "1px dashed #7c3aed", color: "#a78bfa", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                      + Q4 Plot/Code
                      <input type="file" accept=".pdf,image/*" style={{ display: "none" }}
                        onChange={e => e.target.files[0] && handleFile(s.id, e.target.files[0], 2)} />
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
                      <span style={{ fontWeight: 800, fontSize: 14, color: "#f1f5f9", minWidth: 46 }}>{total}/{MAX}</span>
                      <span style={{ fontSize: 12, color: col(pct(total, MAX)), fontWeight: 600, minWidth: 36 }}>{pct(total, MAX)}%</span>
                      <span style={{ color: "#334155", fontSize: 13 }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  )}
                </div>

                {/* File names */}
                {(s.file || s.file2) && s.status !== "uploading" && (
                  <div style={{ paddingLeft: 16, paddingBottom: 6, fontSize: 11, color: "#374151", display: "flex", gap: 12 }}>
                    {s.file  && <span>📄 {s.file.name}</span>}
                    {s.file2 && <span style={{ color: "#6d28d9" }}>📊 {s.file2.name} (Q4)</span>}
                  </div>
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
                      const q    = QS.find(x => x.label === g.label);
                      const p    = pct(g.score, g.max);
                      const isQ4 = g.label === "Q4";
                      return (
                        <div key={g.label} style={{
                          background: "#0a0f1e", borderRadius: 10, padding: "10px 14px",
                          borderLeft: `3px solid ${g.flag ? "#f97316" : isQ4 ? "#7c3aed" : col(p)}`,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, color: isQ4 ? "#a78bfa" : "#f1f5f9", fontSize: 14 }}>{g.label}</span>
                            <span style={{ fontSize: 11, color: "#475569" }}>{q?.desc}</span>
                            {isQ4 && <span style={{ fontSize: 10, color: "#7c3aed", border: "1px solid #7c3aed40", borderRadius: 6, padding: "1px 7px" }}>ESS512</span>}
                            {g.flag && <span style={{ fontSize: 11, color: "#fb923c", border: "1px solid #f9741640", borderRadius: 6, padding: "1px 7px" }}>⚑ Review</span>}
                            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                              <input type="number" min={0} max={g.max} value={g.score}
                                onChange={e => override(s.id, g.label, e.target.value)}
                                style={{ width: 46, padding: "3px 6px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9", fontSize: 13, textAlign: "center" }} />
                              <span style={{ color: "#475569", fontSize: 12 }}>/ {g.max}</span>
                              <span style={{ fontWeight: 700, fontSize: 13, color: isQ4 ? "#a78bfa" : col(p) }}>{p}%</span>
                            </div>
                          </div>
                          <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{g.feedback}</div>
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
                    <th style={{ padding: "8px 10px", color: "#475569", fontWeight: 600, textAlign: "center", fontSize: 11 }}>Course</th>
                    {QS_512.map(q => (
                      <th key={q.label} style={{ padding: "8px 10px", color: q.label === "Q4" ? "#7c3aed" : "#475569", fontWeight: 600, textAlign: "center" }}>
                        {q.label}<br /><span style={{ fontSize: 10, fontWeight: 400 }}>{q.pts}pt</span>
                        {qAvg(q.label) && <><br /><span style={{ fontSize: 10, color: col(pct(Number(qAvg(q.label)), q.pts)) }}>{qAvg(q.label)}</span></>}
                      </th>
                    ))}
                    <th style={{ padding: "8px 14px", color: "#475569", fontWeight: 600, textAlign: "center" }}>Total</th>
                    <th style={{ padding: "8px 14px", color: "#475569", fontWeight: 600, textAlign: "center" }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {graded.map(s => {
                    const MAX  = s.is512 ? MAX_512 : MAX_412;
                    const tot  = s.results.grades.reduce((a, g) => a + g.score, 0);
                    const p    = pct(tot, MAX);
                    const gmap = Object.fromEntries(s.results.grades.map(g => [g.label, g.score]));
                    return (
                      <tr key={s.id} style={{ borderTop: "1px solid #1f2937" }}>
                        <td style={{ padding: "8px 14px", color: "#e2e8f0" }}>{s.name}</td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <span style={{ fontSize: 11, color: s.is512 ? "#a78bfa" : "#60a5fa", fontWeight: 700 }}>{s.is512 ? "512" : "412"}</span>
                        </td>
                        {QS_512.map(q => (
                          <td key={q.label} style={{ padding: "8px 10px", textAlign: "center" }}>
                            {gmap[q.label] !== undefined
                              ? <span style={{ color: col(pct(gmap[q.label], q.pts)), fontWeight: 700 }}>{gmap[q.label]}</span>
                              : <span style={{ color: "#374151" }}>—</span>}
                          </td>
                        ))}
                        <td style={{ padding: "8px 14px", textAlign: "center", fontWeight: 800, color: "#f1f5f9" }}>{tot}/{MAX}</td>
                        <td style={{ padding: "8px 14px", textAlign: "center", fontWeight: 700, color: col(p) }}>{p}%</td>
                      </tr>
                    );
                  })}
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
