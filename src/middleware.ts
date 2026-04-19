import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware untuk proteksi dashboard dan area admin.
 * Memverifikasi sesi dan role user langsung dari data Supabase (Server-Side Authority).
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Cek Area Admin & Juri (Prioritas Tertinggi)
  if (path.startsWith("/hq") || path.startsWith("/juri")) {
    const adminEmails = ["admin@ncc.id", "admin1@ncc.id", "admin2@ncc.id"];
    const juryEmails = ["juri1@ncc.id", "juri2@ncc.id", "juri3@ncc.id"];
    
    const isHardcodedAdmin = user?.email && adminEmails.includes(user.email.toLowerCase());
    const isHardcodedJury = user?.email && juryEmails.includes(user.email.toLowerCase());
    
    // Admin boleh masuk ke mana saja (HQ & Juri)
    // Juri HANYA boleh masuk ke area /juri
    if (path.startsWith("/hq") && !isHardcodedAdmin && user?.user_metadata?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = user ? "/dashboard" : "/login";
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/juri") && !isHardcodedAdmin && !isHardcodedJury && user?.user_metadata?.role !== "juri" && user?.user_metadata?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return response;
  }

  // 2. Cek Dashboard Peserta Umum
  if (isDashboard && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  return response;
}


export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/hq/:path*", "/juri/:path*"],
};
