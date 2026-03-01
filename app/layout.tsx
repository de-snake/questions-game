import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
})

export const metadata = {
  title: 'Вопросы для двоих',
  description: 'Значимые разговоры вместе',
}

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
