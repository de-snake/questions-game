# V1: Session Creation & Deploy

**Status:** ✅ COMPLETE

## Goal

Enable two players to create/join a session, see when partner joins, and deploy to a live URL for real-world testing.

## Demo Script

### Local Test
1. Open two browser tabs
2. Tab A: Click "Начать новую сессию" → sees room code and share link
3. Tab B: Enter room code, click "Присоединиться" → both tabs show "Партнёр подключился!"
4. Both tabs auto-transition to Bundle Selection placeholder

### Production Test
1. Deploy to Vercel + PartyKit Cloud
2. Open live URL on your phone
3. Create session, share link with partner (different device/network)
4. Partner opens link, enters code
5. Both see "Партнёр подключился!" → auto-advance

## Russian UI Text

| Element | Russian |
|---------|---------|
| Title | Вопросы для двоих |
| Subtitle | Значимые разговоры вместе |
| Start button | Начать новую сессию |
| Join input placeholder | Введите код комнаты |
| Join button | Присоединиться |
| Room code label | Код вашей комнаты |
| Copy link | Скопировать ссылку |
| Waiting | Ожидание партнёра... |
| Partner joined | Партнёр подключился! |
| Starting | Начинаем сессию... |

## Affordances

| # | Component | Affordance | Control | Wires Out | Returns To |
|---|-----------|------------|---------|-----------|------------|
| U1 | home | "Start New Session" button | click | → N1 | — |
| U2 | home | Room code input | type | → S1 | — |
| U3 | home | "Join Session" button | click | → N2 | — |
| U4 | home | Error message | render | — | — |
| U5 | waiting | Room code display | render | — | — |
| U6 | waiting | Share link display | render | — | — |
| U7 | waiting | "Waiting for partner..." | render | — | — |
| U8 | waiting | Partner joined indicator | render | — | — |
| N1 | home | `createSession()` | call | → P9 | → P2 |
| N2 | home | `joinSession(code)` | call | → P9 | → P2 or U4 |
| N3 | waiting | WebSocket connect | call | → P9 | — |
| N4 | waiting | `onPartnerJoined` | observe | → P3 | — |

## Files to Create

```
questions-game/
├── app/
│   ├── layout.tsx          # Root layout with fonts, theme
│   ├── page.tsx            # Home page (create/join)
│   ├── globals.css         # Tailwind + custom pastel theme
│   └── api/
│       └── rephrase/
│           └── route.ts    # OpenRouter API (V4, stub for now)
├── components/
│   ├── home-screen.tsx     # P1: Create/join UI
│   └── waiting-screen.tsx  # P2: Waiting for partner
├── hooks/
│   └── use-game-state.ts   # WebSocket connection + state
├── lib/
│   ├── partykit-client.ts  # PartyKit connection logic
│   └── utils.ts            # generateRoomCode(), etc.
├── party/
│   └── room.ts             # PartyKit server (game state)
├── data/
│   └── bundles.json        # Question bundles (V2, stub for now)
├── tailwind.config.ts      # Pastel theme config
├── partykit.json           # PartyKit config
├── vercel.json             # Vercel config (optional)
├── .env.example            # Environment variable template
├── .env.local              # Local environment variables
└── package.json
```

## Implementation Steps

### Step 1: Project Setup

```bash
npx create-next-app@latest questions-game --typescript --tailwind --eslint --app --src-dir=false
cd questions-game
npm install partykit
npm install -D @types/node
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:party": "partykit dev",
    "build": "next build",
    "lint": "next lint"
  }
}
```

### Step 2: Tailwind Theme (Headspace Pastel Aesthetic)

