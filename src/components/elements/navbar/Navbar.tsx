"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingRoundedButton } from "@/components/loading/buttons/LoadingRoundedButton";
import { signOut, useSession } from "next-auth/react";
import SignIn from "@/components/elements/login/SignIn";
import { spaceGrotesk } from "@/styles/fonts";

export const Navbar = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (session?.user) {
      // session loaded and user is logged in
      setLoading(false);
    }
    if (session === null) {
      // session loaded but no user
      setLoading(false);
    }
  }, [session]);

  return (
    <>
      <div className="relative z-10 h-16 w-full border-b-2 border-black bg-theme-main">
        <div className="absolute bottom-0 left-0 top-0 ml-2 flex items-center md:ml-6">
          <NavbarBudgetTrackerLogo />
        </div>
        <div className="absolute bottom-0 right-0 top-0 mr-2 mt-1 flex items-center md:mr-4">
          {loading ? (
            <NavbarLoadingSkeleton />
          ) : session?.user ? (
            <NavbarSignOutOptions />
          ) : (
            <NavbarSignInOptions />
          )}
        </div>
      </div>
    </>
  );
};

const NavbarBudgetTrackerLogo = () => {
  return (
    <Link href="/" className="mx-2 flex items-center space-x-2">
      {/*<Image*/}
      {/*  height={60}*/}
      {/*  width={0}*/}
      {/*  src={}*/}
      {/*  alt="Budget Tracker Logo"*/}
      {/*/>*/}
      <h1
        className={`${spaceGrotesk.className} mt-1 text-lg font-extrabold tracking-wide text-white`}
      >
        Budget Tracker
      </h1>
    </Link>
  );
};

const NavbarLoadingSkeleton = () => {
  return (
    <>
      <LoadingRoundedButton size="md" className="mr-4" />
    </>
  );
};

const NavbarSignInOptions = () => {
  return (
    <>
      <SignIn />
    </>
  );
};

const NavbarSignOutOptions = () => {
  return (
    <>
      <button
        className="mr-5 font-bold text-white underline"
        onClick={() => signOut()}
      >
        Sign Out
      </button>
    </>
  );
};
