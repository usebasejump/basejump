import { withMiddlewareAuth } from "@supabase/auth-helpers-nextjs";
import { LOGIN_PATH } from "@/types/auth";

export const middleware = withMiddlewareAuth({ redirectTo: LOGIN_PATH });

export const config = {
  matcher: ["/dashboard/:path*"],
};
