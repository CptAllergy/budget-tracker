export type Transaction = {
  label: string;
  amount: number;
  userId: string;
};

export type UserTotalTransactions = {
  username: string;
  total: number;
};
