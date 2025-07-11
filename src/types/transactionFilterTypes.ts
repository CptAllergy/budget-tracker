export const EXPENSE_CATEGORIES = [
  "Other",
  "Groceries",
  "Dining",
  "Transportation",
  "Investments",
  "Gifts",
  "Housing & Utilities",
  "Health",
  "Entertainment",
  "Personal Care",
  "Repairs",
  "Personal Spending",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_TAGS = [
  "Food",
  "Drinks",
  "Vacation",
  "Public Transport",
  "Gas",
  "Pharmacy",
  "Games",
  "Clothing",
  "Electronics",
  "Subscriptions",
  "Miscellaneous",
] as const;

export type ExpenseTag = (typeof EXPENSE_TAGS)[number];

export const EARNING_CATEGORIES = [
  "Other",
  "Salary",
  "Meal Allowance",
  "Stock Sales",
  "Interest",
  "Dividends",
  "Refunds",
  "Gifts",
  "Bonuses",
] as const;

export type EarningCategory = (typeof EARNING_CATEGORIES)[number];
