 Prompt history — <your name>

> Raw, unedited transcript. False starts and bad prompts are signal, not embarrassment.
>
> This is the one artifact where AI content is *expected* — it's the conversation transcript itself. **Do not curate, summarize, or rewrite it.** A polished prompt history with no false starts is treated as evidence of curation, which lowers your AI-discipline score.

## Tool(s) used

- [ ] Claude Code
- [ ] Claude.ai
- [ ] Cursor
- [ ] Copilot
- [x] ChatGPT
- [ ] Aider
- [ ] Other:

## How much of the work was AI-assisted

- [x] Most of it
- [ ] About half
- [ ] Less than half — used it for specific tasks
- [ ] None at all

---

## Sessions

For each session, paste the raw transcript or the prompts you sent, in order. Don't trim.

### Session 1 — Initial challenge analysis

**Prompt:**
>Hello, I am about to take a technical assessment for a Senior Mobile Engineer position at T1. 
>The test they sent me can be found in this repository: https://github.com/PlataformaT1/recruiting-challenge. 
>Based on my own analysis, it doesn't seem to resemble a typical mobile development assessment. 
>Could you analyze it and provide a detailed summary of its objectives, the technologies used, the architecture, etc.? 
>Also, please suggest how I might approach this—given my background in mobile development—to effectively demonstrate my skills as a Senior Engineer.

**What the model returned:**
The AI ​​analyzed the T1 selection test and outlined its key requirements, which include identifying and fixing at least three code quality issues, implementing new functionality, adding tests, and completing the required documentation. It also identified the core technologies used in the project—TypeScript, Node.js, and SQLite—and explained how this test differs from a typical mobile development assessment. Furthermore, it provided guidance on how to effectively demonstrate the skills of a senior engineer during this test, even though it is not a mobile-focused assignment.

**What I accepted, rejected, or refined:**
I accepted the initial analysis of the challenge provided by the AI, which helped me understand the project's architecture, technologies, and primary objectives. Although the assessment was not focused on mobile development, I saw it as an opportunity to demonstrate my skills as a senior engineer through code quality, testing, architectural decisions, and problem-solving. Based on this understanding, I decided to proceed with the challenge.

---

### Session 2 — Environment Setup and Codebase Exploration

**Prompt:**
>I use macOS, and I’ve already set up my environment for this project: installing VS Code, Node.js, npm, and so on. 
>I have also successfully run the app locally at localhost:3000, as instructed in the repository, and verified that the tests pass. 
>We’ll analyze the project’s code and briefly compare it with mobile technologies to make it easier to grasp; then, we’ll identify three issues that we can address.

**What the model returned:**
The AI analyzed the existing codebase and explained the project's architecture, main components, and order management functionality. It described how the TypeScript, Express, and SQLite layers interact, comparing their responsibilities with familiar Mobile development concepts such as API endpoints, repositories, and data access layers.

The AI also identified three potential issues to investigate: unauthorized access to orders across merchants through `getById()`, insufficient validation of the `limit` query parameter, and inconsistent data access because `metrics.ts` queries SQLite directly instead of using the DAL. It recommended prioritizing the `getById()` issue due to its potential security impact.

**What I accepted, rejected, or refined:**
I accepted the AI's explanation regarding the project's architecture and its comparison to mobile development, which helped me grasp the codebase more easily. I also agreed to prioritize the issue related to `getById()` due to its potential security impact. However, I decided to investigate and reproduce the problem before implementing any changes, rather than relying solely on the AI's analysis.

---

### Session 3 — Issue 1: Merchant Data Isolation, Validation and Documentation

**Prompt:**
>I was able to successfully reproduce the issue you found; it is indeed possible to retrieve information about an order from any business simply by knowing its ID.
>To resolve this, we need to add an extra validation step to ensure that the business requesting the order is the one that actually owns it, rather than relying solely on the order ID. Please identify all classes that involve this method so that the necessary fix can be implemented.

**What the model returned:**
The AI identified the files and methods involved in the merchant isolation issue. In `src/dal/orders-dal.ts`, it recommended updating the `getById()` method to accept an additional `merchantId` parameter and modifying the SQL query to filter orders using both `id` and `merchant_id`.

It also identified the necessary changes in `src/routes/orders.ts`, where the `GET /api/orders/:id` endpoint needed to pass `req.merchantId` to the DAL method. Finally, it explained that the existing calls to `getById()` and the tests in `test/orders.test.ts` needed to be updated to match the new method signature.

