# [Role]: [Descriptive title]

> One-sentence purpose statement.

**Version:** v0.1 · **Status:** experimental · **Tag:** `<skill-slug>/v0.1`

## Knowledge anchor

List the types of documents you upload to ground this agent:

- (e.g., textbook chapters, prior funded proposals, reviewer feedback)
- ...

## Standing instructions

Paste or describe the persistent instruction set for this role:

- **Audience:**
- **Tone:**
- **Format constraints:**
- **Must preserve:**
- **Must not do:**
- **Known failure modes and guardrails:**

## Prompt intent (example)

Provide one or two concrete example prompts that show how this agent is used in practice. Each example should name the deliverable, the audience, and any per-interaction constraints.

## Where it fails

Describe at least one failure mode you have observed and how you handle it. Each
failure mode here is also the seed for an evaluation case (see below).

## Evaluation

How would you tell this skill is working — and not over-reaching? List eval cases,
or link to an `evals/` folder beside this spec. At minimum, turn each failure mode
above into one case: a synthetic input, what the skill *should* do, and what it
must *not* do. See [EVALUATION.md](EVALUATION.md).

- **Positive:** [given X, the skill should do Y]
- **Negative:** [the skill must not do Z]

## Version history / changelog

Bump the version on every meaningful change; tag releases as `<skill-slug>/vX.Y`
(see [CONTRIBUTING.md](CONTRIBUTING.md)).

| Version | Date | Change | Reason |
|---|---|---|---|
| v0.1 | YYYY-MM-DD | Initial version | — |
