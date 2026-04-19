import { type NextRequest, NextResponse } from "next/server";

// Middleware minimal - proteksi dashboard via cookie hint
// Auth utama menggunakan localStorage (client-side)
export function proxy(request: NextRequest) {
  const isLoggedIn = request.cookies.get("ncc_hint")?.value === "1";
  const isAdmin = request.cookies.get("ncc_admin_hint")?.value === "1";
  const path = request.nextUrl.pathname;
  
  const isDashboard = path.startsWith("/dashboard");
  const isAdminArea = path.startsWith("/admin");

  if (isDashboard && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  if (isAdminArea) {
    if (!isLoggedIn || !isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard"; 
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