**What I accepted, rejected, or refined:**
I accepted the AI's recommendation to update the `getById()` method and apply the merchant restriction directly in the SQL query. After implementing the changes, I ran automated tests using `npm test` and performed manual HTTP requests using `curl` to verify that merchants could access their own orders but could not retrieve orders belonging to other merchants.

### Session 4 — Issue 2: Investigation and Problem Reproduction

**Prompt:**
>Now we are going to look at issue 2, which you identified during the initial analysis; let’s examine it and try to reproduce the error to confirm that it is, in fact, an error.

**What the model returned:**
The AI analyzed how the `limit` parameter was handled in the `GET /api/orders` endpoint and identified that its value was converted using `Number()` without proper validation. It suggested reproducing the issue with `curl` requests using invalid values such as `abc`, `-10`, and `0`. The tests confirmed that non-numeric input caused a `500 Internal Server Error`, while negative values returned more orders than expected. The model explained how SQLite handles these values and recommended validating the parameter before executing the database query.

**What I accepted, rejected, or refined:**
I accepted the suggestion to investigate how the `limit` parameter was processed and to reproduce the issue using `curl` requests. I tested different values, including `abc`, `-10`, and `0`, and confirmed that the endpoint returned unexpected responses. These tests helped me verify that the missing input validation was a real issue before making any code changes.

### Session 5 — Issue 2: Input Validation Implementation

**Prompt:**
>After analyzing the situation, I have determined that the solution is to add validations for the `limit` parameter so that it does not accept negative or non-numeric values only positive integers. 
>I plan to modify that part of the endpoint; could you provide some guidance on the best logic to ensure all possible scenarios are covered?

**What the model returned:**
The AI suggested implementing input validation for the limit parameter directly in the HTTP route. It explained how to check whether the parameter is a string containing only digits, convert it into a number, and verify that it is a safe integer between 1 and 100. It also recommended returning 400 Bad Request for invalid values and using a default limit of 100 when the parameter is not provided. Additionally, the model explained the purpose of DEFAULT_LIMIT, MAX_LIMIT, and the let limit variable, comparing their behavior to Native Mobile Development concepts.

**What I accepted, rejected, or refined:**
I accepted the proposed validation logic for the `limit` parameter, including checking that the input contains only digits and that its numeric value is a safe integer between 1 and 100. I also accepted returning `400 Bad Request` for invalid values and keeping 100 as the default limit. Before implementing the solution, I asked for clarification about the purpose of `DEFAULT_LIMIT`, `MAX_LIMIT`, and the `let limit` variable to better understand the proposed approach.

### Session 6 — Issue 2: Automated Testing and Validation

**Prompt:**
>Now we need to create tests to validate that the modified code fixes the bug. Please guide me through the logic for these tests, and as we write them, show me what the equivalent would look like in mobile development so I can better understand the code.

**What the model returned:**
The model guided me through creating automated HTTP tests to verify the `limit` parameter validation, including invalid inputs, valid values, and the default limit of 100. It explained how to use Node.js testing tools, Express, and `fetch()` to simulate HTTP requests. When the initial test failed because the SQLite schema had not been initialized, the model helped identify the problem and suggested adding `initSchema()`. It also explained the testing approach using comparisons with mobile development concepts, helping me understand the differences between testing an HTTP endpoint and testing Kotlin application components. Finally, it recommended running `npm test` and `npm run build` to verify the implementation.

**What I accepted, rejected, or refined:**
I accepted the suggested approach for creating automated HTTP tests to validate both valid and invalid `limit` values, as well as the default behavior when the parameter is omitted. I also applied the correction to initialize the SQLite schema after the initial test failed due to missing database tables. The explanations comparing Node.js testing with mobile development helped me better understand the implementation. The model suggested allowing a `limit=0` parameter, but I rejected this because, as a real user, when we perform a query, we expect one or more results. Finally, I ran `npm test` and `npm run build`, and all 12 tests passed successfully without compilation errors.

### Session 7 — Issue 3: Investigation and Problem Reproduction

**Prompt:**
>Now let’s look at problem 3; let’s examine it and try to reproduce the error with some tests to confirm that it is, in fact, an error.

**What the model returned:**
The model identified an architectural issue in `metrics.ts`, where SQL queries were executed directly using a separate SQLite connection instead of the shared connection from `db.ts`. It explained how this could cause problems with in-memory databases and suggested running the application with `DB_PATH=:memory:` to reproduce the issue. The test confirmed the problem when the application failed with the error `In-memory/temporary databases cannot be readonly`. The model also recommended creating an automated test to reproduce the failure before implementing the fix.

