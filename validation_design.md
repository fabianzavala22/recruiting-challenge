# Validation design — Luis Fabián Zavala Vázquez

> **Write this yourself, without AI assistance.** Spell-check is fine. AI-drafted validation design is an automatic decline — this artifact measures *your* judgment about how to make AI-augmented code safe to ship, which is the load-bearing architect-tier signal.
>
> ~300 words total. Concrete, named gates only — not philosophy.

## Authorship declaration

> Replace this block with one of:
> - *"I wrote this validation design entirely without AI assistance. The only tool I used was spell-check."*

---

## The question

Anyone with a competent AI tool can fix the symptoms in this codebase. What separates an architect is *building the validation layer that catches the class of bug next time* — so the same mistake cannot quietly reach production again.

For each issue class you addressed, name the gate you built (or would build with more time) that prevents the class — not just the instance. "Added a regression test" is the floor; what's the gate?

Forms a gate can take, in rough order of robustness:

- A regression test pointing at the specific bug (floor — always add this, never the whole answer)
- A property-based or fuzz test that asserts an invariant the bug violated
- A golden test / contract test at the API boundary
- A CI rule, lint rule, or pre-merge script that fails on the pattern
- A type-system constraint that makes the bug uncompilable
- An architecture rule or import-restriction that makes the bad shape impossible
- An eval suite that grades AI output against the class of failure

## What to fill in

For each issue *class* you addressed (not each instance — group by class):

### Class 1 — Multi-tenant authorization (IDOR)

- **Instances I fixed:** In GET /api/orders/:id I modified the orders query so that getById() filters by two identifiers: id and merchant_id.
- **The gate I built (or would build):** I would create an authorization test that verifies data isolation between merchants and blocks any pull request if the test fails.
- **What this gate would catch that a regression test would miss:** A specific regression test would verify that `GET /api/orders/:id` does not return orders belonging to another merchant, and the gate I am proposing could verify isolation between merchants across various endpoints.
- **Where to see the gate in the diff** (file path / commit / line range) — *if you actually built it*: No implementation available in the current diff.
- **If you did not build it,** name the reason (scope, time, dependency, "this is the right call but needs a wider conversation"): Due to time constraints.

### Class 2 — Input Validation

- **Instances I fixed:** In GET /api/orders, I added restrictions on the allowed values ​​for the limit parameter, as there were previously no validations in place meaning invalid values ​​could be submitted, resulting in inconsistent data being returned.
- **The gate I built (or would build):** I would create a test that defines a property that must always hold true in this case, a positive integer between 1 and 100 and, using a tool, I would generate many different values.
- **What this gate would catch that a regression test would miss:** A regression test like the ones we implemented verifies known cases for example, limit=0; the check I’m proposing could detect if a future change were to allow an invalid value, in which case the test would run as part of every pull request and block its integration.
- **Where to see the gate in the diff** (file path / commit / line range) — *if you actually built it*: No implementation available in the current diff.
- **If you did not build it,** name the reason (scope, time, dependency, "this is the right call but needs a wider conversation"): Due to time constraints.

### Class 3 — Database Connection Management

- **Instances I fixed:** The `metrics.ts` file was opening a separate SQLite connection from the one used by the rest of the application; the solution was to create `metrics-dal.ts` and reuse the shared connection from `db.ts`.
- **The gate I built (or would build):** I would create an Architecture Rule that prevents any module from establishing SQLite connections directly, with the exception of `db.ts`.
- **What this gate would catch that a regression test would miss:** A regression test verifies that the /api/metrics endpoint functions correctly when using the SQLite configuration; meanwhile, the gate I am proposing would detect and prevent any future attempt to establish a SQLite connection directly from another module.
- **Where to see the gate in the diff** (file path / commit / line range) — *if you actually built it*: No implementation available in the current diff.
- **If you did not build it,** name the reason (scope, time, dependency, "this is the right call but needs a wider conversation"): Due to time constraints.

---

## Anti-patterns we score against

- "Added regression tests" with no class-level gate proposed for any class. The instance is patched; the class is not.
- A gate proposed for every class but none actually built in the diff, with no honest accounting of why.
- Generic prose ("I would invest in observability and CI quality") with no named tool, rule, or invariant.
- A 30-line wall of suggestions that reads like an AI-generated checklist. We expect 1–3 *real* gates designed deliberately, not 10 generic ones.
