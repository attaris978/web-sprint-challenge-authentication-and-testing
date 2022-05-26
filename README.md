# Authentication and Testing Sprint Challenge

**Read these instructions carefully. Understand exactly what is expected _before_ starting this Sprint Challenge.**

This challenge allows you to practice the concepts and techniques learned over the past sprint and apply them in a concrete project. This sprint explored **Authentication and Testing**. During this sprint, you studied **authentication, JSON web tokens, unit testing, and backend testing**. In your challenge this week, you will demonstrate your mastery of these skills by creating **a dad jokes app**.

This is an individual assessment. All work must be your own. All projects will be submitted to Codegrade for automated review. You will also be given feedback by code reviewers on Monday following the challenge submission. For more information on the review process [click here.](https://www.notion.so/bloomtech/How-to-View-Feedback-in-CodeGrade-c5147cee220c4044a25de28bcb6bb54a)

You are not allowed to collaborate during the sprint challenge.

## Project Setup

- [ ] Run `npm install` to install your dependencies.
- [ ] Build your database executing `npm run migrate`.
- [ ] Run tests locally executing `npm test`.

## Project Instructions

Dad jokes are all the rage these days! In this challenge, you will build a real wise-guy application.

Users must be able to call the `[POST] /api/auth/register` endpoint to create a new account, and the `[POST] /api/auth/login` endpoint to get a token.

We also need to make sure nobody without the token can call `[GET] /api/jokes` and gain access to our dad jokes.

We will hash the user's password using `bcryptjs`, and use JSON Web Tokens and the `jsonwebtoken` library.

### MVP

Your finished project must include all of the following requirements (further instructions are found inside each file):

- [ ] An authentication workflow with functionality for account creation and login, implemented inside `api/auth/auth-router.js`.
- [ ] Middleware used to restrict access to resources from non-authenticated requests, implemented inside `api/middleware/restricted.js`.
- [ ] A minimum of 2 tests per API endpoint, written inside `api/server.test.js`.

**IMPORTANT Notes:**

- Do not exceed 2^8 rounds of hashing with `bcryptjs`.
- If you use environment variables make sure to provide fallbacks in the code (e.g. `process.env.SECRET || "shh"`).
- You are welcome to create additional files but **do not move or rename existing files** or folders.
- Do not alter your `package.json` file except to install extra libraries. Do not update existing packages.
- The database already has the `users` table, but if you run into issues, the migration is available.
- In your solution, it is essential that you follow best practices and produce clean and professional results.
- Schedule time to review, refine, and assess your work and perform basic professional polishing.

## Submission format

- [ ] Submit via Codegrade by pushing commits to your `main` branch on Github.
- [ ] Check Codegrade before the deadline to compare its results against your local tests.
- [ ] Check Codegrade on the days following the Sprint Challenge for reviewer feedback.
- [ ] New commits will be evaluated by Codegrade if pushed _before_ the sprint challenge deadline.

## Interview Questions

Be prepared to demonstrate your understanding of this week's concepts by answering questions on the following topics.

1. Differences between using _sessions_ or _JSON Web Tokens_ for authentication.
Authentication sessions are stateful, meaning that information pertaining to the individual session is maintained on the server (and referenced for use in authorization, etc.). This also means that the session can be terminated by removing the session information.
Authentication using JWTs, in contrast, is stateless: all the information needed to verify the authenticity of the JWT is located within the token itself (with the minor addition of the SECRET which lives on the server and is used to produce/authenticate the token signature). While this reduces chatter with the server (as verification of the presence of a session on the server needn't happen every time a resource needs to be accessed), it also means that a JWT's validity cannot be revoked at will, but will instead expire at the time decided when it was first issued. Granted, there are workarounds to this, but they involve maintaining some amount of state on the server, which therefore obviates some of the benefits that JWTs afford. 

2. What does `bcryptjs` do to help us store passwords in a secure manner?
Bcrypt (packaged as bcryptjs) makes use of KDFs (key-derivation functions) to help strengthen the security of "keys" which are saved and used for various purposes (one primary example being authentication). Of the methods that KDFs use to accomplish this, Bcrypt is particular adept at Key Stretching (or, to put it another way, Bcrypt is not particularly effective at Key Separation, key Expansion, Key Whitening -- Bcrypt has a "password" limit of 72 characters, as opposed to Argon2 which accepts up to somewhere in the neighborhood of 4,290,000,000 characters for input). Bcrypt takes the supplied string, runs it through a hashing algorithm a specified number of times, and outputs the result. The number of iterations of the hashing algorithm is then stored with the hashed password, so that when a user submits a password for authentication, bcrypt can run that password through the same algorithm and equal number of times and check if the resulting hashes match.
Because of this process, the user's password needn't ever be stored, and thus cannot be directly stolen should the server become compromised. Additionally, because KDF's are intentionally processor-intensive, they take time to run, and so a hacker attempting a brute-force / dictionary / rainbow table attack on the server to try and figure out the password will be slowed to an exponentially impressive rate, just by increasing the hashing iterations by a degree or two.

3. How are unit tests different from integration and end-to-end testing?
Unit tests test isolated, small portions of code to ensure that they operate properly by themselves. Itegration tests then test how effectively these units work together. End-to-end testing takes a macroscopic view of the application and test how effectively the system in its entirety works.

4. How does _Test Driven Development_ change the way we write applications and tests?
TDD operates in the reverse manner from how most people think about coding. Rather than write the code to perform the task and then writing tests to make sure it does what it's supposed to do in perpetuity, TDD specifies to work backwards. By writing the tests first, it forces the programmer to think of their approach from the perspective of a user. It asks, what is this supposed to do, how will I know that it's successful, and how will I know if it's not successful? It thereby mandates that a programmer can articulate what it means for their code to be fully-functional or buggy. It therefore is able to direct the composition of code in a progressive, sequential manner. It then allow the programmer to refactor their code to improve it with less risk of regression.