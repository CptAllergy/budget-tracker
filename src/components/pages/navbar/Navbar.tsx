"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { LoadingRoundedButton } from "@/components/loading/buttons/LoadingRoundedButton";
import SignIn from "@/components/pages/navbar/SignIn";
import { spaceGrotesk } from "@/styles/fonts";
import Image from "next/image";
import budgetTrackerCoinLogo from "public/assets/coin_budget_tracker.png";
import {
  LuArrowUpRight,
  LuBookmark,
  LuBookmarkCheck,
  LuClipboardList,
  LuMenu,
  LuPlus,
  LuSettings,
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
import { usePathname, useSearchParams } from "next/navigation";
import { useCurrentUser, useExpenseGroups } from "@/utils/hooks/reactQueryUser";
import { useQueryClient } from "@tanstack/react-query";
import { SetState } from "@/types/componentTypes";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { SettingsDialog } from "@/components/commons/dialogs/SettingsDialog";
import { auth } from "@/utils/firebase/config";
import { User } from "@firebase/auth";
import { useUserSession } from "@/utils/hooks/useUserSession";
import { Ring2 } from "ldrs/react";
import "ldrs/react/Ring2.css";

type NavbarProps = {
  initialUser: User | null;
  setIsAddDialogOpen?: SetState<boolean>;
};

export const Navbar = ({ initialUser, setIsAddDialogOpen }: NavbarProps) => {
  const user = useUserSession(initialUser);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    setLoading(false);
  }, [user]);

  return (
    <>
      <div className="bg-theme-main relative z-10 h-16 w-full border-b-2 border-black">
        <div className="absolute top-0 bottom-0 left-0 ml-2 flex items-center gap-3">
          {/*TODO must check for currentUser*/}
          {user && <DrawerMenuButton />}
          <NavbarBudgetTrackerLogo />
        </div>
        <div className="absolute top-0 right-0 bottom-0 mt-1 mr-2 flex items-center md:mr-4">
          {loading ? (
            <NavbarLoadingSkeleton />
          ) : user ? (
            // TODO must check for current user
            <NavbarUserOptions setIsAddDialogOpen={setIsAddDialogOpen} />
          ) : (
            <NavbarSignInOptions />
          )}
        </div>
      </div>
    </>
  );
};

const DrawerMenuButton = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <Drawer direction="left" snapPoints={undefined} fadeFromIndex={undefined}>
      <DrawerTrigger>
        <div className="bg-theme-secondary hover:bg-theme-secondary-hover rounded-md border-2 border-black py-1.5 pr-2 pl-2 font-semibold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <LuMenu size="24" className="stroke-[2.5]" />
        </div>
      </DrawerTrigger>
      <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
      <DrawerMenu setIsSettingsOpen={setIsSettingsOpen} />
    </Drawer>
  );
};

const DrawerMenu = ({
  setIsSettingsOpen,
}: {
  setIsSettingsOpen: SetState<boolean>;
}) => {
  return (
    <DrawerContent
      aria-describedby={"Hello"}
      className="bg-theme-secondary border-black"
    >
      <DrawerHeader className="flex flex-row items-center justify-between">
        <DrawerTitle className="-ml-1.5 text-base sm:ml-0">
          <div className="h-10 w-10">
            <Image
              quality={90}
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
      <NavigationList />
      <DrawerFooter className="flex flex-row items-center justify-between">
        <DrawerClose
          onClick={() => setIsSettingsOpen(true)}
          className="bg-theme-highlight hover:bg-theme-highlight-hover mb-2 rounded-md border-2 border-black p-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:mr-1"
        >
          <LuSettings className="size-6 flex-shrink-0" />
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  );
};

// TODO let currentUser pick a favourite group which will become the default for that currentUser
// TODO allow currentUser to create new groups
// TODO instantly update the selected option when it's clicked
const NavigationList = () => {
  const { t } = useTranslate();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { currentUser } = useCurrentUser();

  const selectedPageStyle = (page: string) => {
    return pathname === page
      ? "bg-theme-main hover:bg-theme-hover"
      : "bg-theme-highlight hover:bg-theme-highlight-hover";
  };

  const selectedGroupStyle = (groupId: string) => {
    const selectedGroupId = searchParams.get("groupId") ?? currentUser?.groupId;

    return pathname === "/" && selectedGroupId === groupId
      ? "bg-theme-main hover:bg-theme-hover"
      : "bg-theme-highlight hover:bg-theme-highlight-hover";
  };

  return (
    <div className="mt-1 overflow-y-auto py-2 pr-12 pl-3 sm:mt-3 sm:pr-8 sm:pl-4">
      <div className="space-y-3">
        <Link
          href="/profile"
          className={`${selectedPageStyle("/profile")} group flex cursor-pointer items-center gap-2 rounded-md border-2 border-black p-1 text-sm/7 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all sm:gap-3 sm:p-2 sm:text-base`}
        >
          <LuUser className="size-5 flex-shrink-0" />
          <p className="truncate font-semibold">{t("navbar.profile")}</p>
          <LuArrowUpRight className="ml-auto size-5 flex-shrink-0 text-gray-800 group-hover:block sm:hidden" />
        </Link>
        <Link
          href="/reports"
          className={`${selectedPageStyle("/reports")} group flex cursor-pointer items-center gap-2 rounded-md border-2 border-black p-1 text-sm/7 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all sm:gap-3 sm:p-2 sm:text-base`}
        >
          <LuClipboardList className="size-5 flex-shrink-0" />
          <p className="truncate font-semibold">{t("navbar.reports")}</p>
          <LuArrowUpRight className="ml-auto size-5 flex-shrink-0 text-gray-800 group-hover:block sm:hidden" />
        </Link>
        <hr className="my-4 border-t border-b border-black" />
        <div className="ml-1 font-semibold">{t("navbar.expenseGroups")}</div>
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
  const { t } = useTranslate();
  const { currentUser } = useCurrentUser();
  const { expenseGroups, isLoading } = useExpenseGroups(currentUser);

  if (isLoading) {
    return (
      <div className="ml-1 pt-2">
        <Ring2
          size="30"
          stroke="5"
          strokeLength="0.25"
          bgOpacity="0.1"
          speed="0.9"
          color="black"
        />
      </div>
    );
  }

  if (expenseGroups?.length === 0) {
    return <div className="ml-1 pt-2">{t("navbar.noExpenseGroups")}</div>;
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
          quality={90}
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
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  return (
    <div className="flex items-center space-x-3">
      {setIsAddDialogOpen && (
        <div className="flex space-x-2">
          <button
            className="bg-theme-secondary hover:bg-theme-secondary-hover hidden items-center space-x-1 rounded-md border-2 border-black py-1 pr-2 pl-1 font-semibold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:flex"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <LuPlus size="20" className="stroke-[2.5]" />
            <span>{t("navbar.newTransaction")}</span>
          </button>
        </div>
      )}
      <button
        className="bg-theme-secondary hover:bg-theme-secondary-hover flex items-center space-x-1 rounded-md border-2 border-black px-2 py-1 font-semibold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
        onClick={() => {
          queryClient.clear();
          void auth.signOut();
        }}
      >
        {t("navbar.signOut")}
      </button>
    </div>
  );
};
