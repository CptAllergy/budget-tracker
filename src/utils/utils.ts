import { type ClassValue, clsx } from "clsx";
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
    return () => "";
  }

  return (groupId: string | null) => {
    const group = expenseGroups.find((group) => group.id === groupId);
    return group ? group.name : NO_EXPENSE_GROUP;
  };
}

export function sortExpenseGroups(
  groups: ExpenseGroupDTO[],
  defaultPage?: string
) {
  // Sort groups by name
  const sortedGroups = [...groups].sort((a, b) => a.name.localeCompare(b.name));

  // Move the favourite group to the top if it exists
  if (defaultPage) {
    const favouriteIndex = sortedGroups.findIndex(
      (group) => group.id === defaultPage
    );
    if (favouriteIndex !== -1) {
      const [favouriteGroup] = sortedGroups.splice(favouriteIndex, 1);
      sortedGroups.unshift(favouriteGroup);
    }
  }

  return sortedGroups;
}
