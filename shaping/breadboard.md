# Couples Question Card Game — Breadboard

## Places

| # | Place | Description |
|---|-------|-------------|
| P1 | Home | Landing page, create/join session |
| P2 | Waiting | Waiting for partner to join |
| P3 | Bundle Selection | Both players select question bundles |
| P4 | Custom Questions | Each player adds private questions |
| P5 | Rephrasing | Loading screen during LLM rephrasing |
| P6 | Voting | 30-second vote on each question |
| P7 | Discussion | Discuss question, either can advance |
| P8 | Complete | Session stats, play again option |
| P9 | PartyKit Server | Backend: state management, WebSocket |
| P10 | LLM API | OpenRouter rephrasing endpoint |
| P11 | Deployment | Vercel + PartyKit Cloud infrastructure |

---

## UI Affordances

| # | Place | Component | Affordance | Control | Wires Out | Returns To |
|---|-------|-----------|------------|---------|-----------|------------|
| **P1: Home** |
| U1 | P1 | home | "Start New Session" button | click | → N1 | — |
| U2 | P1 | home | Room code input | type | → S1 | — |
| U3 | P1 | home | "Join Session" button | click | → N2 | — |
| U4 | P1 | home | Error message | render | — | — |
| **P2: Waiting** |
| U5 | P2 | waiting | Room code display | render | — | — |
| U6 | P2 | waiting | Share link display | render | — | — |
| U7 | P2 | waiting | "Waiting for partner..." | render | — | — |
| U8 | P2 | waiting | Partner joined indicator | render | — | — |
| **P3: Bundle Selection** |
| U9 | P3 | bundle-selection | Bundle list | render | → U10, U11 | — |
| U10 | P3 | bundle-card | Toggle checkbox | click | → N5 | — |
| U11 | P3 | bundle-card | Bundle name & description | render | — | — |
| U12 | P3 | bundle-selection | Partner's selections indicator | render | — | — |
| U13 | P3 | bundle-selection | "Confirm" button | click | → N6 | — |
| U14 | P3 | bundle-selection | "Waiting for partner..." | render | — | — |
| **P4: Custom Questions** |
| U15 | P4 | custom-questions | Question input | type | → S4 | — |
| U16 | P4 | custom-questions | "Add" button | click | → N8 | — |
| U17 | P4 | custom-questions | My questions list | render | — | — |
| U18 | P4 | custom-questions | Remove question button | click | → N9 | — |
| U19 | P4 | custom-questions | "I'm Done" button | click | → N10 | — |
| U20 | P4 | custom-questions | "Waiting for partner..." | render | — | — |
| **P5: Rephrasing** |
| U21 | P5 | rephrasing | "Preparing your questions..." | render | — | — |
| U22 | P5 | rephrasing | Animated loader | render | — | — |
| **P6: Voting** |
| U23 | P6 | voting | Question display | render | — | — |
| U24 | P6 | voting | "Discuss" button | click | → N13 | — |
| U25 | P6 | voting | "Skip" button | click | → N14 | — |
| U26 | P6 | voting | 30-second timer | render | — | — |
| U27 | P6 | voting | "Waiting for partner..." | render | — | — |
| U28 | P6 | voting | "Skipped" transition | render | — | — |
| **P7: Discussion** |
| U29 | P7 | discussion | Question display (large) | render | — | — |
| U30 | P7 | discussion | "Next" button | click | → N16 | — |
| **P8: Complete** |
| U31 | P8 | complete | "Session Complete!" | render | — | — |
| U32 | P8 | complete | Stats: discussed count | render | — | — |
| U33 | P8 | complete | Stats: skipped count | render | — | — |
| U34 | P8 | complete | Stats: duration | render | — | — |
| U35 | P8 | complete | "Play Again" button | click | → N17 | — |

---

## Code Affordances

