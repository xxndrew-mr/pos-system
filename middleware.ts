import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Ambil role user dari token
    const token = req.nextauth.token;
    const role = token?.role;
    const path = req.nextUrl.pathname;

    // Proteksi Halaman Dashboard (Admin Only)
    if (path.startsWith("/dashboard") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/pos", req.url));
    }

    // Proteksi Halaman POS (Cashier & Admin boleh akses)
    // Admin biasanya juga boleh akses POS untuk testing
    if (path.startsWith("/pos") && !role) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Harus login
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/pos/:path*"],
}