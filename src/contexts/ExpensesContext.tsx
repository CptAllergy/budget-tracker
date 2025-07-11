"use client";

import React, { createContext, useState } from "react";
import { ExpenseDTO } from "@/types/DTO/dataTypes";
import { DocumentSnapshot } from "firebase/firestore";

export type ExpenseContextType = {
  expenses: ExpenseDTO[];
  currentPageDocs: DocumentSnapshot[];
  setExpenseDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void;
};

export const ExpensesContext = createContext<ExpenseContextType>({
  expenses: [],
  currentPageDocs: [],
  setExpenseDocs: () => {},
});

type ProviderProps = {
  children?: React.ReactNode;
};

export const ExpensesContextProvider = ({ children }: ProviderProps) => {
  const { expenses, currentPageDocs, setExpenseDocs } = useExpensesState();

  const contextValue = {
    expenses,
    currentPageDocs,
    setExpenseDocs,
  };

  return (
    <ExpensesContext.Provider value={contextValue}>
      {children}
    </ExpensesContext.Provider>
  );
};

const useExpensesState = () => {
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [currentPageDocs, setCurrentPageDocs] = useState<DocumentSnapshot[]>(
    []
  );

  const setExpenseDocs = (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => {
    setCurrentPageDocs((prevDocs) => {
      const newDocs = updater(prevDocs);
      const newExpenses = newDocs.map((doc) => {
        return { id: doc.id, ...doc.data() } as ExpenseDTO;
      });
      setExpenses(newExpenses);
      return newDocs;
    });
  };

  return { expenses, currentPageDocs, setExpenseDocs };
};
