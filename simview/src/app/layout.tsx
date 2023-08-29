import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import NavBar from '~/components/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SimSet',
}

const root_css = [
  'bg-woodsmoke-950',
  'text-woodsmoke-100',
  'flex',
  'flex-col',
  'w-full',
  'min-h-screen',
  'max-h-screen',
  'h-screen'
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className={root_css.join(' ')}>
          <NavBar/>
          <div className="flex-1 ml-4 mr-4">{children}</div>
        </div>
      </body>
    </html>
  )
}
