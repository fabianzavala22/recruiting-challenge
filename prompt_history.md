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
```
Hello, I am about to take a technical assessment for a Senior Mobile Engineer position at T1. The test they sent me can be found in this repository: https://github.com/PlataformaT1/recruiting-challenge. Based on my own analysis, it doesn't seem to resemble a typical mobile development assessment. Could you analyze it and provide a detailed summary of its objectives, the technologies used, the architecture, etc.? Also, please suggest how I might approach this—given my background in mobile development—to effectively demonstrate my skills as a Senior Engineer.

```

**What the model returned:**
The AI ​​analyzed the T1 selection test and outlined its key requirements, which include identifying and fixing at least three code quality issues, implementing new functionality, adding tests, and completing the required documentation. It also identified the core technologies used in the project—TypeScript, Node.js, and SQLite—and explained how this test differs from a typical mobile development assessment. Furthermore, it provided guidance on how to effectively demonstrate the skills of a senior engineer during this test, even though it is not a mobile-focused assignment.

**What I accepted, rejected, or refined:**
I accepted the initial analysis of the challenge provided by the AI, which helped me understand the project's architecture, technologies, and primary objectives. Although the assessment was not focused on mobile development, I saw it as an opportunity to demonstrate my skills as a senior engineer through code quality, testing, architectural decisions, and problem-solving. Based on this understanding, I decided to proceed with the challenge.

---

### Session 2 — Environment Setup and Codebase Exploration

**Prompt:**
```
I use macOS, and I’ve already set up my environment for this project: installing VS Code, Node.js, npm, and so on. I’ve also successfully run the app locally at localhost:3000, as instructed in the repository, and verified that the tests pass. We’ll analyze the project’s code and briefly compare it with mobile technologies to make it easier to grasp; then, we’ll identify three issues that we can address.

```

**What the model returned:**
The AI analyzed the existing codebase and explained the project's architecture, main components, and order management functionality. It described how the TypeScript, Express, and SQLite layers interact, comparing their responsibilities with familiar Mobile development concepts such as API endpoints, repositories, and data access layers.

The AI also identified three potential issues to investigate: unauthorized access to orders across merchants through `getById()`, insufficient validation of the `limit` query parameter, and inconsistent data access because `metrics.ts` queries SQLite directly instead of using the DAL. It recommended prioritizing the `getById()` issue due to its potential security impact.

**What I accepted, rejected, or refined:**
I accepted the AI's explanation regarding the project's architecture and its comparison to mobile development, which helped me grasp the codebase more easily. I also agreed to prioritize the issue related to `getById()` due to its potential security impact. However, I decided to investigate and reproduce the problem before implementing any changes, rather than relying solely on the AI's analysis.

---

### Session 3 — Issue 1: Merchant Data Isolation, Validation and Documentation

**Prompt:**
```
I was able to successfully reproduce the issue you found; it is indeed possible to retrieve information about an order from any business simply by knowing its ID. To resolve this, we need to add an extra validation step to ensure that the business requesting the order is the one that actually owns it, rather than relying solely on the order ID. Please identify all classes that involve this method so that the necessary fix can be implemented.

```

**What the model returned:**
The AI identified the files and methods involved in the merchant isolation issue. In `src/dal/orders-dal.ts`, it recommended updating the `getById()` method to accept an additional `merchantId` parameter and modifying the SQL query to filter orders using both `id` and `merchant_id`.

It also identified the necessary changes in `src/routes/orders.ts`, where the `GET /api/orders/:id` endpoint needed to pass `req.merchantId` to the DAL method. Finally, it explained that the existing calls to `getById()` and the tests in `test/orders.test.ts` needed to be updated to match the new method signature.

**What I accepted, rejected, or refined:**
I accepted the AI's recommendation to update the `getById()` method and apply the merchant restriction directly in the SQL query. After implementing the changes, I ran automated tests using `npm test` and performed manual HTTP requests using `curl` to verify that merchants could access their own orders but could not retrieve orders belonging to other merchants.

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