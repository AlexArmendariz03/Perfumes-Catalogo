import { NextRequest, NextResponse } from 'next/server'

// Proxy de imágenes — oculta el origen real de la foto
// El token es la URL original codificada en base64url
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const url = Buffer.from(params.token, 'base64url').toString('utf-8')

    // Solo permitimos dominios conocidos
    const allowed = [
      'cdn.shopify.com',
      'fimgs.net',
      'www.cleopatraperfumes.com',
      'images.unsplash.com',
    ]
    const host = new URL(url).hostname
    if (!allowed.includes(host)) {
      return new NextResponse('Not allowed', { status: 403 })
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 86400 }, // cache 24h
    })

    if (!res.ok) return new NextResponse('Image not found', { status: 404 })

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const body = await res.arrayBuffer()

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse('Error', { status: 500 })
  }
}
