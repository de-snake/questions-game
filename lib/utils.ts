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

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
