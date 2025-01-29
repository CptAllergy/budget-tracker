"use client";

import { TransactionDTO, UserDTO } from "@/types/DTO/dataTypes";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Firestore, QueryDocumentSnapshot } from "firebase/firestore";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";
import {
  deleteTransactionFirebase,
  fetchPreviousTransactionsFirebase,
  fetchTransactionsFirebase,
} from "@/services/firebaseService";
import {
  MdDelete,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { TransactionListNewPageLoading } from "@/components/loading/elements/home/LoadingHome";

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

  const [loading, setLoading] = useState(true);
  const [lastDocument, setLastDocument] = useState<QueryDocumentSnapshot>();
  const [firstDocument, setFirstDocument] = useState<QueryDocumentSnapshot>();

  useEffect(() => {
    // Set transaction list
    fetchTransactionsFirebase(db, setTransactions).then(([_, lastDoc]) => {
      setLastDocument(lastDoc);
    });
    setLoading(false);
  }, []);

  const fetchNextPage = async () => {
    if (lastDocument) {
      setLoading(true);
      fetchTransactionsFirebase(db, setTransactions, lastDocument).then(
        ([firstDoc, lastDoc]) => {
          if (firstDoc !== undefined && lastDoc !== undefined) {
            setFirstDocument(firstDoc);
            setLastDocument(lastDoc);
          }
          setLoading(false);
        }
      );
    }
  };

  const fetchPreviousPage = async () => {
    if (firstDocument) {
      setLoading(true);
      fetchPreviousTransactionsFirebase(
        db,
        setTransactions,
        firstDocument
      ).then(([firstDoc, lastDoc]) => {
        if (firstDoc !== undefined && lastDoc !== undefined) {
          setFirstDocument(firstDoc);
          setLastDocument(lastDoc);
        }
        setLoading(false);
      });
    }
  };

  const removeTransaction = async (transaction: TransactionDTO) => {
    try {
      await deleteTransactionFirebase(
        db,
        transaction,
        user1,
        setUser1,
        user2,
        setUser2,
        transactions,
        setTransactions
      );
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "DELETE_FAILED");
      throw "Error deleting transaction";
    }
  };

  return (
    <div className="mt-3">
      <h2 className="mb-3 text-xl font-bold">Transactions</h2>
      <div className="space-y-1 rounded-md border-2 border-black p-4 ring-2 ring-black">
        {loading ? (
          // TODO could probably improve this loading animation
          <TransactionListNewPageLoading />
        ) : (
          transactions.map((transaction, index) => (
            <div key={index}>
              <span className="font-bold">{transaction.label} - </span>
              <span>{Number(transaction.amount).toFixed(2)}€ - </span>
              <span>{transaction.username}</span>
              <button
                className="ml-3 rounded-full bg-theme-main p-0.5 text-white transition-colors hover:bg-slate-900"
                onClick={() => removeTransaction(transaction)}
              >
                <MdDelete size={20} />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mt-3 flex flex-row justify-between">
        <button
          className="rounded-full bg-theme-main p-0.5 text-white transition-colors hover:bg-slate-900"
          onClick={fetchPreviousPage}
        >
          <MdOutlineKeyboardArrowLeft size={25} />
        </button>
        <button
          className="rounded-full bg-theme-main p-0.5 text-white transition-colors hover:bg-slate-900"
          onClick={fetchNextPage}
        >
          <MdOutlineKeyboardArrowRight size={25} />
        </button>
      </div>
    </div>
  );
};

export default TransactionList;
