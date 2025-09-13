"use client";

import { signIn } from "next-auth/react";
import { RoundedButton } from "@/components/commons/buttons/RoundedButton";
import { useTranslate } from "@/utils/hooks/useTranslation";

export default function SignIn() {
  const { t } = useTranslate();
  return (
    <RoundedButton onClick={() => signIn("google")} type="primary">
      {t("navbar.signIn")}
    </RoundedButton>
  );
}