| # | Place | Component | Affordance | Control | Wires Out | Returns To |
|---|-------|-----------|------------|---------|-----------|------------|
| **P1: Home** |
| N1 | P1 | home | `createSession()` | call | → P9 (create) | → P2 |
| N2 | P1 | home | `joinSession(code)` | call | → P9 (join) | → P2 or U4 |
| **P2: Waiting** |
| N3 | P2 | waiting | WebSocket connect | call | → P9 (connect) | — |
| N4 | P2 | waiting | `onPartnerJoined` | observe | → P3 | — |
| **P3: Bundle Selection** |
| N5 | P3 | bundle-selection | `toggleBundle(id)` | call | → P9 (toggle) | — |
| N6 | P3 | bundle-selection | `confirmBundles()` | call | → P9 (confirm) | — |
| N7 | P3 | bundle-selection | `onBothConfirmed` | observe | → P4 | — |
| **P4: Custom Questions** |
| N8 | P4 | custom-questions | `addQuestion(text)` | call | → S4 | — |
| N9 | P4 | custom-questions | `removeQuestion(id)` | call | → S4 | — |
| N10 | P4 | custom-questions | `markDone()` | call | → P9 (done) | — |
| N11 | P4 | custom-questions | `onBothDone` | observe | → P9 (rephrase) | — |
| **P5: Rephrasing** |
| N12 | P5 | rephrasing | `rephraseQuestions()` | call | → P10 | — |
| **P6: Voting** |
| N13 | P6 | voting | `vote('discuss')` | call | → P9 (vote) | — |
| N14 | P6 | voting | `vote('skip')` | call | → P9 (vote) | — |
| N15 | P6 | voting | `onVoteComplete` | observe | → P7 or U28 or N18 | — |
| N18 | P6 | voting | `advanceToNext()` | call | → P9 (next) | — |
| **P7: Discussion** |
| N16 | P7 | discussion | `nextQuestion()` | call | → P9 (next) | — |
| N17 | P7 | discussion | `onPhaseChange` | observe | → P6 or P8 | — |
| **P8: Complete** |
| N19 | P8 | complete | `playAgain()` | call | → N1 | — |
| **P9: PartyKit Server** |
| N20 | P9 | server | `onConnect` | event | → S5 (add player) | — |
| N21 | P9 | server | `onMessage` | event | → N22 | — |
| N22 | P9 | server | `handleMessage(type, payload)` | call | → N23-N30 | — |
| N23 | P9 | server | `handleToggleBundle` | call | → S6, → broadcast | — |
| N24 | P9 | server | `handleConfirmBundles` | call | → S7, → broadcast | — |
| N25 | P9 | server | `handleMarkDone` | call | → S8, → broadcast | — |
| N26 | P9 | server | `handleVote` | call | → S9, → N31 | — |
| N27 | P9 | server | `handleNext` | call | → S10, → N32 | — |
| N28 | P9 | server | `broadcastState()` | call | → all clients | — |
| N29 | P9 | server | `checkBothConfirmed` | call | → N33 | — |
| N30 | P9 | server | `checkBothDone` | call | → N12 | — |
| N31 | P9 | server | `checkVoteComplete` | call | → N34 | — |
| N32 | P9 | server | `advanceQuestion()` | call | → S10, → N35 | — |
| N33 | P9 | server | `transitionToCustom()` | call | → S5 (phase=custom), → broadcast | — |
| N34 | P9 | server | `determineVoteOutcome()` | call | → S11, → broadcast | — |
| N35 | P9 | server | `checkSessionComplete()` | call | → P8 or P6 | — |
| **P10: LLM API** |
| N36 | P10 | api | `POST /api/rephrase` | call | → OpenRouter | → N37 |
| N37 | P10 | api | `parseResponse()` | call | → S12 | — |
| N38 | P10 | api | `shuffleQuestions()` | call | → S12 | — |
| **P11: Deployment** |
| N39 | P11 | cli | `npx partykit deploy` | call | → PartyKit Cloud | → live WebSocket URL |
| N40 | P11 | cli | `vercel --prod` | call | → Vercel | → live app URL |
| N41 | P11 | config | `NEXT_PUBLIC_PARTYKIT_HOST` | config | → N3 | — |
| N42 | P11 | config | `OPENROUTER_API_KEY` | config | → N36 | — |

---

## Data Stores

| # | Place | Store | Description |
|---|-------|-------|-------------|
| **Client State** |
| S1 | P1 | `roomCode` | Input value for joining |
| S2 | P1 | `error` | Error message to display |
| S3 | P1 | `sessionId` | Current session ID |
| S4 | P4 | `myQuestions` | Array of custom questions (local, not synced) |
| **Server State (PartyKit)** |
| S5 | P9 | `session` | { phase, players[], currentQuestion, stats } |
| S6 | P9 | `selectedBundles` | Set of selected bundle IDs |
| S7 | P9 | `confirmedPlayers` | Set of player IDs who confirmed bundles |
| S8 | P9 | `donePlayers` | Set of player IDs who marked done |
| S9 | P9 | `votes` | Map<playerId, 'discuss'|'skip'> (never broadcast) |
| S10 | P9 | `currentQuestionIndex` | Index into questions array |
| S11 | P9 | `voteOutcome` | 'discuss' | 'skip' (broadcast only) |
| S12 | P9 | `questions` | Array of rephrased, shuffled questions |
| **Deployment Config** |
| S13 | P11 | `PARTYKIT_HOST` | Production WebSocket URL |
| S14 | P11 | `VERCEL_URL` | Production app URL |

