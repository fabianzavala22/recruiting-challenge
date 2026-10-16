# Written answers — Luis Fabián Zavala Vázquez

> **Write this yourself, without AI assistance.** Spell-check is fine. AI-drafted, AI-rewritten, or AI-polished written answers are an automatic decline — these questions exist specifically to measure how *you* think, write, and tell stories about your own past work.
>
> ~200 words per question. Past-tense, real systems. See `SUBMISSION.md`.

## Authorship declaration

> Replace this block with one of the two statements below, in your own words if you prefer:
>
> - *"I wrote these answers entirely without AI assistance. The only tool I used was spell-check."*

> If English is not your first language, write in English anyway and don't worry about polish. We score substance and specificity, not grammar. Honest rough writing beats AI-laundered prose.

---

## Q1 — Production correctness validation

> Describe a system you owned where you had to add production correctness validation — alarms, contract tests, golden datasets, something that caught a class of bugs before users did. What did you do, what worked, what didn't, and what would you do differently?

When I worked as a Mobile Technical Lead for the Citibanamex application, I was responsible for adding a new feature to the app's dashboard. This feature relied on a new API, which I discovered after implementation was taking too long to return a response. This threatened to impact the dashboard's performance and, more importantly, the end-user experience; users expect to see their information as quickly as possible upon opening the app. I conducted performance tests and found that the API was delaying the dashboard's load time by a few milliseconds a delay that was nonetheless noticeably apparent within the application. I escalated the feature to the bank’s performance team, who confirmed the lag. My strategy was to relocate the API call to a part of the application where it would not visually affect performance, while also leveraging native mobile development tools to handle the task in the background. This ensured the main thread remained unblocked. Once implemented, the solution worked perfectly, and the new feature was successfully deployed to production. Looking back, what I would do differently as a Technical Lead is to validate potential performance impacts before authorizing the development of any new feature.



## Q2 — Scaling-forced structural change

> Describe a system you've worked on where scaling — traffic, data volume, team size, or geography — forced a structural change to the code or architecture. What changed, who pushed back, and how did you decide?

For the Citibanamex App project, metrics and analytics were implemented using Adobe Analytics; the Adobe platform provided all the data regarding how users interacted with the application. My team and I were tasked with integrating additional Adobe tools to personalize user experiences. To implement these, we relied on the data stored in Adobe Analytics; however, we encountered a significant issue: Adobe Analytics recorded data with a delay of approximately five hours, and the information itself was often inconsistent. Consequently, we decided to migrate the app’s analytics to a new tool called Adobe Edge, which captures data in real time. This transition required modifying how analytics were transmitted throughout the entire application. We discussed this with the app’s leadership; initially, many teams were resistant, as they feared they would have to alter their existing implementations, and the QA team would need to change their testing procedures. To address this, we designed a new analytics module that allowed data to be captured just as it had been before. We then used a manager class to transform that data to fit the new architecture required by Adobe Edge. This ensured that no other teams were negatively impacted or forced to modify their own analytics functions. The proposal was approved, and the system is now live in production, serving millions of users.



## Q3 — A time you rejected AI output (or accepted bad output and changed your process)

> Describe a specific moment in real work where you rejected AI output that you initially thought was correct, **or** accepted AI output that turned out to be wrong. Be concrete: what was the task, what was the output, what was the signal that flipped your judgment, and what did you do next? If the answer is "I accepted it and it shipped a bug," what did you change about your process so the class of mistake doesn't recur?

> *We are looking for one specific moment, not a philosophy of how you use AI. If you have not yet faced this in production work, write that honestly and describe the review process you've built for yourself instead — "strategies, not excuses" applies.*

Two years ago, I worked as a freelancer on a project for a local delivery company, tasked with designing a mobile application to manage their shipments, routes, payments, and more. I used AI to help analyze the budget and timeline based on the app's requirements. The AI ​​suggested building a hybrid application, noting that it would save time and align with the company’s budget; I agreed and began development. However, as I added new features, I started encountering the limitations of the hybrid model specifically regarding native development tools like map navigation, camera access, sensors, Bluetooth, and others. This began to delay the project. Given these constraints, I decided to halt the hybrid development and switch to a native approach. While this slightly increased the budget, the resulting application offered better stability and performance in a production environment. Through this experience, I learned to place greater trust in my own expertise as a developer and to rely on AI only when truly necessary, rather than for critical business decisions.