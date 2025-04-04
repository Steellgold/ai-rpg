import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code');

  const prompt = searchParams.get('prompt') ?? null
  const genres = searchParams.get('genres') ?? null

  const params = new URLSearchParams()
  if (prompt) params.append('prompt', prompt)
  if (genres) params.append('genres', genres)
  const paramsString = params.toString();

  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      console.log("No errors, and user exist")

      try {
        const { data: createdUser, error } = await supabase.rpc('create_user', { 
          id: data.user.id, 
          email: data.user.email ?? ""
        });

        console.log('User created:', createdUser, error)
      } catch (createUserError) {
        console.error('Error creating user:', createUserError);
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}?${paramsString}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}?${paramsString}`)
      } else {
        return NextResponse.redirect(`${origin}${next}?${paramsString}`)
      }
    } else {
      console.error('Error exchanging code for session:', error);
      console.error('Error exchanging code for session: Code:', code);
      console.error('Error exchanging code for session: Data:', data);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}