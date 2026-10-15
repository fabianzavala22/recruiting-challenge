# Decision Log — Luis Fabián Zavala Vázquez

> **Write this yourself, without AI assistance.** Spell-check is fine. AI-drafted, AI-rewritten, or AI-polished decision logs are an automatic decline — see `SUBMISSION.md` for why.
>
> Two pages max. Specifics over generalities. Confidence and disagreement are part of the score — own both.

## Authorship declaration

> Replace this block with one of the two statements below, in your own words if you prefer:
>
> - *"I wrote this decision log entirely without AI assistance. The only tool I used on it was spell-check."*

---

## Issues addressed

> Defects, security smells, architectural problems, missing pieces, scaling risks — anything you decided was worth your time. For each, fill in **every** sub-field. An empty field is a worse signal than an awkward answer.

- **Issue 1 — Cross-merchant access getById**
  - What was wrong or weak: The endpoint using ordersDal.getById retrieved orders solely by ID without verifying that the order belonged to the specified merchant; consequently, a merchant could access order information belonging to another merchant.
  - Shape of my improvement: I modified the getById method to include the mandatory merchantId parameter alongside the id, restricted the SQL query by adding `AND merchant_id = ?` so that only orders matching both identifiers are returned, and finally added tests to verify correct behavior.
  - **Confidence (1–10):** 9
  - **What would falsify this fix** (a specific scenario, input, or behavior that would prove me wrong): If a merchant could still retrieve order information belonging to another merchant, the solution would be incorrect; conversely, if a merchant could no longer access their own orders, that would also indicate the solution is invalid.
  - **I disagreed with Claude on:** (name where you pushed back during this fix — the rejected suggestion, the alternative shape, the over-scoped refactor — or write *"did not disagree"* and be ready to defend that in the interview) The AI ​​suggested running two tests to verify the solution: one using `npm test` and another using `curl`. I initially skipped the second test, thinking it was unnecessary, but I eventually ran it after realizing that `npm test` validates that the DAL method correctly applies the merchant filter, while `curl` validates that the HTTP endpoint utilizes that restriction and returns the expected response.
  - Alternatives I considered and rejected: I Consider implementing the solution directly within the `orders.ts` logic: after retrieving the order, validate whether it belongs to the merchant and return a 404 if it does not. I rejected this approach because the DAL would still allow orders to be retrieved without merchant-based restrictions, and other endpoints might fail to implement the same check.

- **Issue 2 — <short title>**
  - What was wrong or weak:
  - Shape of my improvement:
  - **Confidence (1–10):**
  - **What would falsify this fix:**
  - **I disagreed with Claude on:**
  - Alternatives I considered and rejected:

- **Issue 3 — <short title>**
  - What was wrong or weak:
  - Shape of my improvement:
  - **Confidence (1–10):**
  - **What would falsify this fix:**
  - **I disagreed with Claude on:**
  - Alternatives I considered and rejected:

## Feature chosen

- **Feature:**
- **Why this one and not the others:**
- **What I cut to ship it in budget:**
- **Confidence (1–10) that the shape I picked is the right one:**
- **What would change my mind:**

## Things I noticed but did NOT fix

> Class-of-bug instances you saw and chose not to touch. For each, name the *reason* you cut it (scope / time / dependency / "needs a larger conversation").

-

## Docs / code I left alone deliberately

-

## What I'd do with another 6 hours

-

## Where I felt uncertain

> At least three places in this submission where you were not confident. Genuine uncertainty is a strength signal. "Nothing — I was confident everywhere" is itself a red flag and will be probed.

-
-
-