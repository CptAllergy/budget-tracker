"use client";

import React from "react";
import { rancho } from "@/styles/fonts";
import budgetTrackerCoinLogo from "public/assets/coin_budget_tracker.png";
import Image from "next/image";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { Navbar } from "@/components/pages/navbar/Navbar";
import { User } from "@firebase/auth";

type Props = { initialUser: User | null };

const Login = ({ initialUser }: Props) => {
  const { t } = useTranslate();

  return (
    <div className="flex flex-col items-center">
      <Navbar initialUser={initialUser} />
      <div className="bg-theme-secondary mx-4 my-10 flex flex-col items-center rounded-md border-2 border-black p-10 shadow-[5px_5px_0px_rgba(0,0,0,1)] md:my-16">
        <p
          className={`${rancho.className} text-2xl font-semibold underline underline-offset-4 sm:text-3xl md:text-4xl`}
        >
          {t("login.welcome")}
        </p>
        <div className="my-5 h-32 w-32 sm:my-10 md:h-44 md:w-44">
          <Image
            quality={90}
            src={budgetTrackerCoinLogo}
            alt="Budget Tracker Logo"
          />
        </div>
        <p className="text-justify font-medium sm:w-80 sm:text-lg">
          {t("login.description")}
        </p>
      </div>
    </div>
  );
};

export default Login;
