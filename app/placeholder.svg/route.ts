import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function toInt(val: string | null, fallback: number): number {
  const n = val ? parseInt(val, 10) : NaN
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const width = toInt(searchParams.get('width'), 400)
  const height = toInt(searchParams.get('height'), 300)
  const query = (searchParams.get('query') || 'placeholder').slice(0, 60)

  const bg = '#f3f4f6'
  const fg = '#9ca3af'

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#e5e7eb" stop-opacity="0.6"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${bg}"/>
  <rect x="0" y="0" width="100%" height="100%" fill="url(#g)"/>
  <g fill="${fg}" font-family="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"" text-anchor="middle">
    <text x="50%" y="50%" dominant-baseline="middle" font-size="${Math.max(12, Math.min(width, height) / 10)}">${query}</text>
    <text x="50%" y="calc(50% + 22)" dominant-baseline="hanging" font-size="12">${width}×${height}</text>
  </g>
</svg>`

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