**What I accepted, rejected, or refined:**
I accepted the model's recommendations to investigate the separate SQLite connection and reproduce the issue using `DB_PATH=:memory:`. I also followed its suggestion to create an automated test before implementing the fix. I did not reject or modify any recommendations during this stage.

### Session 8 — Issue 3: Database Access Refactoring

**Prompt:**
>Based on our analysis of the problem, I have determined that the solution is for `metrics` to use the same database connection as `db.ts`. We also need to ensure a proper separation of responsibilities within the architecture. How would you suggest implementing this change to ensure those responsibilities are clearly separated?

**What the model returned:**
The model suggested creating a new `metrics-dal.ts` file to centralize the SQL queries and reuse the shared SQLite connection from `db.ts`. It also recommended refactoring `metrics.ts` to remove the separate database connection and delegate data access to the DAL, while keeping HTTP request and response handling in the routes. This approach improved the separation of concerns without changing the existing API behavior.

**What I accepted, rejected, or refined:**
I accepted the model's suggestion to create `metrics-dal.ts` and reuse the shared SQLite connection from `db.ts`. I also followed its recommendation to simplify `metrics.ts` by separating HTTP handling from data access. I did not reject or modify the proposed solution.

### Session 9 — Issue 3: Automated Testing and Verification

**Prompt:**
>To finish this issue, we need to create tests to check the solution. I suggest adding automated tests to make sure the metrics still work correctly and the previous error is fixed. I would like your help to understand how to write these tests.

**What the model returned:**
The model helped me create automated tests for the metrics endpoints. It suggested testing `/summary` to verify that the shared database connection works correctly and `/top-customers` to check that customers are filtered by merchant and sorted by total spending. It also recommended an additional test to verify that the default limit of 5 customers was maintained. Finally, the model guided me through running the tests and checking that the project compiled successfully. All 15 tests passed.

**What I accepted, rejected, or refined:**
I accepted the model's suggestions to create automated tests for both metrics endpoints. I also followed its recommendation to add tests for merchant filtering and the default limit of 5 customers. I did not reject any suggestions, and after running the tests, all 15 passed successfully.

### Session 10 — CSV Export — Requirements Analysis and Design

**Prompt:**
>Now, for the final part of this test, I need to add a new feature to the project. There are three options, which are described in the README file. I would personally like to implement an export-to-CSV feature for orders, as I believe this is a task frequently performed by businesses for their reporting in real-world systems. However, let’s analyze each option to gauge its complexity and decide which one to implement, based on the time remaining before the test submission deadline.

**What the model returned:**
The model analyzed the three available features: CSV Export, Webhooks, and Advanced Search, comparing their implementation complexity, required changes, and estimated development effort.

It identified CSV Export as the lowest-complexity option because it could reuse the existing orders data access layer and required relatively limited backend and frontend changes. Advanced Search would require additional filtering logic and UI changes, while Webhooks would introduce more complex concerns such as event delivery, retries, and failure handling.

Based on this comparison, the model recommended implementing CSV Export as the most practical option within the challenge's time constraints, allowing enough time for automated testing, validation, and documentation.

**What I accepted, rejected, or refined:**
I accepted the model's recommendation to implement CSV Export because it was the most feasible option within the challenge's time constraints. I prioritized delivering a complete, tested feature over choosing a more complex implementation such as Webhooks or Advanced Search. I did not make significant changes to the initial feature selection recommendation.

### Session 11 — CSV Export — Backend Implementation

**Prompt:**
>We have decided to implement the export of orders to CSV; we are proceeding step by step, adding the necessary functions and the new endpoint, while reusing components that are already implemented and ready for this export process.

**What the model returned:**
The model provided a step-by-step implementation plan for the CSV Export backend, following the project's existing architecture.

It suggested adding a new method, `listForExport()`, to the orders DAL to retrieve merchant-specific orders within a date range, and creating an `orders-csv.ts` utility to generate CSV content with proper escaping of special characters and basic protection against spreadsheet formula injection.

The model also guided the implementation of the `GET /api/orders/export` endpoint, including date validation, merchant filtering, CSV response headers, and a maximum export limit of 10,000 orders to prevent excessively large exports. It recommended placing the export route before the dynamic `/:id` route to avoid routing conflicts.

