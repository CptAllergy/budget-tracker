import { Url } from "next/dist/shared/lib/router/router";

export type DropdownMenuItemType = {
  label: string;
  icon: JSX.Element;
  onClick?: () => void;
  href?: Url;
};
