import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MonthYearType } from "@/types/componentTypes";
import { ExpenseGroupDTO, NO_EXPENSE_GROUP } from "@/types/DTO/dataTypes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentMonthYear(): MonthYearType {
  const currentDate = new Date();
  return { month: currentDate.getMonth(), year: currentDate.getFullYear() };
}

export function getExpenseGroupName(expenseGroups?: ExpenseGroupDTO[]) {
  if (!expenseGroups) {
    return () => NO_EXPENSE_GROUP;
  }

  return (groupId: string | null) => {
    const group = expenseGroups.find((group) => group.id === groupId);
    return group ? group.name : NO_EXPENSE_GROUP;
  };
}
