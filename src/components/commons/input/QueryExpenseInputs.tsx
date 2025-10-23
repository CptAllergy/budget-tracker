"use client";

import { useTranslate } from "@/utils/hooks/useTranslation";
import { LuCheck, LuChevronDown } from "react-icons/lu";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/commons/menus/ShadDropdownMenu";
import {
  Control,
  Controller,
  FormState,
  UseFormRegister,
} from "react-hook-form";
import { ReportQueryTypeInputs } from "@/types/componentTypes";
import { MdErrorOutline } from "react-icons/md";
import { isMatch } from "date-fns";
import { cn } from "@/utils/utils";

export type QuerySelectOptionType<T extends string = string> = {
  label: string;
  value: T;
  icon?: React.ReactNode;
};

type QueryExpenseSelectProps<T extends string = string> = {
  selectedCategory: T;
  onChange: (value: T) => void;
  options: QuerySelectOptionType<T>[];
  className?: string;
};

const QueryExpenseSelect = <T extends string>({
  selectedCategory,
  onChange,
  options,
  className,
}: QueryExpenseSelectProps<T>) => {
  const { t } = useTranslate();
  const selected = options.find((opt) => opt.value === selectedCategory);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          asChild
          className={cn(
            "bg-theme-highlight hover:bg-theme-highlight-hover w-full rounded-md border-2 border-black p-1 text-center font-normal transition-colors outline-none hover:cursor-pointer",
            className
          )}
        >
          <button className="flex items-center justify-between gap-1 px-2 capitalize">
            <span className="truncate">{selected && t(selected?.label)}</span>
            <LuChevronDown />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="my-1 max-h-72 w-full">
          <DropdownMenuRadioGroup
            value={selected?.value}
            onValueChange={onChange as (value: string) => void}
          >
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="group m-0.5 flex cursor-default items-center gap-2 rounded-sm px-3 py-1.5 select-none data-focus:bg-white/15"
              >
                <LuCheck className="text-theme-secondary size-4 [stroke-width:3] opacity-0 transition-all group-data-selected:opacity-100" />
                <div className="flex items-center gap-2 text-sm/6 font-semibold text-black group-data-focus:text-white">
                  {option.icon && (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full">
                      {option.icon}
                    </span>
                  )}
                  <span>{t(option.label)}</span>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

const FormQueryInputSelect = <T extends string>({
  control,
  options,
  fieldName,
  className,
}: {
  control: Control<ReportQueryTypeInputs>;
  options: QuerySelectOptionType<T>[];
  fieldName: "category" | "tag";
  className?: string;
}) => {
  return (
    <Controller
      control={control}
      name={fieldName}
      render={({ field: { value, onChange } }) => (
        <QueryExpenseSelect
          className={className}
          selectedCategory={value}
          onChange={onChange}
          options={options}
        />
      )}
    />
  );
};

const FormQueryInputDate = ({
  register,
  formState,
  fieldName,
  className,
}: {
  register: UseFormRegister<ReportQueryTypeInputs>;
  formState: FormState<ReportQueryTypeInputs>;
  fieldName: "firstDay" | "lastDay";
  className?: string;
}) => {
  const { t } = useTranslate();

  const { errors } = formState;
  return (
    <div className="flex flex-col">
      <div className="relative w-full">
        <input
          className={cn(
            "bg-theme-highlight w-full rounded-md border-2 border-black p-1 pl-2 font-normal transition-colors outline-none",
            className
          )}
          type="text"
          placeholder={t("reports.query.datePlaceholder")}
          {...register(fieldName, {
            required: t(`reports.query.${fieldName}Required`),
            validate: {
              isValidDate: async (inputDate) => {
                return (
                  isMatch(inputDate, "dd/MM/yyyy") ||
                  t("reports.query.invalidDate")
                );
              },
            },
          })}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-red-700">
          {errors[fieldName] && <MdErrorOutline size="20" />}
        </div>
      </div>
      {errors[fieldName] && (
        <span className="mt-1 font-semibold text-red-700">
          {errors[fieldName]?.message}
        </span>
      )}
    </div>
  );
};

export { FormQueryInputSelect, FormQueryInputDate };
