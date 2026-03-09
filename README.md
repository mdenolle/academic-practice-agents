# Academic Practice Agents

A growing collection of agent specifications for the many roles that tenure-track faculty play in their professional lives. Each agent is grounded in a **three-layer model**: a knowledge anchor (uploaded domain documents), standing instructions (persistent rules for tone, format, and guardrails), and a prompt intent (per-interaction request with deliverable and audience named).

## Role index

| Role | Folder | Status |
|---|---|---|
| 🔬 Scientist | [`research/`](research/) | planned |
| 📋 Project manager | [`project-management/`](project-management/) | planned |
| 📊 Data analyst | [`data-analysis/`](data-analysis/) | planned |
| 🎓 Mentor | [`mentoring/`](mentoring/) | planned |
| 🔍 Reviewer | [`review/`](review/) | planned |
| 📣 Public communicator | [`communication/`](communication/) | planned |
| 📚 Curriculum builder | [`teaching/`](teaching/) | **active** |
| 🤝 Collaborator | [`collaboration/`](collaboration/) | planned |
| 💡 Pitch architect | [`proposal/`](proposal/) | planned |

---

## The three-layer model

Every spec in this repository makes three layers explicit:

| Layer | What it contains | Example (teaching) |
|---|---|---|
| **Knowledge anchor** | Uploaded documents that ground the model in the author's domain knowledge | Textbook chapters, syllabus, learning objectives |
| **Standing instructions** | Persistent rules governing tone, audience, format, guardrails, failure-mode handling | "Preserve the physics exactly. Do not simplify the math; simplify the explanation." |
| **Prompt intent** | Per-interaction request specifying deliverable, audience, and scope for *this* task | "Generate a whiteboard lecture and Jupyter notebook for Chapter 9.2 covering moment tensor decomposition." |

---

## Why instructions are not enough

This repository began as a collection of role-based agent instructions for academic life. Over time, a more important design principle became clear:

**Instructions alone do not make an agent robust.**

Instructions can externalize process. They can tell an agent how to act, what steps to follow, and what kind of output to produce. But strong performance in real academic work depends on more than a good instruction block.

Robust agents also need:

1. **Purpose**  
   What job is the agent actually helping with?

2. **Knowledge anchor / context**  
   What sources, documents, examples, or domain conventions should ground the work?

3. **Intent and audience**  
   Why is the user asking, and for whom is the output intended?

4. **Inputs**  
   What should the user provide so the agent can do meaningful work?

5. **Output structure**  
   What form should the result take?

6. **Constraints**  
   What must be preserved, avoided, or optimized?

7. **Failure modes**  
   What commonly goes wrong, and how should that be handled?

In academic settings, this matters a great deal. Research, teaching, mentoring, reviewing, and proposal writing all depend on local context, disciplinary norms, prior materials, and audience-specific expectations. An instruction that looks good in isolation can still produce shallow or misaligned work if those other elements are missing.

This repository therefore treats each agent not just as a prompt, but as a **role-specific specification** for AI-assisted academic work.
---

## ⚠️ Disclaimer

These agent instructions are **personal to me** and are **regularly updated based on performance**. The objective is to help me navigate the many facets of academic life — they are not built with sophisticated optimization or validated frameworks. Think of them as living documents that evolve as I learn what works.

---

## 🤝 Contributing

Use these agents as you wish. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide, including the fork → branch → PR workflow, quality bar, and review checklist.

- **Propose a new role** — open a [new-role issue](.github/ISSUE_TEMPLATE/new-role.yml)
- **Improve an existing spec** — open an [improve-role issue](.github/ISSUE_TEMPLATE/improve-role.yml)
- **Discuss design questions** — use [GitHub Discussions](../../discussions)

New specs must follow [TEMPLATE.md](TEMPLATE.md) and include all three layers plus at least one observed failure mode.
