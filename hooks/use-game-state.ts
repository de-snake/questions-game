'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

type Phase = 'waiting' | 'bundles' | 'custom' | 'rephrasing' | 'voting' | 'discussion' | 'complete'

interface GameState {
  phase: Phase
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
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!roomCode) return

    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999'
    const ws = new WebSocket(`ws://${host}/party/${roomCode}`)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'STATE_UPDATE') {
        setState(data.state)
      }
      if (data.type === 'ERROR') {
        setError(data.message)
      }
    }

    ws.onerror = () => {
      setError('Connection failed')
    }

    return () => {
      ws.close()
    }
  }, [roomCode])

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
