"use client";

import { signIn } from "next-auth/react";
import { RoundedButton } from "@/components/commons/buttons/RoundedButton";

export default function SignIn() {
  return (
    <RoundedButton onClick={() => signIn("google")} type="primary">
      Sign In
    </RoundedButton>
  );
}
