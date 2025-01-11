import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  // TODO can this request be cached somehow? Is this even a problem? When does middleware run, only on page change?
  const authorizedUsersResponse = await fetch(
    "https://firestore.googleapis.com/v1/projects/budget-tracker-f7d03/databases/(default)/documents/authorized"
  );
  // TODO define these types so it's not any
  const authorizedUsersCollection = await authorizedUsersResponse.json();

  const authorizedUsers: string[] = authorizedUsersCollection.documents.map(
    (e: any) => e.fields.email.stringValue
  );

  if (!req.auth && req.nextUrl.pathname !== "/login") {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  } else if (
    req.auth &&
    authorizedUsers.includes(req.auth.user.email as string) &&
    req.nextUrl.pathname !== "/"
  ) {
    const newUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  } else if (
    req.auth &&
    !authorizedUsers.includes(req.auth.user.email as string) &&
    req.nextUrl.pathname !== "/forbidden" &&
    req.nextUrl.pathname !== "/preview"
  ) {
    const newUrl = new URL("/forbidden", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }
});
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
