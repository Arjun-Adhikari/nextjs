import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtected = createRouteMatcher(['/']) 

export default clerkMiddleware(async (auth, request) => {
  // 2. Intercept requests going to protected routes
  if (isProtected(request)) {
    const session = await auth()

    // 3. Optimistic check: If no userId exists in the token, redirect to login
    if (!session.userId) {
      const loginUrl = new URL('/sign-in', request.nextUrl.origin)
      loginUrl.searchParams.set('redirect_url', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*', // Keeps internal Clerk routing functional
  ],
}
