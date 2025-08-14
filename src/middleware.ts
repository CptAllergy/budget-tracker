import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const authorizedUsers = await getAuthorizedUsers();

  if (!authorizedUsers) {
    if (req.nextUrl.pathname !== "/error") {
      const newUrl = new URL("/error", req.nextUrl.origin);
      return NextResponse.redirect(newUrl);
    }
  } else if (!req.auth && req.nextUrl.pathname !== "/login") {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  } else if (
    req.auth &&
    authorizedUsers.includes(req.auth.user.email as string) &&
    !userPages.includes(req.nextUrl.pathname)
  ) {
    const newUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  } else if (
    req.auth &&
    !authorizedUsers.includes(req.auth.user.email as string) &&
    !visitorPages.includes(req.nextUrl.pathname)
  ) {
    const newUrl = new URL("/forbidden", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }
});

const visitorPages = ["/forbidden", "/preview"];
const userPages = ["/", "/profile", "/reports"];

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icons/).*)"],
};

/**
 * Returns the authorized users from Firestore, returns undefined if an error is encountered
 */
async function getAuthorizedUsers(): Promise<string[] | undefined> {
  const authorizedUsersResponse = await fetch(
    "https://firestore.googleapis.com/v1/projects/budget-tracker-f7d03/databases/(default)/documents/authorized"
  );

  if (authorizedUsersResponse.status != 200) {
    return undefined;
  }

  try {
    const authorizedUsersCollection = await authorizedUsersResponse.json();
    return authorizedUsersCollection.documents.map(
      (e: any) => e.fields.email.stringValue
    );
  } catch {
    return undefined;
  }
}
