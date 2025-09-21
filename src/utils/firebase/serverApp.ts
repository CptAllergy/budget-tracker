import "server-only";

import { cookies } from "next/headers";
import { FirebaseOptions, initializeServerApp } from "firebase/app";

import { getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = JSON.parse(
  process.env.NEXT_PUBLIC_FIREBASE_CONFIG!!
);

export async function getServerUser() {
  const authIdToken = (await cookies()).get("__session")?.value;

  const firebaseServerApp = initializeServerApp(firebaseConfig, {
    authIdToken,
  });

  const auth = getAuth(firebaseServerApp);
  await auth.authStateReady();

  return { firebaseServerApp, serverUser: auth.currentUser };
}
