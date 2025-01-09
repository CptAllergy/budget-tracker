import { Timestamp } from "firebase/firestore";

export type TransactionDTO = {
  id: string;
  label: string;
  amount: number;
  userId: string;
  username: string;
  timestamp: Timestamp;
};

export type CreateTransactionDTO = {
  label: string;
  amount: number;
  userId: string;
  username: string;
  timestamp: Timestamp;
};

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  total: number;
};
