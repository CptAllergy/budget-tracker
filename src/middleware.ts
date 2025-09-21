import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export default async function middleware(req: NextRequest) {
  const firebaseSession = req.cookies.get("__session")?.value;
  const isAuthorized = await isUserAuthorized(firebaseSession);

  if (!firebaseSession && req.nextUrl.pathname !== "/login") {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  } else if (
    firebaseSession &&
    isAuthorized &&
    !userPages.includes(req.nextUrl.pathname)
  ) {
    const newUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  } else if (
    firebaseSession &&
    !isAuthorized &&
    !visitorPages.includes(req.nextUrl.pathname)
  ) {
    const newUrl = new URL("/forbidden", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }
}
const userPages = ["/", "/profile", "/reports"];
const visitorPages = ["/forbidden", "/preview"];

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icons/).*)"],
};

/**
 * Checks if the user exists in firestore and if access is granted
 */
async function isUserAuthorized(idToken?: string): Promise<boolean> {
  if (!idToken) return false;

  try {
    const decoded = jwtDecode(idToken);
    const userId = decoded.sub;

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/budget-tracker-f7d03/databases/(default)/documents/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return response.status == 200;
  } catch {
    return false;
  }
}
