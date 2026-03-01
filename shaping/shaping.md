# Couples Question Card Game — Shaping

## Constraints (Prototype Scope)

- **Just for 2 people** — no scaling, no multi-tenancy concerns
- **Ephemeral** — sessions don't need to persist long-term
- **MVP mindset** — ship fast, iterate later
- **Deploy after V1** — verify infrastructure works before building more
- **Usable domain** — not localhost, real URL to share

---

## Visual Design Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| **V1** | Headspace-inspired pastel chalk aesthetic — cozy, intimate, playful | Must-have |
| **V2** | Color palette: warm cream background, muted blush pink, soft lavender, gentle sage green, warm peach | Must-have |
| **V3** | Rounded friendly sans-serif font (Nunito, Quicksand, Varela Round) | Must-have |
| **V4** | Large rounded buttons (16-20px radius), soft shadows, generous padding | Must-have |
| **V5** | Gentle transitions/fades — no abrupt changes | Must-have |
| **V6** | Questions displayed large and centered | Must-have |
| **V7** | No gamification (scores, badges, streaks), no dark theme, no sharp corners | Must-have |

---

## Requirements (R)

| ID | Requirement | Status |
|----|-------------|--------|
| **R0** | Two players can join a shared session via link or room code | Core goal |
| **R1** | Players select question bundles together in real-time | Core goal |
| **R2** | Players can add custom questions privately (not visible to partner) | Core goal |
| **R3** | All questions are rephrased by LLM (OpenRouter) to normalize style and hide authorship | Core goal |
| **R4** | After rephrasing, it's impossible to distinguish bundle vs custom vs which partner wrote a question | Must-have |
| **R5** | Each question has a 30-second voting phase where both players vote Discuss/Skip privately | Core goal |
| **R6** | Voting results are anonymous — players never learn how their partner voted | Must-have |
| **R7** | Question proceeds to discussion if at least one player votes Discuss | Core goal |
| **R8** | Question is skipped silently if both players vote Skip | Core goal |
| **R9** | During discussion, either player can click Next to advance (low-pressure exit) | Core goal |
| **R10** | Both players see the same state simultaneously (real-time sync) | Must-have |
| **R11** | Mobile-first design: works well on phones, large tap targets | Must-have |
| **R12** | No authentication required — sessions are ephemeral | Must-have |
| **R13** | Session shows completion stats: discussed, skipped, duration | Nice-to-have |
| **R14** | Timer expires count as Skip vote | Must-have |
| **R15** | Loading state shown during LLM rephrasing | Must-have |
| **R16** | Both players must confirm bundle selection before proceeding | Must-have |
| **R17** | Both players must mark "I'm done" on custom questions before proceeding | Must-have |
| **R18** | LLM via OpenRouter API (not Claude directly) | Must-have |

---

## Shape A: Vercel + WebSocket Service

Next.js frontend on Vercel, separate WebSocket service for real-time sync.

| Part | Mechanism |
|------|-----------|
| **A1** | **Frontend on Vercel** |
| A1.1 | Next.js App Router, React components |
| A1.2 | Tailwind CSS with custom pastel theme |
| A1.3 | WebSocket client hook for real-time updates |
| **A2** | **WebSocket service** (separate deployment) |
| A2.1 | Node.js + ws or Bun server |
| A2.2 | Deploy on Railway/Fly.io (supports persistent connections) |
| A2.3 | In-memory session state (acceptable for prototype) |
| **A3** | **API routes on Vercel** |
| A3.1 | POST /api/session — create session |
| A3.2 | POST /api/rephrase — call OpenRouter, return rephrased questions |
| **A4** | **Session flow** |
| A4.1 | Create → share link → both connect via WebSocket |
| A4.2 | All game state managed through WebSocket messages |
| A4.3 | LLM rephrasing via API route (serverless) |

---

## Shape B: Single Vercel Deployment with Polling

Everything on Vercel, no separate WebSocket service. Use SWR polling.

| Part | Mechanism |
|------|-----------|
| **B1** | **Next.js on Vercel** |
| B1.1 | App Router, API routes, React components |
| B1.2 | SWR for polling session state every 500ms |
| **B2** | **Session state** |
| B2.1 | Vercel KV (Redis) or in-memory with upstash |
| B2.2 | All state in store, API routes read/write |
| **B3** | **Real-time-ish sync** |
| B3.1 | Clients poll for state changes |
| B3.2 | 500ms latency acceptable for prototype |
| **B4** | **LLM via API route** |
| B4.1 | Serverless function calls OpenRouter |
| B4.2 | Returns rephrased questions |

---

## Shape C: PartyKit (Cloudflare)

Use PartyKit for WebSocket, Next.js for frontend.

| Part | Mechanism |
|------|-----------|
| **C1** | **PartyKit server** |
| C1.1 | Handles WebSocket connections |
| C1.2 | Built-in state management per room |
| C1.3 | Deploys to Cloudflare edge |
| **C2** | **Next.js frontend on Vercel** |
| C2.1 | Connects to PartyKit room via WebSocket |
| C2.2 | All game logic in PartyKit server |
| **C3** | **LLM** |
| C3.1 | PartyKit server calls OpenRouter directly |

---

## Fit Check

