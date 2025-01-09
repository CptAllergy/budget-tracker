import { Timestamp } from "firebase/firestore";

export type TransactionDTO = {
  label: string;
  amount: number;
  username: string;
  timestamp: Timestamp;
};

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  total: number;
};
