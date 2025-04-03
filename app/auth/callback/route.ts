import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code');

  const prompt = searchParams.get('prompt') ?? null
  const genres = searchParams.get('genres') ?? null

  const params = new URLSearchParams()
  if (prompt) params.append('prompt', prompt)
  if (genres) params.append('genres', genres)
  const paramsString = params.toString();

  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'

      const { data: { user } } = await supabase.auth.getUser()
      const { email } = user?.user_metadata ?? {}
      const existingUser = await prisma.user.findUnique({ where: { email } })

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: email ?? '',
            id: user?.id ?? '',
            createdAt: new Date(),
            updatedAt: new Date()
          },
        })
      }

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}?${paramsString}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}?${paramsString}`)
      } else {
        return NextResponse.redirect(`${origin}${next}?${paramsString}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}