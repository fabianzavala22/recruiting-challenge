# Sign-off — Luis Fabián Zavala Vázquez

> **Write this yourself, without AI assistance.** Spell-check is fine. The whole point of this artifact is the first-person attribution — AI cannot author it authentically.
>
> One line per meaningful commit (skip pure-doc commits if you want). Cover at minimum every commit that touches `src/` or `test/`.

## Authorship declaration

> Replace this block with one of:
>
> - *"I wrote this sign-off entirely without AI assistance."*

---

## How to fill this in

For each commit, pick the line that matches what actually happened. Mix is expected — a submission that claims "I have read this fully" on every single commit is treated as a calibration failure, not a strength signal. Honest accounting earns more credit than performed thoroughness.

Use one of these line shapes:

- ✅ **`<sha>` — I have read this. I checked <specific things>. I would stake my name on it shipping to a 1.5k-RPS production system tonight.**
- ⚠️ **`<sha>` — I have read most of this. I'm confident on <X> but uncertain on <Y>. I'd want <a code reviewer / a load test / a property-based test> before staking my name on prod.**
- ❌ **`<sha>` — I have NOT fully read this. Claude generated it and I accepted because <specific reason — e.g. "boilerplate scaffolding", "test fixtures I will re-verify before merge"). Risks I accept: <named risks>.**

Be specific about what you actually checked — *"I read it"* without naming what you looked for is worth less than *"I checked the SQL parameterization, the WHERE clause against the IDOR fix in commit X, and ran the integration test against an in-memory DB"*.

---

## Sign-offs

> Add lines below. List by commit SHA (or a short commit-title prefix if you prefer); ordering by time is fine.

- ✅ **`46035b5 - fix: add the merchant ID to the order request` — I have read this. I checked that the SQL query and the endpoint return an error if the order does not belong to the requested merchant. I would stake my name on it shipping to a production system tonight.**
- ✅ **`403a10b Added validation for the limit parameter in the orders endpoint` — I have read this. I checked that the `limit` parameter in the SQL query accepts only positive numeric values; I conducted tests to ensure it functions correctly with both valid and invalid values. I would stake my name on it shipping to a production system tonight.**
- ⚠️  **`f8dd3a4 fix: A shared SQLite connection for metrics was added` — I have read most of this. I'm confident that the metrics now use the same SQLite instance as the rest of the application, as automated tests were conducted to verify this. but uncertain about how the shared connection will behave when many simultaneous requests arrive. I'd want a load test before staking my name on prod.**
- ⚠️ **`d055dd2 feat: Added CSV Export` — I have read most of this. I'm confident that order information is correctly exported for the requested date range; if there are no orders within those dates, the exported file contains only the headers. I have run automated tests to verify that it functions correctly. but uncertain about how the export process would behave if we were to download a large volume of orders approaching the 10,000 order limit in terms of how long the download would take and how much memory it would consume. I'd want a performance tests before staking my name on prod.**

---

## What this artifact measures

The signal is not "did you read every line" — that's not what an architect does. The signal is **whether you can honestly account for what you read, what you trusted, and what you took on faith** — and whether the language you use is first-person ownership ("I accepted") rather than tool-deflection ("Claude wrote it"). The latter is what we score.
