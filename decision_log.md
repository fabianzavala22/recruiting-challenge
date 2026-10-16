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
  - **I disagreed with ChatGPT on:** (name where you pushed back during this fix — the rejected suggestion, the alternative shape, the over-scoped refactor — or write *"did not disagree"* and be ready to defend that in the interview) The AI ​​suggested running two tests to verify the solution: one using `npm test` and another using `curl`. I initially skipped the second test, thinking it was unnecessary, but I eventually ran it after realizing that `npm test` validates that the DAL method correctly applies the merchant filter, while `curl` validates that the HTTP endpoint utilizes that restriction and returns the expected response.
  - Alternatives I considered and rejected: I Consider implementing the solution directly within the `orders.ts` logic: after retrieving the order, validate whether it belongs to the merchant and return a 404 if it does not. I rejected this approach because the DAL would still allow orders to be retrieved without merchant-based restrictions, and other endpoints might fail to implement the same check.

- **Issue 2 — Missing validation for the limit parameter**
  - What was wrong or weak: The GET /api/orders endpoint accepted a `limit` parameter and converted it directly into a number, but it failed to validate whether the input value was a positive number; this allowed for the processing of negative or non-numeric values, which resulted in incorrect behavior in the response.
  - Shape of my improvement: Added validations for the `limit` parameter in the endpoint: the value must now be a positive integer between 1 and 100. If the client sends an invalid value, the API nows returns a `400 Bad Request` response instead of passing the invalid limit value to SQLite. Additionally, added HTTP tests to verify both valid and invalid values.
  - **Confidence (1–10):** 9
  - **What would falsify this fix:** If the endpoint receives a value that we consider invalid for example, `limit=-10` or `limit=abc`and returns a 200 or 500 status code instead of the 400 Bad Request that we configured, it would mean that the validation is not working. Furthermore, if a request with `limit=10` returns more than 10 orders, the API would not be respecting the requested limit.
  - **II disagreed with ChatGPT on:** The AI suggested that if `limit=0` were sent, it should be processed as it currently is returning a valid, empty response but from the perspective of an actual user, I believe that when we perform a search, it is because we want one or more results.
  - Alternatives I considered and rejected: I considered implementing validation for the limit parameter directly in the DAL (orders-dal.ts), but after further analysis, I decided to perform the validation at the HTTP layer (orders.ts) before calling the DAL. For the purposes of this challenge, I believe an HTTP-layer solution is sufficient, because that is where parameters sent by the client are interpreted and validated, and where appropriate status codes (such as 400 Bad Request) are returned.

- **Issue 3 — Independent SQLite Connection in Metrics Routes**
  - What was wrong or weak: The `metrics.ts` file contained a separate SQLite connection. From an architectural standpoint, this represented an improper separation of concerns, which hindered compatibility with in-memory databases and complicated code maintenance.
  - Shape of my improvement: I created a new file, `metrics-dal.ts`, to centralize SQL queries related to metrics. I reused the SQLite connection from `db.ts` to eliminate the separate connection in `metrics.ts` and modified `metrics.ts` so that it only handles HTTP requests and responses, while the DAL manages data access. Finally, I added tests to verify that both endpoints function correctly.
  - **Confidence (1–10): 9**
  - **What would falsify this fix:** If the metrics returned incorrect results that did not match the data stored in the database, or if the `top-customers` endpoint returned more than 5 customers when no `limit` was specified, it would indicate that my solution did not fully resolve the problem.
  - **I disagreed with ChatGPT on:** I had no disagreements with the solution proposed for this issue.
  - Alternatives I considered and rejected: I considered using the shared connection in `metrics.ts` by removing the duplicate connection and importing `db` directly into the routes, but I rejected that approach because, although it would have solved the connection issue, the SQL queries would still have remained in the HTTP layer. So, the final solution was to create `metrics-dal.ts` to separate data access from the routes.

## Feature chosen

- **Feature:** CSV export of orders.
- **Why this one and not the others:** I chose CSV Export over the other options primarily due to the time available, its low complexity, and the ability to leverage the existing DAL.
- **What I cut to ship it in budget:** Limit exports to 10,000 orders, background processing, or bulk exports.
- **Confidence (1–10) that the shape I picked is the right one:** 9
- **What would change my mind:** If I needed to export hundreds of thousands of orders or generate files that are too large to process in memory.

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