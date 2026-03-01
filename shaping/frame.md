# Couples Question Card Game — Frame

## Source

> A real-time two-player web app for couples to have structured, meaningful conversations. Players join a shared session, select question bundles, add their own questions (which get anonymously rephrased by an LLM), and then take turns discussing questions together — with anonymous voting on whether to discuss or skip each one.
>
> The core design philosophy is **removing social pressure and bias**: neither player knows who authored a question, and voting to discuss or skip is anonymous.
>
> **Key Design Principles:**
> 1. Anonymity of authorship: After LLM rephrasing + shuffling, it should be impossible to tell whether a question came from a bundle, from Player A, or from Player B.
> 2. Anonymous voting: Neither player ever learns what the other voted on any specific question. They only see the outcome (discuss or skip).
> 3. Low-pressure "Next": Only one player needs to click "Next" to advance.
> 4. Real-time sync: Both players must see the same state at the same time.
> 5. Mobile-first: Primarily used on two phones.

---

## Problem

- Couples often avoid difficult conversations because they don't know how to start them
- When one partner suggests a topic, the other may feel put on the spot or defensive
- Questions written by one partner carry emotional weight and can feel like accusations
- Voting to skip a question publicly can hurt feelings
- Existing conversation tools don't anonymize authorship or voting
- No structured way to mix pre-written questions with personal ones without revealing sources

---

## Outcome

- Couples can have structured, meaningful conversations without social pressure
- Neither partner knows who authored which question (bundle vs custom vs which partner)
- Both partners can privately vote to discuss or skip without judgment
- The experience feels safe, collaborative, and fun
- Works seamlessly on two phones in real-time
- Simple setup: create session, share link, play
