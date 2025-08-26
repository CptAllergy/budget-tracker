"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { LoadingRoundedButton } from "@/components/loading/buttons/LoadingRoundedButton";
import { signOut, useSession } from "next-auth/react";
import SignIn from "@/components/elements/login/SignIn";
import { spaceGrotesk } from "@/styles/fonts";
import Image from "next/image";
import budgetTrackerCoinLogo from "../../../../public/assets/coin_budget_tracker.png";
import {
  LuBookmark,
  LuBookmarkCheck,
  LuClipboardList,
  LuMenu,
  LuPlus,
  LuUser,
  LuX,
} from "react-icons/lu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/commons/menus/DrawerMenu";
import { usePathname } from "next/navigation";
import { useCurrentUser, useExpenseGroups } from "@/utils/hooks/reactQuery";
import { useQueryClient } from "@tanstack/react-query";
import { ExpenseListType, SetState } from "@/types/componentTypes";

type NavbarProps = {
  setIsAddDialogOpen?: SetState<boolean>;
  filterId?: ExpenseListType;
};

export const Navbar = ({ setIsAddDialogOpen, filterId }: NavbarProps) => {
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
        <div className="absolute top-0 bottom-0 left-0 ml-2 flex items-center gap-3">
          {session?.user && <DrawerMenuButton filterId={filterId} />}
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

const DrawerMenuButton = ({ filterId }: { filterId?: ExpenseListType }) => {
  return (
    <Drawer direction="left" snapPoints={undefined} fadeFromIndex={undefined}>
      <DrawerTrigger>
        <div className="bg-theme-secondary hover:bg-theme-secondary-hover rounded-md border-2 border-black py-1.5 pr-2 pl-2 font-semibold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <LuMenu size="24" className="stroke-[2.5]" />
        </div>
      </DrawerTrigger>
      <DrawerMenu filterId={filterId} />
    </Drawer>
  );
};

const DrawerMenu = ({ filterId }: { filterId?: ExpenseListType }) => {
  return (
    <DrawerContent
      aria-describedby={"Hello"}
      className="bg-theme-secondary border-black"
    >
      <DrawerHeader className="flex flex-row items-center justify-between">
        <DrawerTitle className="-ml-1.5 text-base sm:ml-0">
          <div className="h-10 w-10">
            <Image
              quality={100}
              src={budgetTrackerCoinLogo}
              alt="Budget Tracker Logo"
            />
          </div>
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Choose Expense Groups
        </DrawerDescription>
        <DrawerClose className="rounded-md border-2 border-black bg-white p-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:mr-1">
          <LuX className="size-4 [stroke-width:3]" />
        </DrawerClose>
      </DrawerHeader>
      <NavigationList filterId={filterId} />
      <DrawerFooter></DrawerFooter>
    </DrawerContent>
  );
};

// TODO let user pick a favourite group which will become the default for that user
// TODO allow user to create new groups
// TODO instantly update the selected option when it's clicked
const NavigationList = ({ filterId }: { filterId?: ExpenseListType }) => {
  const pathname = usePathname();

  const selectedPageStyle = (page: string) => {
    return pathname.includes(page) //&& !filterId?.groupId
      ? "bg-theme-main hover:bg-theme-hover"
      : "bg-theme-highlight hover:bg-theme-highlight-hover";
  };

  const selectedGroupStyle = (groupId: string) => {
    if (filterId) {
      return filterId?.groupId && filterId.groupId === groupId
        ? "bg-theme-main hover:bg-theme-hover"
        : "bg-theme-highlight hover:bg-theme-highlight-hover";
    } else {
      return "bg-theme-highlight hover:bg-theme-highlight-hover";
    }
  };

  return (
    <div className="mt-1 overflow-y-auto py-2 pr-12 pl-3 sm:mt-3 sm:pr-8 sm:pl-4">
      <div className="space-y-3">
        <Link
          href="/profile"
          className={`${selectedPageStyle("profile")} flex cursor-pointer items-center gap-2 rounded-md border-2 border-black p-1 text-sm/7 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all sm:gap-3 sm:p-2 sm:text-base`}
        >
          <LuUser className="size-5 flex-shrink-0" />
          <div className="truncate font-semibold">Profile</div>
        </Link>
        <Link
          href="/reports"
          className={`${selectedPageStyle("reports")} flex cursor-pointer items-center gap-2 rounded-md border-2 border-black p-1 text-sm/7 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all sm:gap-3 sm:p-2 sm:text-base`}
        >
          <LuClipboardList className="size-5 flex-shrink-0" />
          <div className="truncate font-semibold">Reports</div>
        </Link>
        <hr className="my-4 border-t border-b border-black" />
        <div className="ml-1 font-semibold">Expense Groups</div>
        <ExpenseGroupList selectedGroupStyle={selectedGroupStyle} />
      </div>
    </div>
  );
};

const ExpenseGroupList = ({
  selectedGroupStyle,
}: {
  selectedGroupStyle: (groupId: string) => string;
}) => {
  const { currentUser } = useCurrentUser();
  const { expenseGroups, error, isLoading } = useExpenseGroups(currentUser);

  // TODO improve the loading animation
  if (isLoading) {
    return (
      <div className="flex items-center justify-center">loading groups...</div>
    );
  }

  // TODO toggle the status error alert here instead
  if (error) {
    return (
      <div className="ml-2 text-sm font-semibold sm:text-base">
        Error loading groups: {error.message}
      </div>
    );
  }

  // TODO improve the way this looks a bit
  if (expenseGroups?.length === 0) {
    return (
      <div className="ml-2 text-sm font-semibold sm:text-base">
        You don&#39;t have any groups
      </div>
    );
  }

  return (
    currentUser &&
    expenseGroups?.map((group) => (
      <Link
        key={group.id}
        href={{ pathname: "/", query: { groupId: group.id } }}
        className={`${selectedGroupStyle(group.id)} flex cursor-pointer items-center gap-2 rounded-md border-2 border-black p-1 text-sm/7 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all sm:gap-3 sm:p-2 sm:text-base`}
      >
        {currentUser.groupId === group.id ? (
          <LuBookmarkCheck size="20" className="size-5 flex-shrink-0" />
        ) : (
          <LuBookmark size="20" className="size-5 flex-shrink-0" />
        )}
        <div className="truncate font-semibold">{group.name}</div>
      </Link>
    ))
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
        className={`${spaceGrotesk.className} hidden text-lg font-extrabold tracking-wide text-white sm:block`}
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
  const queryClient = useQueryClient();
  return (
    <div className="flex items-center space-x-5">
      {setIsAddDialogOpen && (
        <div className="flex space-x-2">
          <button
            className="bg-theme-secondary hover:bg-theme-secondary-hover hidden items-center space-x-1 rounded-md border-2 border-black py-1 pr-2 pl-1 font-semibold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:flex"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <LuPlus size="20" className="stroke-[2.5]" />
            <span>New</span>
          </button>
        </div>
      )}
      <button
        className="mr-5 font-bold text-white underline"
        onClick={() => {
          queryClient.clear();
          void signOut();
        }}
      >
        Sign Out
      </button>
    </div>
  );
};