The implementation was completed incrementally, with compilation and automated tests used to verify the changes.

**What I accepted, rejected, or refined:**
I accepted the model's proposed approach and implemented the CSV Export backend incrementally, following the existing project architecture. I added the `listForExport()` method to the orders DAL, created a separate utility for CSV generation, and implemented the export endpoint with date validation and merchant filtering.

I also adopted the recommended 10,000-order limit, CSV escaping, and basic protection against spreadsheet formula injection. I verified each implementation step through compilation and automated tests. I did not make significant changes to the proposed backend design.

### Session 12 — CSV Export — Automated Testing and Validation

**Prompt:**
>Now that we have the necessary code implementation in place, we will perform tests before adding visual components to the screen to verify that our code is correct and functions as expected.

**What the model returned:**
The model recommended expanding the automated test coverage for CSV Export to validate both successful exports and error scenarios.

It guided the implementation of tests to verify that exported orders belonged to the selected merchant and fell within the requested date range. It also suggested testing invalid or missing dates, reversed date ranges, proper escaping of special CSV characters, and basic protection against spreadsheet formula injection.

Additionally, the model recommended testing the maximum export limit by inserting 10,001 orders into SQLite within a transaction and verifying that the endpoint returned HTTP 413 with the `export_limit_exceeded` error.

The model explained the purpose of each test and recommended running the test suite and TypeScript compilation after each implementation step. All 20 automated tests and the build completed successfully.

**What I accepted, rejected, or refined:**
I accepted the model's recommendations to expand the automated test coverage for CSV Export, including merchant isolation, date range validation, CSV escaping, and basic protection against spreadsheet formula injection.

I also implemented the suggested test for the 10,000-order export limit, using a SQLite transaction to insert 10,001 orders efficiently. I followed the incremental testing approach and verified that all 20 automated tests passed and the project compiled successfully.

I did not make significant changes to the proposed testing approach.

### Session 13 — CSV Export — Dashboard Integration and Manual Testing

**Prompt:**
>Okay, since we have confirmed during testing that it works correctly, the final step is to add the visual components such as the date fields and the button and verify that it actually downloads the CSV file with the requested data.

**What the model returned:**
The model provided step-by-step guidance for integrating the CSV Export feature into the existing dashboard.

It recommended adding two date inputs and a Download CSV button to `index.html`, along with basic CSS styling. For `app.js`, the model suggested initializing a default 30-day date range and implementing a download function using `fetch()`, `Blob`, and `URL.createObjectURL()` to generate a downloadable file in the browser.

The model also recommended including the selected merchant's ID in the request headers, validating the date range before submitting the request, and displaying appropriate success or error messages.

Finally, it provided a manual testing checklist to verify successful downloads, merchant data isolation, invalid date handling, and exports with no matching orders. The dashboard integration and manual tests were completed successfully.

**What I accepted, rejected, or refined:**
I accepted the model's recommendations for integrating CSV Export into the existing dashboard. I added the date inputs, the Download CSV button, and the required styling.

I also implemented the suggested download logic using `fetch()`, `Blob`, and `URL.createObjectURL()`, including merchant identification, date range validation, and success and error messages.

Finally, I manually tested the feature with different merchants and date ranges, confirming that the CSV files contained the expected data and that invalid date ranges were handled correctly. I did not make significant changes to the proposed frontend implementation.

---

## What Claude (or your AI tool) got wrong

> **Mandatory.** Three or more specific examples of AI output you rejected, corrected, or had to re-prompt. If you cannot fill this section, that itself is the signal — either nothing was reviewed, or the review left no trace. Either way, the score reflects it.
>
> For each example, fill all five fields. Vague answers ("it was wrong about the types") score lower than specific ones ("Claude proposed a `getById(id)` signature that doesn't carry the merchant context; I rejected it because the IDOR fix has to live in the DAL — see commit `abc1234`").

### Example 1

- **The prompt:**
- **What Claude returned:**
- **What was wrong with it** (technically, not just stylistically):
- **How I caught it** (what tipped you off — code reading, test failure, behavior in the browser, prior experience):
- **What I did instead** (and where to see it in the diff, if applicable):

### Example 2

- **The prompt:**
- **What Claude returned:**
- **What was wrong with it:**
- **How I caught it:**
- **What I did instead:**

### Example 3

- **The prompt:**
- **What Claude returned:**
- **What was wrong with it:**
- **How I caught it:**
- **What I did instead:**