---

## Wiring Diagram

```mermaid
flowchart TB
    %% ===== P1: HOME =====
    subgraph P1["P1: Home"]
        U1["U1: Start New Session"]
        U2["U2: Room code input"]
        U3["U3: Join Session"]
        U4["U4: Error message"]
        N1["N1: createSession()"]
        N2["N2: joinSession()"]
        S1["S1: roomCode"]
        S2["S2: error"]
    end

    %% ===== P2: WAITING =====
    subgraph P2["P2: Waiting"]
        U5["U5: Room code display"]
        U6["U6: Share link"]
        U7["U7: Waiting message"]
        U8["U8: Partner joined"]
        N3["N3: WebSocket connect"]
        N4["N4: onPartnerJoined"]
    end

    %% ===== P3: BUNDLE SELECTION =====
    subgraph P3["P3: Bundle Selection"]
        U9["U9: Bundle list"]
        U10["U10: Toggle checkbox"]
        U11["U11: Bundle info"]
        U12["U12: Partner selections"]
        U13["U13: Confirm button"]
        U14["U14: Waiting for partner"]
        N5["N5: toggleBundle()"]
        N6["N6: confirmBundles()"]
        N7["N7: onBothConfirmed"]
    end

    %% ===== P4: CUSTOM QUESTIONS =====
    subgraph P4["P4: Custom Questions"]
        U15["U15: Question input"]
        U16["U16: Add button"]
        U17["U17: My questions list"]
        U18["U18: Remove button"]
        U19["U19: I'm Done button"]
        U20["U20: Waiting for partner"]
        N8["N8: addQuestion()"]
        N9["N9: removeQuestion()"]
        N10["N10: markDone()"]
        N11["N11: onBothDone"]
        S4["S4: myQuestions"]
    end

    %% ===== P5: REPHRASING =====
    subgraph P5["P5: Rephrasing"]
        U21["U21: Preparing message"]
        U22["U22: Loader"]
        N12["N12: rephraseQuestions()"]
    end

    %% ===== P6: VOTING =====
    subgraph P6["P6: Voting"]
        U23["U23: Question display"]
        U24["U24: Discuss button"]
        U25["U25: Skip button"]
        U26["U26: Timer"]
        U27["U27: Waiting for partner"]
        U28["U28: Skipped transition"]
        N13["N13: vote(discuss)"]
        N14["N14: vote(skip)"]
        N15["N15: onVoteComplete"]
        N18["N18: advanceToNext()"]
    end

    %% ===== P7: DISCUSSION =====
    subgraph P7["P7: Discussion"]
        U29["U29: Question (large)"]
        U30["U30: Next button"]
        N16["N16: nextQuestion()"]
        N17["N17: onPhaseChange"]
    end

    %% ===== P8: COMPLETE =====
    subgraph P8["P8: Complete"]
        U31["U31: Complete message"]
        U32["U32: Discussed count"]
        U33["U33: Skipped count"]
        U34["U34: Duration"]
        U35["U35: Play Again"]
        N19["N19: playAgain()"]
    end

    %% ===== P9: PARTYKIT SERVER =====
    subgraph P9["P9: PartyKit Server"]
        N20["N20: onConnect"]
        N21["N21: onMessage"]
        N22["N22: handleMessage()"]
        N23["N23: handleToggleBundle"]
        N24["N24: handleConfirmBundles"]
        N25["N25: handleMarkDone"]
        N26["N26: handleVote"]
        N27["N27: handleNext"]
        N28["N28: broadcastState()"]
        N29["N29: checkBothConfirmed"]
        N30["N30: checkBothDone"]
        N31["N31: checkVoteComplete"]
        N32["N32: advanceQuestion()"]
        N33["N33: transitionToCustom"]
        N34["N34: determineVoteOutcome"]
        N35["N35: checkSessionComplete"]
        S5["S5: session"]
        S6["S6: selectedBundles"]
        S7["S7: confirmedPlayers"]
        S8["S8: donePlayers"]
        S9["S9: votes (private)"]
        S10["S10: currentQuestionIndex"]
        S11["S11: voteOutcome"]
        S12["S12: questions"]
    end

    %% ===== P10: LLM API =====
    subgraph P10["P10: LLM API"]
        N36["N36: POST /api/rephrase"]
        N37["N37: parseResponse()"]
        N38["N38: shuffleQuestions()"]
    end

    %% ===== WIRES =====
    
    %% P1 internal
    U1 --> N1
    U2 --> S1
    S1 -.-> U3
    U3 --> N2
    N2 -.->|error| S2
    S2 -.-> U4
    N1 --> P9
    N2 --> P9

    %% P1 -> P2
    N1 --> P2
    N2 --> P2

    %% P2 internal
    N3 --> P9
    N4 -.-> U8

    %% P2 -> P3
    N4 --> P3

    %% P3 internal
    U10 --> N5
    N5 --> P9
    U13 --> N6
    N6 --> P9
    N7 -.-> U12
    N7 -.-> U14

    %% P3 -> P4
    N7 --> P4

    %% P4 internal
    U15 --> S4
    U16 --> N8
    N8 --> S4
    S4 -.-> U17
    U18 --> N9
    N9 --> S4
    U19 --> N10
    N10 --> P9
    N11 -.-> U20

    %% P4 -> P5
    N11 --> P5

    %% P5 internal
    N12 --> P10

    %% P5 -> P6
    N12 --> P6

    %% P6 internal
    U24 --> N13
    U25 --> N14
    N13 --> P9
    N14 --> P9
    N15 -.-> U27
    N15 -.-> U28
    N18 --> P9

    %% P6 -> P7 or P6
    N15 --> P7
    N18 --> P6

    %% P7 internal
    U30 --> N16
    N16 --> P9
    N17 -.-> U29

    %% P7 -> P6 or P8
    N17 --> P6
    N17 --> P8

    %% P8 internal
    N19 --> N1

    %% P9 internal wiring
    N20 --> S5
    N21 --> N22
    N22 --> N23
    N22 --> N24
    N22 --> N25
    N22 --> N26
    N22 --> N27
    N23 --> S6
    N23 --> N28
    N24 --> S7
    N24 --> N29
    N29 --> N33
    N25 --> S8
    N25 --> N30
    N26 --> S9
    N26 --> N31
    N31 --> N34
    N34 --> S11
    N34 --> N28
    N27 --> N32
    N32 --> S10
    N32 --> N35
    N35 --> N28

    %% P9 -> P10
    N30 --> P10

    %% P10 internal
    N36 --> N37
    N37 --> N38
    N38 --> S12

    %% P10 -> P9
    N38 --> S12

    %% Broadcast to clients
    N28 -.->|state update| N4
    N28 -.->|state update| N7
    N28 -.->|state update| N11
    N28 -.->|state update| N15
    N28 -.->|state update| N17

    %% Styles
    classDef ui fill:#ffb6c1,stroke:#d87093,color:#000
    classDef nonui fill:#d3d3d3,stroke:#808080,color:#000
    classDef store fill:#e6e6fa,stroke:#9370db,color:#000
    classDef place fill:none,stroke:#666,stroke-width:2px

    class U1,U2,U3,U4,U5,U6,U7,U8,U9,U10,U11,U12,U13,U14,U15,U16,U17,U18,U19,U20,U21,U22,U23,U24,U25,U26,U27,U28,U29,U30,U31,U32,U33,U34,U35 ui
    class N1,N2,N3,N4,N5,N6,N7,N8,N9,N10,N11,N12,N13,N14,N15,N16,N17,N18,N19,N20,N21,N22,N23,N24,N25,N26,N27,N28,N29,N30,N31,N32,N33,N34,N35,N36,N37,N38 nonui
    class S1,S2,S3,S4,S5,S6,S7,S8,S9,S10,S11,S12 store
```

