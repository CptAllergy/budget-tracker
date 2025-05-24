import { Timestamp } from "firebase/firestore";
import {
  TransactionCategory,
  TransactionTag,
} from "@/types/transactionFilterTypes";

export type TransactionDTO = {
  id: string;
  label: string;
  amount: number;
  userId: string;
  groupId: string | null;
  username: string;
  timestamp: Timestamp;
  category?: TransactionCategory;
  tags?: TransactionTag[];
};

export type CreateTransactionDTO = {
  label: string;
  amount: number;
  userId: string;
  groupId: string | null;
  username: string;
  timestamp: Timestamp;
  category: TransactionCategory;
  tags: TransactionTag[];
  newDate?: Date;
};

export type UserDTO = {
  id: string;
  groupId: string;
  name: string;
  email: string;
};

export type UserTotalDTO = {
  id: string;
  name: string;
  total: number;
};

export type TransactionGroupDTO = {
  id: string;
  name: string;
  members: string[];
  totals: UserTotalDTO[];
};