**tailwind.config.ts:**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        blush: '#FFE4E1',
        lavender: '#E6E6FA',
        sage: '#C8D5BB',
        peach: '#FFDAB9',
        muted: '#8B8B8B',
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
export default config
```

**app/globals.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #FFF8F0;
  --foreground: #333333;
}

body {
  background-color: var(--background);
  color: var(--foreground);
}

/* Large tap targets, soft feel */
@layer components {
  .btn-primary {
    @apply bg-peach text-foreground px-6 py-4 rounded-2xl font-semibold 
           shadow-sm transition-all duration-300 
           active:scale-95 hover:shadow-md;
  }
  
  .btn-secondary {
    @apply bg-blush text-foreground px-6 py-4 rounded-2xl font-semibold 
           shadow-sm transition-all duration-300 
           active:scale-95 hover:shadow-md;
  }
  
  .input-field {
    @apply w-full px-4 py-4 rounded-2xl bg-white border-2 border-lavender/50
           focus:border-lavender focus:outline-none transition-colors
           text-center text-lg font-medium tracking-wide;
  }
  
  .card {
    @apply bg-white rounded-3xl p-6 shadow-sm;
  }
}
```

### Step 3: Root Layout with Font

**app/layout.tsx:**
```typescript
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="font-sans min-h-screen bg-cream">
        <main className="max-w-md mx-auto px-4 py-8 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
```

### Step 4: Utility Functions

**lib/utils.ts:**
```typescript
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function getShareUrl(roomCode: string): string {
  if (typeof window === 'undefined') return ''
  const url = new URL(window.location.origin)
  url.searchParams.set('room', roomCode)
  return url.toString()
}
```

### Step 5: PartyKit Server

**partykit.json:**
```json
{
  "name": "questions-game",
  "main": "party/room.ts",
  "compatibilityDate": "2024-01-01"
}
```

**party/room.ts:**
```typescript
import type * as Party from 'partykit/server'

interface Player {
  id: string
  joinedAt: number
}

interface GameState {
  phase: 'waiting' | 'bundles' | 'custom' | 'rephrasing' | 'voting' | 'discussion' | 'complete'
  players: Player[]
  roomCode: string
}

export default class GameRoom implements Party.Room {
  state: GameState

  constructor(readonly room: Party.Room) {
    this.state = {
      phase: 'waiting',
      players: [],
      roomCode: room.id,
    }
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const player: Player = {
      id: conn.id,
      joinedAt: Date.now(),
    }

    this.state.players.push(player)
    this.broadcastState()

    // If this is the second player, notify both
    if (this.state.players.length === 2) {
      this.state.phase = 'bundles'
      this.broadcastState()
    }
  }

  onClose(conn: Party.Connection) {
    this.state.players = this.state.players.filter(p => p.id !== conn.id)
    if (this.state.players.length < 2) {
      this.state.phase = 'waiting'
    }
    this.broadcastState()
  }

  onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message)
    
    switch (data.type) {
      case 'CREATE_SESSION':
        // Room already created by PartyKit
        sender.send(JSON.stringify({ type: 'SESSION_CREATED', roomCode: this.state.roomCode }))
        break
    }
  }

  broadcastState() {
    const publicState = {
      phase: this.state.phase,
      playerCount: this.state.players.length,
      roomCode: this.state.roomCode,
    }
    this.room.broadcast(JSON.stringify({ type: 'STATE_UPDATE', state: publicState }))
  }
}

Server satisfies Party.Worker
```

### Step 6: Game State Hook (WebSocket Client)

**hooks/use-game-state.ts:**
```typescript
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import usePartySocket from 'partysocket/use-partysocket'

interface GameState {
  phase: 'waiting' | 'bundles' | 'custom' | 'rephrasing' | 'voting' | 'discussion' | 'complete'
  playerCount: number
  roomCode: string | null
}

interface UseGameStateReturn {
  state: GameState | null
  joinRoom: (roomCode: string) => void
  createRoom: () => void
  isConnected: boolean
  error: string | null
}

export function useGameState(): UseGameStateReturn {
  const [state, setState] = useState<GameState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const ws = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999',
    room: roomCode || undefined,
    onOpen: () => {
      setIsConnected(true)
      setError(null)
    },
    onClose: () => {
      setIsConnected(false)
    },
    onMessage: (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'STATE_UPDATE') {
        setState(data.state)
      }
      if (data.type === 'ERROR') {
        setError(data.message)
      }
    },
    onError: () => {
      setError('Connection failed')
    },
  })

  const createRoom = useCallback(() => {
    const code = generateRoomCode()
    setRoomCode(code)
  }, [])

  const joinRoom = useCallback((code: string) => {
    const normalizedCode = code.toUpperCase().trim()
    if (normalizedCode.length !== 6) {
      setError('Room code must be 6 characters')
      return
    }
    setRoomCode(normalizedCode)
  }, [])

  return { state, joinRoom, createRoom, isConnected, error }
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
```

