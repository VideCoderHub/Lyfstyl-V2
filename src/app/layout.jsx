import './globals.css'
import Providers from '../components/Providers'

export const metadata = {
  title: 'Lyfstyl — Food & Dance Social Platform',
  description:
    'Lyfstyl — AI-powered food and dance communities. Join structured groups, publish recipes and moves, enter challenges, and earn creator badges.',
}

export const viewport = {
  themeColor: '#9d50bb',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
