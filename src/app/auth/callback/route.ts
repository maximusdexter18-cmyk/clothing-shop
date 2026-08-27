import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // SUCCESS! Redirect to homepage.
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      // Print the error so we can see it in the terminal
      console.error("❌ Supabase Auth Error:", error.message, error.status);
    }
  }

  // If it fails, quietly send them back to the homepage so they never see a 404
  return NextResponse.redirect(`${origin}/`)
}