"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { LoadingRoundedButton } from "@/components/loading/buttons/LoadingRoundedButton";
import { signOut, useSession } from "next-auth/react";
import SignIn from "@/components/elements/login/SignIn";
import { spaceGrotesk } from "@/styles/fonts";
import Image from "next/image";
import budgetTrackerCoinLogo from "../../../../public/assets/coin_budget_tracker.png";
import { LuPlus, LuPlusCircle } from "react-icons/lu";

export const Navbar = ({
  setIsAddDialogOpen,
}: {
  setIsAddDialogOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
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
      <div className="bg-theme-main relative z-10 h-16 w-full border-b-2 border-black">
        <div className="absolute top-0 bottom-0 left-0 ml-2 flex items-center">
          <NavbarBudgetTrackerLogo />
        </div>
        <div className="absolute top-0 right-0 bottom-0 mt-1 mr-2 flex items-center md:mr-4">
          {loading ? (
            <NavbarLoadingSkeleton />
          ) : session?.user ? (
            <NavbarUserOptions setIsAddDialogOpen={setIsAddDialogOpen} />
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
    <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
      <div className="h-10 w-10">
        <Image
          quality={100}
          src={budgetTrackerCoinLogo}
          alt="Budget Tracker Logo"
        />
      </div>
      <h1
        className={`${spaceGrotesk.className} text-base font-extrabold tracking-wide text-white sm:text-lg`}
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

const NavbarUserOptions = ({
  setIsAddDialogOpen,
}: {
  setIsAddDialogOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="flex items-center space-x-5 text-white md:space-x-8">
      {setIsAddDialogOpen && (
        <button
          className="bg-theme-secondary hover:bg-theme-secondary-hover hidden items-center space-x-1 rounded-md border-2 border-black py-1 pr-2 pl-1 font-semibold text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] sm:flex"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <LuPlus size="20" className="stroke-[2.5]" />
          <span>New</span>
        </button>
      )}
      <button className="mr-5 font-bold underline" onClick={() => signOut()}>
        Sign Out
      </button>
    </div>
  );
};
