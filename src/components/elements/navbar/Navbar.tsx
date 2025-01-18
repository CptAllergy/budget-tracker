"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingRoundedButton } from "@/components/loading/buttons/LoadingRoundedButton";
import { signOut, useSession } from "next-auth/react";
import SignIn from "@/components/elements/login/SignIn";

export const Navbar = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  }, [session]);

  return (
    <>
      <div className="relative z-10 h-16 w-full bg-theme-main">
        <div className="absolute bottom-0 left-0 top-0 ml-2 flex items-center md:ml-6">
          <NavbarBudgetTrackerLogo />
        </div>
        {/*TODO theres a bit of a flicker here when the user is logged in, can check on aftersights how I did it there*/}
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
      <h1 className="mt-1 text-base font-extrabold tracking-widest text-white">
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
