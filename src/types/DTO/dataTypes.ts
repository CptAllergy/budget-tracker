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
  username: string;
  timestamp: Timestamp;
  category?: TransactionCategory;
  tags?: TransactionTag[];
};

export type CreateTransactionDTO = {
  label: string;
  amount: number;
  userId: string;
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
  total: number;
};