| Req | Requirement | Status | A | B | C |
|-----|-------------|--------|---|---|---|
| R0 | Two players join via link/code | Core goal | ✅ | ✅ | ✅ |
| R1 | Select bundles together in real-time | Core goal | ✅ | ⚠️ | ✅ |
| R2 | Add custom questions privately | Core goal | ✅ | ✅ | ✅ |
| R3 | LLM rephrases (OpenRouter) | Core goal | ✅ | ✅ | ✅ |
| R4 | Cannot distinguish question source | Must-have | ✅ | ✅ | ✅ |
| R5 | 30-second voting phase | Core goal | ✅ | ⚠️ | ✅ |
| R6 | Voting results are anonymous | Must-have | ✅ | ✅ | ✅ |
| R7 | Discuss if ≥1 votes Discuss | Core goal | ✅ | ✅ | ✅ |
| R8 | Skip if both vote Skip | Core goal | ✅ | ✅ | ✅ |
| R9 | Either player can click Next | Core goal | ✅ | ✅ | ✅ |
| R10 | Real-time sync | Must-have | ✅ | ❌ | ✅ |
| R11 | Mobile-first | Must-have | ✅ | ✅ | ✅ |
| R12 | No auth, ephemeral sessions | Must-have | ✅ | ✅ | ✅ |
| R13 | Completion stats | Nice-to-have | ✅ | ✅ | ✅ |
| R14 | Timer expiry = Skip | Must-have | ✅ | ✅ | ✅ |
| R15 | Loading state during rephrasing | Must-have | ✅ | ✅ | ✅ |
| R16 | Both confirm bundles | Must-have | ✅ | ✅ | ✅ |
| R17 | Both done with custom questions | Must-have | ✅ | ✅ | ✅ |
| R18 | LLM via OpenRouter | Must-have | ✅ | ✅ | ✅ |

**Notes:**
- **B fails R10**: 500ms polling isn't real-time — noticeable lag on voting timer sync
- **B ⚠️ R1, R5**: Polling introduces lag in bundle selection and voting
- **A** requires separate WebSocket deployment (Railway/Fly)
- **C** uses PartyKit — simpler than A, real-time, edge-deployed

---

## Shape Comparison for Prototype

| Factor | A: Vercel+WS | B: Polling | C: PartyKit |
|--------|--------------|------------|-------------|
| Real-time | ✅ | ❌ | ✅ |
| Deployment complexity | 2 services | 1 service | 2 services |
| Latency | Low | 500ms | Low |
| Cost | Free tier | Free | Free tier |
| Dev speed | Medium | Fast | Fast |

---

## Selected Shape: C (PartyKit + Next.js)

**Rationale:**
- Real-time sync (unlike polling)
- PartyKit handles rooms/state automatically
- Edge deployment (fast globally)
- Single WebSocket connection
- Simpler than managing own WS server

### Detail C: Component Breakdown

| Part | Mechanism | Flag |
|------|-----------|:----:|
| **C1** | **PartyKit server** |
| C1.1 | room.ts — handles WebSocket connections, manages game state | |
| C1.2 | onConnect: add player to room, broadcast updated state | |
| C1.3 | onMessage: handle VOTE, NEXT, CONFIRM_BUNDLES, ADD_QUESTIONS, DONE | |
| C1.4 | State stored in room.storage (persisted) | |
| **C2** | **Game state shape** |
| C2.1 | phase: 'waiting' \| 'bundles' \| 'custom' \| 'rephrasing' \| 'voting' \| 'discussion' \| 'complete' | |
| C2.2 | players: Map<id, { confirmed, done, questions[] }> | |
| C2.3 | selectedBundles: string[] | |
| C2.4 | currentQuestionIndex: number | |
| C2.5 | votes: Map<playerId, 'discuss' \| 'skip'> (never broadcast) | |
| C2.6 | questions: string[] (rephrased, shuffled) | |
| C2.7 | stats: { discussed, skipped, startedAt } | |
| **C3** | **Next.js frontend** |
| C3.1 | usePartySocket hook for WebSocket connection | |
| C3.2 | Phase-based rendering (single page, state-driven) | |
| C3.3 | Tailwind CSS with pastel theme config | |
| C3.4 | Google Fonts: Nunito or Quicksand | |
| **C4** | **LLM via OpenRouter** |
| C4.1 | API route /api/rephrase calls OpenRouter | |
| C4.2 | Model: claude-3-haiku (fast, cheap) or gpt-4o-mini | |
| C4.3 | System prompt for consistent warm tone | |
| C4.4 | PartyKit calls this route, then broadcasts rephrased questions | |
| **C5** | **Visual design** |
| C5.1 | Tailwind config: pastel colors (cream, blush, lavender, sage, peach) | |
| C5.2 | Rounded corners everywhere (rounded-2xl) | |
| C5.3 | Soft shadows (shadow-sm) | |
| C5.4 | Large tap targets (min-h-12 for buttons) | |
| C5.5 | Gentle transitions (transition-all duration-300) | |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS |
| Real-time | PartyKit (Cloudflare) |
| LLM | OpenRouter API (claude-3-haiku or gpt-4o-mini) |
| Fonts | Nunito (Google Fonts) |
| Deployment | Vercel (frontend) + PartyKit Cloud (real-time) |

---

## Open Questions

1. **Reconnection handling?** PartyKit persists state — refresh should resume
2. **Bundle storage?** Static JSON in /data folder (simplest)
3. **Timer implementation?** Server-side in PartyKit or client-side synced?

---

## Next Steps

1. ✅ Shape selected (C)
2. Breadboard the selected shape
3. Slice into implementation increments
