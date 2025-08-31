export const EXPENSE_CATEGORIES = [
  "other",
  "groceries",
  "dining",
  "transportation",
  "investments",
  "gifts",
  "housingUtilities",
  "homeGoods",
  "health",
  "entertainment",
  "personalCare",
  "repairs",
  "personalSpending",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_TAGS = [
  "food",
  "drinks",
  "vacation",
  "publicTransport",
  "gas",
  "pharmacy",
  "games",
  "clothing",
  "electronics",
  "subscriptions",
] as const;

export type ExpenseTag = (typeof EXPENSE_TAGS)[number];

export const EARNING_CATEGORIES = [
  "other",
  "salary",
  "mealAllowance",
  "investmentReturns",
  "refunds",
  "gifts",
  "bonuses",
] as const;

export type EarningCategory = (typeof EARNING_CATEGORIES)[number];
