import { Timestamp } from "firebase/firestore";
import {
  EarningCategory,
  ExpenseCategory,
  ExpenseTag,
} from "@/types/transactionFilterTypes";

export type ExpenseDTO = {
  id: string;
  label: string;
  amount: number;
  userId: string;
  groupId: string | null;
  username: string;
  timestamp: Timestamp;
  category?: ExpenseCategory;
  tags?: ExpenseTag[];
};

export type CreateExpenseDTO = {
  label: string;
  amount: number;
  userId: string;
  groupId: string | null;
  username: string;
  timestamp: Timestamp;
  category: ExpenseCategory;
  tags: ExpenseTag[];
  newDate?: Date;
};

export type UserDTO = {
  id: string;
  defaultPage?: string;
  name: string;
};

export type UserTotalDTO = {
  id: string;
  name: string;
  total: number;
};

export type ExpenseGroupDTO = {
  id: string;
  name: string;
  members: string[];
  totals: UserTotalDTO[];
};

export type EarningDTO = {
  id: string;
  label: string;
  amount: number;
  userId: string;
  timestamp: Timestamp;
  category: EarningCategory;
};

export type CreateEarningDTO = {
  label: string;
  amount: number;
  userId: string;
  timestamp: Timestamp;
  category: EarningCategory;
  newDate?: Date;
};

export const NO_EXPENSE_GROUP = "Profile";
