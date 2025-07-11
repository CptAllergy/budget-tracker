import { ExpenseCategory, ExpenseTag } from "@/types/transactionFilterTypes";

export function getCategoryIcon(
  transactionFilter?: ExpenseCategory | ExpenseTag
): string {
  switch (transactionFilter) {
    // Transaction Categories
    case "Other":
      return "❓";
    case "Groceries":
      return "🛒";
    case "Dining":
      return "🍽️";
    case "Transportation":
      return "🚗";
    case "Investments":
      return "💹";
    case "Gifts":
      return "🎁";
    case "Housing & Utilities":
      return "🏠";
    case "Health":
      return "🩺";
    case "Entertainment":
      return "🎉";
    case "Personal Care":
      return "💅";
    case "Repairs":
      return "🛠️";
    case "Personal Spending":
      return "💸";
    // Transaction Tags
    case "Food":
      return "🍔";
    case "Drinks":
      return "🥤";
    case "Vacation":
      return "🏖️";
    case "Public Transport":
      return "🚆";
    case "Gas":
      return "⛽";
    case "Pharmacy":
      return "🏥";
    case "Games":
      return "🎮";
    case "Clothing":
      return "👗";
    case "Electronics":
      return "💻";
    case "Subscriptions":
      return "🔄";
    case "Miscellaneous":
      return "📦";
    default:
      return "🚫"; // Default icon for unknown categories
  }
}
