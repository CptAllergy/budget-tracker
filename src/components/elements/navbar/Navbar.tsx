"use client";

import React, { useEffect, useState } from "react";
import { StaticImageData } from "next/image";
import Link from "next/link";
import { RoundedButton } from "../../commons/buttons/RoundedButton";
import { LoadingRoundedButton } from "@/components/loading/buttons/LoadingRoundedButton";

type UserParameters = {
  username: string;
  imageUrl: string | StaticImageData;
};

interface Props {
  hasSearchBar?: boolean;
}

export const Navbar = ({ hasSearchBar = false }: Props) => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {}, []);

  return (
    <>
      <div className="relative z-10 h-20 w-full bg-theme-background-light">
        <div className="absolute bottom-0 left-0 top-0 ml-2 flex items-center md:ml-6">
          <NavbarBudgetTrackerLogo />
        </div>
        <div className="absolute bottom-0 right-0 top-0 mr-2 mt-3 flex items-center md:mr-4">
          {loading ? <NavbarLoadingSkeleton /> : <NavbarSignInOptions />}
        </div>
      </div>
    </>
  );
};

const NavbarBudgetTrackerLogo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2">
      {/*<Image*/}
      {/*  height={60}*/}
      {/*  width={0}*/}
      {/*  src={}*/}
      {/*  alt="Budget Tracker Logo"*/}
      {/*/>*/}
      <div className="mt-3 text-base font-extrabold text-theme-text-black">
        Budget Tracker
      </div>
    </Link>
  );
};

const NavbarLoadingSkeleton = () => {
  return (
    <>
      <LoadingRoundedButton size="md" className="hidden md:block" />
      <LoadingRoundedButton size="md" className="ml-1 md:ml-4" />
      <LoadingRoundedButton size="sm" className="ml-1 md:ml-4" />
    </>
  );
};

const NavbarSignInOptions = () => {
  return (
    <>
      <RoundedButton onClick={() => {}} type="secondary">
        Sign up
      </RoundedButton>
      <RoundedButton onClick={() => {}} type="primary" className="ml-1 md:ml-4">
        Login
      </RoundedButton>
    </>
  );
};
