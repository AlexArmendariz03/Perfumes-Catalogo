import { NextRequest, NextResponse } from 'next/server'

// Proxy para TinyURL — evita restricciones CORS del browser
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ short: '' }, { status: 400 })

  try {
    const res = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (res.ok) {
      const short = (await res.text()).trim()
      if (short.startsWith('http')) {
        return NextResponse.json({ short })
      }
    }
  } catch {}

  // Fallback: devuelve la URL original
  return NextResponse.json({ short: url })
}
