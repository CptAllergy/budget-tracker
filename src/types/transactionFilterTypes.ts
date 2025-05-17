export const TRANSACTION_CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export const TRANSACTION_TAGS = [
  "Groceries",
  "Dining Out",
  "Public Transport",
  "Taxi",
  "Movies",
  "Concerts",
  "Gym",
  "Doctor",
  "Pharmacy",
  "Clothing",
  "Electronics",
  "Miscellaneous",
] as const;

export type TransactionTag = (typeof TRANSACTION_TAGS)[number];
