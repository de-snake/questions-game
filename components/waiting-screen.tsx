'use client'

import { useCallback } from 'react'
import { getShareUrl } from '@/lib/utils'

interface WaitingScreenProps {
  roomCode: string
  playerCount: number
}

export function WaitingScreen({ roomCode, playerCount }: WaitingScreenProps) {
  const shareUrl = getShareUrl(roomCode)

  const handleCopyLink = useCallback(async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
    }
  }, [shareUrl])

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
