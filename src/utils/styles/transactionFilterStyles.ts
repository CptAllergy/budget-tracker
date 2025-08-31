import {
  EarningCategory,
  ExpenseCategory,
  ExpenseTag,
} from "@/types/transactionFilterTypes";

export function getCategoryIcon(
  transactionFilter?: ExpenseCategory | ExpenseTag | EarningCategory
): string {
  switch (transactionFilter) {
    // Transaction Categories
    case "other":
      return "❓";
    case "groceries":
      return "🛒";
    case "dining":
      return "🍽️";
    case "transportation":
      return "🚗";
    case "investments":
      return "💹";
    case "gifts":
      return "🎁";
    case "housingUtilities":
      return "🏠";
    case "homeGoods":
      return "🛋️";
    case "health":
      return "🩺";
    case "entertainment":
      return "🎉";
    case "personalCare":
      return "💅";
    case "repairs":
      return "🛠️";
    case "personalSpending":
      return "💸";
    // Transaction Tags
    case "food":
      return "🍔";
    case "drinks":
      return "🥤";
    case "vacation":
      return "🏖️";
    case "publicTransport":
      return "🚆";
    case "gas":
      return "⛽";
    case "pharmacy":
      return "🏥";
    case "games":
      return "🎮";
    case "clothing":
      return "👗";
    case "electronics":
      return "💻";
    case "subscriptions":
      return "🔄";
    // Earning Categories
    case "salary":
      return "💼";
    case "mealAllowance":
      return "🥪";
    case "investmentReturns":
      return "💰";
    case "refunds":
      return "↩️";
    case "bonuses":
      return "💎";
    default:
      return "🚫"; // Default icon for unknown categories
  }
}
