'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useGameState } from '@/hooks/use-game-state'
import { HomeScreen } from '@/components/home-screen'
import { WaitingScreen } from '@/components/waiting-screen'

export default function Home() {
  const searchParams = useSearchParams()
  const { state, createRoom, joinRoom, error } = useGameState()

  useEffect(() => {
    const roomFromUrl = searchParams.get('room')
    if (roomFromUrl && roomFromUrl.length === 6 && !state?.roomCode) {
      joinRoom(roomFromUrl)
    }
  }, [searchParams, state?.roomCode, joinRoom])

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
