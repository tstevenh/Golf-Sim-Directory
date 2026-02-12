import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 301 redirect underscore slugs to hyphen slugs (SEO: avoid duplicate pages)
  const { pathname } = request.nextUrl;
  if (pathname.includes("_")) {
    const cleanPath = pathname.replace(/_/g, "-");
    if (cleanPath !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = cleanPath;
      return NextResponse.redirect(url, 301);
    }
  }

  // Support legacy city pagination query param by redirecting to server-rendered paginated path.
  // /venue/us/:state/:city?page=2 -> /venue/us/:state/:city/page/2
  const pageParam = request.nextUrl.searchParams.get("page");
  if (pageParam && /^\d+$/.test(pageParam)) {
    const pageNum = Number(pageParam);
    const segments = pathname.split("/").filter(Boolean);
    const isCityBaseRoute =
      segments.length === 4 &&
      segments[0] === "venue" &&
      segments[1] === "us";

    if (isCityBaseRoute) {
      const url = request.nextUrl.clone();
      url.searchParams.delete("page");
      if (pageNum <= 1) {
        return NextResponse.redirect(url, 307);
      }
      url.pathname = `${pathname.replace(/\/$/, "")}/page/${pageNum}`;
      return NextResponse.redirect(url, 307);
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this is required for Server Components
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|logo.png|og-image.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
