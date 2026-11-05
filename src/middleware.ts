import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session'

type Route = [method: string, path: RegExp]

// Each of these authenticates in its handler (signature, bearer key or portal token) or is a public form.
const PUBLIC_API: Route[] = [
  ['POST', /^\/api\/auth\/(login|logout)$/],
  ['*', /^\/api\/(webhooks|voice)\//],
  ['POST', /^\/api\/portal\/billing-portal$/],
  ['POST', /^\/api\/work-logs$/],
  ['POST', /^\/api\/resources(\/analyze)?$/],
]

// Client portal calls. The handler compares x-portal-token to the owning client's token.
const PORTAL_API: Route[] = [
  ['GET', /^\/api\/invoices\/[^/]+$/],
  ['POST', /^\/api\/invoices\/[^/]+\/checkout$/],
  ['GET', /^\/api\/subscriptions\/[^/]+\/checkout-url$/],
]

function matches(routes: Route[], method: string, pathname: string) {
  return routes.some(([m, path]) => (m === '*' || m === method) && path.test(pathname))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname === '/api' || pathname.startsWith('/api/')

  if (isApi && matches(PUBLIC_API, request.method, pathname)) return NextResponse.next()
  if (isApi && request.headers.get('x-portal-token') && matches(PORTAL_API, request.method, pathname)) {
    return NextResponse.next()
  }

  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next()

  if (isApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.redirect(new URL('/auth/login', request.url))
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
