# research/

The research agent supports the scientific work of a faculty member — designing experiments, interpreting results, synthesizing literature, and advancing research questions. It is grounded in domain knowledge and the author's active research context.

The lab's implementation of this role is **Gaia**, a research multi-agent system. The
specs and tooling live in dedicated repositories (linked below) rather than inline here,
so each can version and open on its own timeline.

## Gaia — the research multi-agent system

A coordinated family of domain-expert subagents for the Earth-science research lifecycle
(idea → literature → data → method → implementation → results → interpretation → impact).
One orchestrator dispatches focused specialists — study designer, theoretician, scientific
coder, data engineer, run monitor, research-impact, and an **independent auditor** — under
a small set of ground rules:

- **Separation of powers** — the maker is never the sole judge; the auditor is read-only.
- **Human gates** — submission, data/code release, field commitments, and large compute
  stop for a human.
- **Model tiering** — the right model for the weight of the task.
- **Always log AI use** — AI assistance is disclosed, never hidden.

> ⚠️ **Maturity caveat.** These are research prototypes under active development and
> **lightly tested**. They encode good-practice scaffolding — independent review, human
> gates, AI-use disclosure — but they are **not validated**. Treat every output as
> advisory, to be checked by a human, exactly as the agents themselves insist. The
> internal repos below open as they mature and accumulate evaluation evidence.

### Repositories

| Repo | What it is | Status |
|---|---|---|
| [`Denolle-Lab/gaia-agents`](https://github.com/Denolle-Lab/gaia-agents) | The 13-agent suite as an installable **Claude Code plugin** — agents, `/gaia:ground-rules`, and MCP servers (literature, seismic data) | internal |
| [`mdenolle/gaia-eval`](https://github.com/mdenolle/gaia-eval) | **Golden datasets** for evaluating the agents (skill-lift, false-positive discipline, κ-gated labeling) | internal |
| [`mdenolle/frugalmind`](https://github.com/mdenolle/frugalmind) | The cost-aware **evaluation harness + leaderboard** the suites run on (InspectAI / AstaBench) | internal |
| [`gaia-hazlab/gaia-translate-QA`](https://github.com/gaia-hazlab/gaia-translate-QA) | Cross-disciplinary geoscience **translator** agent (skill cards + QA) | open |
| [`gaia-hazlab/gaia-agentic-ai`](https://github.com/gaia-hazlab/gaia-agentic-ai) | GAIA HazLab agentic tooling for cross-domain geohazard research | open |
| [`mdenolle/gaia-literature-kb`](https://github.com/mdenolle/gaia-literature-kb) | Graph-RAG **knowledge base** the literature tools draw on | open |

*"internal" = currently private to the lab; will be made public as it matures. The
three-plane split — **content** (the agents), **harness** (FrugalMind), **golden** (gaia-eval)
— is described in `gaia-eval`'s evaluation framework.*

## Specs in this folder

The research role's agents are maintained in the repositories above. To propose a
*new role* in this collection, [open an issue](../.github/ISSUE_TEMPLATE/new-role.yml).
