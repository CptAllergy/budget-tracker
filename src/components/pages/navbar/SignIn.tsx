"use client";

import { RoundedButton } from "@/components/commons/buttons/RoundedButton";
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
    <RoundedButton onClick={handleGoogleSignIn} type="primary">
      {t("navbar.signIn")}
    </RoundedButton>
  );
}