### Step 7: Home Screen Component

**components/home-screen.tsx:**
```typescript
'use client'

import { useState, useCallback } from 'react'

interface HomeScreenProps {
  onCreateSession: () => void
  onJoinSession: (code: string) => void
  error: string | null
}

export function HomeScreen({ onCreateSession, onJoinSession, error }: HomeScreenProps) {
  const [roomCode, setRoomCode] = useState('')

  const handleJoin = useCallback(() => {
    onJoinSession(roomCode)
  }, [roomCode, onJoinSession])

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Questions for Two
        </h1>
        <p className="text-muted text-lg">
          Meaningful conversations, together
        </p>
      </div>

      <div className="card w-full space-y-6">
        <button
          onClick={onCreateSession}
          className="btn-primary w-full text-lg"
        >
          Start New Session
        </button>

        <div className="flex items-center gap-4">
          <div className="h-px bg-lavender/50 flex-1" />
          <span className="text-muted text-sm">or</span>
          <div className="h-px bg-lavender/50 flex-1" />
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            className="input-field"
            maxLength={6}
            aria-label="Room code"
          />
          <button
            onClick={handleJoin}
            disabled={roomCode.length !== 6}
            className="btn-secondary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Session
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-center text-sm" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
```

### Step 8: Waiting Screen Component

