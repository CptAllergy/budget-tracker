import React, { Fragment, PropsWithChildren } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { DropdownMenuItemType } from "@/types/componentTypes";
import { AnchorProps } from "@headlessui/react/dist/internal/floating";

interface Props {
  menuButton: JSX.Element;
  menuItems: DropdownMenuItemType[];
  anchorPosition?: AnchorProps;
}

export const DropdownMenu = ({
  menuButton,
  menuItems,
  anchorPosition = "bottom end",
}: Props) => {
  return (
    <Menu>
      <MenuButton>{menuButton}</MenuButton>
      <MenuItems
        anchor={anchorPosition}
        modal={false}
        transition
        className="z-50 mt-2 rounded-md bg-white shadow-md ring-1 ring-black ring-opacity-5 transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        {menuItems.map((menuItem, key) => {
          if (typeof menuItem.onClick !== "undefined") {
            return (
              <DropdownMenuItemButton key={key} onClick={menuItem.onClick}>
                {menuItem.icon}
                {menuItem.label}
              </DropdownMenuItemButton>
            );
          } else if (menuItem.href) {
            return (
              <DropdownMenuItemLink key={key} href={menuItem.href}>
                {menuItem.icon}
                {menuItem.label}
              </DropdownMenuItemLink>
            );
          }
        })}
      </MenuItems>
    </Menu>
  );
};

const getDropdownMenuItemStyle = (): string => {
  return "flex w-full items-center gap-4 py-3 pl-3 pr-14 text-sm text-gray-500 font-semibold data-[focus]:bg-gray-100 data-[focus]:text-gray-800";
};

const DropdownMenuItemButton = ({
  onClick,
  children,
}: PropsWithChildren<{
  onClick: () => void;
}>) => {
  return (
    <MenuItem>
      <button className={getDropdownMenuItemStyle()} onClick={onClick}>
        {children}
      </button>
    </MenuItem>
  );
};

const DropdownMenuItemLink = ({
  href,
  children,
}: PropsWithChildren<{
  href: Url;
}>) => {
  return (
    <MenuItem>
      <Link className={getDropdownMenuItemStyle()} href={href}>
        {children}
      </Link>
    </MenuItem>
  );
};
