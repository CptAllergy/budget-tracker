"use client";

import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { UserDTO } from "@/types/DTO/dataTypes";
import { TransactionGroupsContext } from "@/contexts/TransactionGroupsContext";
import { AlertContext } from "@/contexts/AlertContext";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";

export const Navbar = ({
  setIsAddDialogOpen,
  currentUser,
}: {
  setIsAddDialogOpen?: Dispatch<SetStateAction<boolean>>;
  currentUser?: UserDTO;
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
        <div className="absolute top-0 bottom-0 left-0 ml-2 flex items-center gap-3">
          {session?.user && (
            <NavbarGroupSelectorButton currentUser={currentUser} />
          )}
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

const NavbarGroupSelectorButton = ({
  currentUser,
}: {
  currentUser?: UserDTO;
}) => {
  return (
    <Drawer direction="left" snapPoints={undefined} fadeFromIndex={undefined}>
      <DrawerTrigger>
        <div className="bg-theme-secondary hover:bg-theme-secondary-hover rounded-md border-2 border-black py-1.5 pr-2 pl-2 font-semibold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <LuMenu size="24" className="stroke-[2.5]" />
        </div>
      </DrawerTrigger>
      <NavbarGroupSelectorDrawer currentUser={currentUser} />
    </Drawer>
  );
};

const NavbarGroupSelectorDrawer = ({
  currentUser,
}: {
  currentUser?: UserDTO;
}) => {
  return (
    <DrawerContent
      aria-describedby={"Hello"}
      className="bg-theme-secondary border-black"
    >
      <DrawerHeader className="flex flex-row items-center justify-between">
        <DrawerTitle className="-ml-1.5 text-base sm:ml-0">
          Transaction Groups
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Choose Transaction Groups
        </DrawerDescription>
        <DrawerClose className="rounded-md border-2 border-black bg-white p-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:mr-1">
          <LuX className="size-4 [stroke-width:3]" />
        </DrawerClose>
      </DrawerHeader>
      {currentUser && <GroupSelectorList currentUser={currentUser} />}
      <DrawerFooter></DrawerFooter>
    </DrawerContent>
  );
};

// TODO let user pick a favourite group which will become the default for that user
// TODO allow user to create new groups
const GroupSelectorList = ({ currentUser }: { currentUser: UserDTO }) => {
  const alertContext = useRef(useContext(AlertContext));
  const transactionGroupsContext = useContext(TransactionGroupsContext);

  const filterId = transactionGroupsContext.filterId;
  const handleFilterChange = useRef(
    transactionGroupsContext.handleFilterChange
  );

  const transactionGroups = transactionGroupsContext.transactionGroups;

  const handleGroupClick = (groupId: string, groupName: string) => {
    // TODO redirecting from the profile page to the home page does not save the chosen group. Maybe add something to local storage to make this move and then remove it, similar to the login
    try {
      handleFilterChange.current({ groupId: groupId, groupName: groupName });
    } catch {
      toggleStatusErrorAlert(alertContext.current, "GENERIC");
    }
  };

  const selectedProfileStyle = filterId?.userId
    ? "bg-theme-main hover:bg-theme-hover"
    : "bg-theme-highlight hover:bg-theme-highlight-hover";
  const selectedGroupStyle = (groupId: string) => {
    return filterId?.groupId && filterId.groupId === groupId
      ? "bg-theme-main hover:bg-theme-hover"
      : "bg-theme-highlight hover:bg-theme-highlight-hover";
  };

  return (
    <div className="mt-1 overflow-y-auto py-2 pr-12 pl-3 sm:mt-3 sm:pr-8 sm:pl-4">
      <div className="space-y-3">
        <Link
          href="/profile"
          onClick={() => handleFilterChange.current({ userId: currentUser.id })}
          className={`${selectedProfileStyle} flex cursor-pointer items-center gap-2 rounded-md border-2 border-black p-1 text-sm/7 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all sm:gap-3 sm:p-2 sm:text-base`}
        >
          <LuUser className="size-5 flex-shrink-0" />
          <div className="truncate font-semibold">Profile</div>
        </Link>
        <hr className="my-4 border-t border-b border-black" />
        {transactionGroups.length === 0 ? (
          <div className="ml-2 text-sm font-semibold sm:text-base">
            You don&#39;t have any groups
          </div>
        ) : (
          transactionGroups.map((group) => (
            <Link
              key={group.id}
              href="/"
              onClick={() => handleGroupClick(group.id, group.name)}
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
        )}
      </div>
    </div>
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
        onClick={() => signOut()}
      >
        Sign Out
      </button>
    </div>
  );
};
