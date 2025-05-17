export const TRANSACTION_CATEGORIES = [
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

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export const TRANSACTION_TAGS = [
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

export type TransactionTag = (typeof TRANSACTION_TAGS)[number];
