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

  onConnect(conn: Party.Connection) {
    const player: Player = {
      id: conn.id,
      joinedAt: Date.now(),
    }

    this.state.players.push(player)
    this.broadcastState()

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

GameRoom satisfies Party.Worker
