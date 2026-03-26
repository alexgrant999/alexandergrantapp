import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('dashboard_session')
  const isAuthed = session?.value === process.env.DASHBOARD_PASSWORD

  if (!isAuthed && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
