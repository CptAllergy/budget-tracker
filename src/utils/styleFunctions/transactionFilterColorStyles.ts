import {
  TransactionCategory,
  TransactionTag,
} from "@/types/transactionFilterTypes";

export function getTransactionFilterColor(
  transactionFilter: TransactionCategory | TransactionTag
): string {
  switch (transactionFilter) {
    case "Food":
      return "bg-green-500";
    case "Transport":
      return "bg-blue-500";
    case "Entertainment":
      return "bg-yellow-500";
    case "Health":
      return "bg-red-500";
    case "Shopping":
      return "bg-purple-500";
    case "Other":
      return "bg-gray-500";
    case "Groceries":
      return "bg-green-300";
    case "Dining Out":
      return "bg-green-400";
    case "Public Transport":
      return "bg-blue-300";
    case "Taxi":
      return "bg-blue-400";
    case "Movies":
      return "bg-yellow-300";
    case "Concerts":
      return "bg-yellow-400";
    case "Gym":
      return "bg-red-300";
    case "Doctor":
      return "bg-red-400";
    case "Pharmacy":
      return "bg-red-500";
    case "Clothing":
      return "bg-purple-300";
    case "Electronics":
      return "bg-purple-400";
    case "Miscellaneous":
      return "bg-gray-300";
    default:
      return "bg-gray-200";
  }
}