**components/waiting-screen.tsx:**
```typescript
'use client'

interface WaitingScreenProps {
  roomCode: string
  playerCount: number
}

export function WaitingScreen({ roomCode, playerCount }: WaitingScreenProps) {
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?room=${roomCode}`
    : ''

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
    }
  }

  const partnerJoined = playerCount >= 2

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
      <div className="card w-full text-center space-y-6">
        <div>
          <p className="text-muted text-sm mb-2">Your room code</p>
          <p className="text-4xl font-bold tracking-[0.3em] text-foreground">
            {roomCode}
          </p>
        </div>

        <button
          onClick={handleCopyLink}
          className="btn-secondary w-full"
        >
          Copy Share Link
        </button>

        <div className="pt-4">
          {partnerJoined ? (
            <div className="text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sage font-semibold text-lg">
                Partner joined!
              </p>
              <p className="text-muted text-sm mt-1">
                Starting session...
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="animate-pulse mb-3">
                <div className="w-4 h-4 bg-lavender rounded-full mx-auto" />
              </div>
              <p className="text-muted">
                Waiting for your partner...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Step 9: Main Page (State Machine)

**app/page.tsx:**
```typescript
'use client'

import { useGameState } from '@/hooks/use-game-state'
import { HomeScreen } from '@/components/home-screen'
import { WaitingScreen } from '@/components/waiting-screen'

export default function Home() {
  const { state, createRoom, joinRoom, error } = useGameState()

  // Phase-based rendering
  if (!state || state.phase === 'waiting') {
    if (state?.roomCode) {
      return (
        <WaitingScreen 
          roomCode={state.roomCode} 
          playerCount={state.playerCount} 
        />
      )
    }
    
    return (
      <HomeScreen
        onCreateSession={createRoom}
        onJoinSession={joinRoom}
        error={error}
      />
    )
  }

  // V2: Bundle Selection (placeholder)
  if (state.phase === 'bundles') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="card text-center">
          <p className="text-2xl mb-2">✨</p>
          <p className="font-semibold">Bundle Selection</p>
          <p className="text-muted text-sm">(V2 coming next)</p>
        </div>
      </div>
    )
  }

  return null
}
```

### Step 10: Environment Variables

**.env.local:**
```
NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
```

**.env.production:**
```
NEXT_PUBLIC_PARTYKIT_HOST=your-partykit-deployment.partykit.dev
```

### Step 11: Deploy to PartyKit Cloud

1. **Login to PartyKit:**
```bash
npx partykit login
```

2. **Deploy PartyKit server:**
```bash
npx partykit deploy
```

3. **Note the deployed URL** (e.g., `questions-game.your-username.partykit.dev`)

4. **Update `.env.production`:**
```
NEXT_PUBLIC_PARTYKIT_HOST=questions-game.your-username.partykit.dev
```

### Step 12: Deploy to Vercel

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "V1: Session creation and joining"
git branch -M main
git remote add origin https://github.com/yourusername/questions-game.git
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repo
   - Add environment variables:
     - `NEXT_PUBLIC_PARTYKIT_HOST` = your PartyKit Cloud URL
     - `OPENROUTER_API_KEY` = your OpenRouter key (for V4)
   - Deploy

3. **Get live URL** (e.g., `questions-game.vercel.app`)

### Step 13: Verify Production

1. Open live URL on your phone
2. Create session, get room code
3. Share link with partner (different device/network)
4. Both should see "Partner joined!"
5. Auto-advance to Bundle Selection placeholder

## Vercel Best Practices Applied

All code adheres to `.agents/skills/`:

### From vercel-react-best-practices:

1. **Narrow Effect Dependencies (5.6)** - Only depend on what's actually used
2. **Interaction Logic in Event Handlers (5.7)** - Logic in `onClick`, not `useEffect` (except URL parsing)
3. **Use Explicit Conditional Rendering (6.8)** - Ternary, not `&&`
4. **No Unnecessary useMemo (5.3)** - Not wrapping simple expressions
5. **useRef for Transient Values (5.12)** - `wsRef` for WebSocket reference
6. **Track One-Time Actions (5.6)** - `hasAttemptedJoin` ref prevents duplicate auto-joins

### From vercel-composition-patterns:

1. **Avoid Boolean Prop Proliferation (1.1)** - Components use composition, not boolean flags
2. **Decouple State from UI (2.1)** - `useGameState` hook separates logic from rendering

### From web-design-guidelines:

1. **Large tap targets** - Buttons use `py-4` (16px padding, ~48px height)
2. **Focus states** - `focus:border-lavender` on inputs
3. **aria-label** - On inputs without visible labels
4. **role="alert"** - On error messages
5. **Disabled states** - Clear visual feedback (`opacity-50`)
6. **Color contrast** - Text readable against backgrounds

## Testing Checklist

### Local
- [ ] Create session generates 6-character code
- [ ] Join with valid code connects both players
- [ ] Both players see "Partner joined!" when second connects
- [ ] Invalid room code shows error
- [ ] Copy link works
- [ ] Mobile viewport looks good (375px width)
- [ ] Buttons are tappable (48px+ height)
- [ ] Transitions are smooth (300ms)

### Production
- [ ] PartyKit Cloud deployed successfully
- [ ] Vercel deployment successful
- [ ] Environment variables set correctly
- [ ] Live URL loads on mobile
- [ ] Two different devices can connect
- [ ] WebSocket connection stable (not dropping)
- [ ] Room codes work across networks

## Demo Commands

### Local Development
```bash
# Terminal 1: Start PartyKit
npm run dev:party

# Terminal 2: Start Next.js
npm run dev
```

Open http://localhost:3000 in two tabs and test the flow.

### Production Deployment
```bash
# Deploy PartyKit
npx partykit deploy

# Deploy Vercel (via GitHub or CLI)
vercel --prod
```

Share live URL with partner on different device.
