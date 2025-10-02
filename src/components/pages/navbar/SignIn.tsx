"use client";

import { useTranslate } from "@/utils/hooks/useTranslation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/utils/firebase/config";

export default function SignIn() {
  const { t } = useTranslate();
  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    await signInWithPopup(auth, provider);
  };

  return (
    <button
      className="bg-theme-secondary hover:bg-theme-secondary-hover flex items-center space-x-1 rounded-md border-2 border-black px-2 py-1 font-semibold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
      onClick={handleGoogleSignIn}
    >
      {t("navbar.signIn")}
    </button>
  );
}
