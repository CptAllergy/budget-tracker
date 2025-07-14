import { Url } from "next/dist/shared/lib/router/router";
import { FormState } from "react-hook-form";
import { CreateEarningDTO, CreateExpenseDTO } from "@/types/DTO/dataTypes";

import type { JSX } from "react";

export type DropdownMenuItemType = {
  label: string;
  icon: JSX.Element;
  onClick?: () => void;
  href?: Url;
};

type FormInputs = "label" | "amount" | "newDate";

export type FormInputType = {
  fieldName: FormInputs;
  formState: FormState<CreateExpenseDTO | CreateEarningDTO>;
};

export type ExpenseListType =
  | { groupId: string; groupName: string; userId?: never }
  | { userId: string; groupId?: never; groupName?: never };

export type MonthYearType = {
  month: number;
  year: number;
};
