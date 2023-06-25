import {createMiddlewareClient} from '@supabase/auth-helpers-nextjs'
import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const {data: {session}} = await supabase.auth.getSession()

    // if user is not signed in and the current path is not / redirect the user to /
    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    return res
}