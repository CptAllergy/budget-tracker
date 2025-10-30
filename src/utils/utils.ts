import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MonthYearType, TotalSettlementType } from "@/types/componentTypes";
import { ExpenseGroupDTO } from "@/types/DTO/dataTypes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentMonthYear(): MonthYearType {
  const currentDate = new Date();
  return { month: currentDate.getMonth(), year: currentDate.getFullYear() };
}

export function getExpenseGroupName(
  expenseGroups: ExpenseGroupDTO[] | undefined,
  defaultName: string
) {
  if (!expenseGroups) {
    return () => defaultName;
  }

  return (groupId: string | null) => {
    const group = expenseGroups.find((group) => group.id === groupId);
    return group ? group.name : defaultName;
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

export function settleBalances(members: { name: string; total: number }[]) {
  if (members.length <= 1) return [];

  const total = members.reduce((sum, m) => sum + Number(m.total), 0);
  const average = total / members.length;

  // Compute balances rounded to cents
  const balances = members.map((m) => ({
    name: m.name,
    balance: Number((m.total - average).toFixed(2)),
  }));

  const settlements: TotalSettlementType[] = [];
  const epsilon = 0.01;
  // Safety cap
  const maxIterations = members.length * members.length;

  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;

    // Sort by balance (debtors first, creditors last)
    balances.sort((a, b) => a.balance - b.balance);
    const debtor = balances[0];
    const creditor = balances[balances.length - 1];

    // Exit if everyone is basically settled
    if (creditor.balance <= epsilon && -debtor.balance <= epsilon) break;

    const amount = Math.min(-debtor.balance, creditor.balance);
    if (amount <= 0) break; // nothing left to settle safely

    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount: Number(amount.toFixed(2)),
    });

    // Update balances list
    debtor.balance = Number((debtor.balance + amount).toFixed(2));
    creditor.balance = Number((creditor.balance - amount).toFixed(2));
  }

  return settlements;
}
