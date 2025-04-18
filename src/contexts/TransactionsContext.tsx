"use client";

import React, { createContext, useState } from "react";
import { TransactionDTO } from "@/types/DTO/dataTypes";
import { DocumentSnapshot } from "firebase/firestore";

export type TransactionContextType = {
  transactions: TransactionDTO[];
  currentPageDocs: DocumentSnapshot[];
  setTransactionDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void;
};

export const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  currentPageDocs: [],
  setTransactionDocs: () => {},
});

type ProviderProps = {
  children?: React.ReactNode;
};

export const TransactionContextProvider = ({ children }: ProviderProps) => {
  const { transactions, currentPageDocs, setTransactionDocs } =
    useTransactionState();

  const contextValue = {
    transactions,
    currentPageDocs,
    setTransactionDocs,
  };

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
};

const useTransactionState = () => {
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [currentPageDocs, setCurrentPageDocs] = useState<DocumentSnapshot[]>(
    []
  );

  const setTransactionDocs = (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => {
    setCurrentPageDocs((prevDocs) => {
      const newDocs = updater(prevDocs);
      const newTransactions = newDocs.map((doc) => {
        return { id: doc.id, ...doc.data() } as TransactionDTO;
      });
      setTransactions(newTransactions);
      return newDocs;
    });
  };

  return { transactions, currentPageDocs, setTransactionDocs };
};
