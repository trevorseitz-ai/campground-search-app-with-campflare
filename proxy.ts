import { NextResponse, type NextRequest } from "next/server";

// Friends-only gate. Friends open the app once with ?key=<FRIEND_KEY>; that sets a
// year-long cookie and the plain address works from then on. Everyone else gets a
// "private" page, and API routes return 401, so strangers can't run up paid API usage.
// Change FRIEND_KEY in Vercel to lock everyone out and hand out a new link.
// Fails closed: if FRIEND_KEY is unset, nobody gets in.

const COOKIE = "friend_key";
const ONE_YEAR = 60 * 60 * 24 * 365;

function sameKey(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function deny(isApi: boolean) {
  if (isApi) return NextResponse.json({ error: "Private app" }, { status: 401 });
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Private</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;background:#f6f6f4;color:#222}@media(prefers-color-scheme:dark){body{background:#151515;color:#eee}}main{padding:24px;text-align:center}</style></head>
<body><main><h1 style="font-size:1.4rem;margin:0 0 8px">This app is private</h1><p style="margin:0;opacity:.75">Ask the person who shared it with you for the link.</p></main></body></html>`,
    { status: 401, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

export function proxy(request: NextRequest) {
  const key = process.env.FRIEND_KEY;
  const url = request.nextUrl;
  const isApi = url.pathname.startsWith("/api/");
  if (!key) return deny(isApi);

  const offered = url.searchParams.get("key");
  if (offered !== null) {
    if (!sameKey(offered, key)) return deny(isApi);
    const clean = url.clone();
    clean.searchParams.delete("key");
    const res = NextResponse.redirect(clean);
    res.cookies.set(COOKIE, key, { httpOnly: true, secure: true, sameSite: "lax", maxAge: ONE_YEAR, path: "/" });
    return res;
  }

  const saved = request.cookies.get(COOKIE)?.value;
  if (saved && sameKey(saved, key)) return NextResponse.next();
  return deny(isApi);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
