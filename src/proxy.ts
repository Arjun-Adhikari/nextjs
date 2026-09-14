import { clerkMiddleware } from '@clerk/nextjs/server'
// This function internally sees the cookies/session information and make the clerk realted state available for the rest of the application.
export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*', // Keeps internal Clerk routing functional
  ],
}
