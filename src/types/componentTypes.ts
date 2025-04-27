import { Url } from "next/dist/shared/lib/router/router";
import { FormState } from "react-hook-form";
import { CreateTransactionDTO } from "@/types/DTO/dataTypes";

export type DropdownMenuItemType = {
  label: string;
  icon: JSX.Element;
  onClick?: () => void;
  href?: Url;
};

type FormInputs = "label" | "amount" | "newDate";

export type FormInputType = {
  fieldName: FormInputs;
  formState: FormState<CreateTransactionDTO>;
};
