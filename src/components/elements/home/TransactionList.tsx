"use client";

import { TransactionDTO, UserDTO } from "@/types/DTO/dataTypes";
import { Dispatch, SetStateAction, useContext, useRef } from "react";
import { doc, Firestore, runTransaction } from "firebase/firestore";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";

const TransactionList = ({
  transactions,
  setTransactions,
  user1,
  setUser1,
  user2,
  setUser2,
  db,
}: {
  transactions: TransactionDTO[];
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>;
  user1: UserDTO;
  setUser1: Dispatch<SetStateAction<UserDTO>>;
  user2: UserDTO;
  setUser2: Dispatch<SetStateAction<UserDTO>>;
  db: Firestore;
}) => {
  const alertContext = useRef(useContext(AlertContext));

  const removeTransaction = async (transaction: TransactionDTO) => {
    // These Firestore operations must run inside an atomic transaction
    try {
      const userRef = doc(db, "users", transaction.userId);
      const transactionRef = doc(db, "transactions", transaction.id);

      const newUserTotal = await runTransaction(db, async (fbTransaction) => {
        const userDocumentDoc = await fbTransaction.get(userRef);
        if (!userDocumentDoc.exists()) {
          throw "Document does not exist!";
        }
        const userDocument = userDocumentDoc.data() as UserDTO;
        const newTotal = userDocument.total - Number(transaction.amount);

        // Decrease user total document by the deleted transaction
        fbTransaction.update(userRef, {
          total: newTotal,
        });
        // Delete transaction document
        fbTransaction.delete(transactionRef);

        return newTotal;
      });

      // Delete transaction and update list
      const filteredTransactions = transactions.filter(
        (value) => value.id != transaction.id
      );
      setTransactions(filteredTransactions);

      // Update the total for the correct user
      if (transaction.userId === user1.id) {
        setUser1((prevState) => {
          return {
            ...prevState,
            total: newUserTotal,
          };
        });
      } else if (transaction.userId === user2.id) {
        setUser2((prevState) => {
          return {
            ...prevState,
            total: newUserTotal,
          };
        });
      }
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "DELETE_FAILED");
    }
  };

  return (
    <div className="mt-3">
      <h2 className="mb-3 text-xl font-bold">Transactions</h2>
      {transactions.map((transaction, index) => (
        <div key={index}>
          <span className="font-bold">{transaction.label} - </span>
          <span>{Number(transaction.amount).toFixed(2)}€ - </span>
          <span>{transaction.username} - </span>
          <button
            className="rounded-md bg-theme-main px-0.5 text-white transition-colors hover:bg-slate-900"
            onClick={() => removeTransaction(transaction)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