---

## Key Design Decisions

### 1. Votes are NEVER Broadcast
- S9 (`votes` map) lives only on server
- N34 (`determineVoteOutcome`) computes result, writes to S11
- Only S11 (`voteOutcome`: 'discuss'|'skip') is broadcast
- **Anonymity guaranteed by architecture**

### 2. Custom Questions are Local Until Done
- S4 (`myQuestions`) is client-side only
- Only sent to server when N10 (`markDone`) is called
- Partner never sees raw questions — only rephrased versions

### 3. Single Source of Truth: PartyKit Server
- All game state lives in S5-S12 on server
- Clients are thin renderers that subscribe to state updates
- N28 (`broadcastState`) pushes changes to all clients

### 4. Timer Management
- Server manages timer (not client)
- On voting phase start, server starts 30s countdown
- On timeout, missing votes default to 'skip'
- Prevents timer drift between clients

### 5. LLM Batching
- All questions (bundles + custom from both players) sent in single batch
- Ensures consistent style across all questions
- Single rephrasing call = lower cost + consistent tone

### 6. Deployment Strategy
- Deploy after V1 to verify infrastructure works
- PartyKit Cloud handles WebSocket persistence and scaling
- Vercel handles Next.js SSR and static assets
- Environment variables injected at build time
- Separate deploy commands: `npx partykit deploy` then `vercel --prod`
