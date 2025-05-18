import {
  TransactionCategory,
  TransactionTag,
} from "@/types/transactionFilterTypes";

// TODO will I use this?
export function getTransactionFilterColor(
  transactionFilter: TransactionCategory | TransactionTag
): string {
  switch (transactionFilter) {
    case "Food":
      return "bg-green-500";
    default:
      return "bg-gray-200";
  }
}
