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

        {error ? (
          <p className="text-red-400 text-center text-sm" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
