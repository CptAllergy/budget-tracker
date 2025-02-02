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
import {
  Firestore,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
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
  currentUser,
  setCurrentUser,
  secondUser,
  setSecondUser,
  db,
}: {
  transactions: TransactionDTO[];
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>;
  currentUser: UserDTO;
  setCurrentUser: Dispatch<SetStateAction<UserDTO>>;
  secondUser: UserDTO;
  setSecondUser: Dispatch<SetStateAction<UserDTO>>;
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
          } else {
            setLastDocument(undefined);
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
        } else {
          setFirstDocument(undefined);
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
        currentUser,
        setCurrentUser,
        secondUser,
        setSecondUser,
        transactions,
        setTransactions
      );
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "DELETE_FAILED");
      throw "Error deleting transaction";
    }
  };

  return (
    <div className="mx-1 mb-5 mt-5">
      {loading ? (
        // TODO could probably improve this loading animation
        <TransactionListNewPageLoading />
      ) : (
        <DataTable
          transactions={transactions}
          removeTransaction={removeTransaction}
          currentUser={currentUser}
          loading={loading}
        />
      )}
      <div className="mt-3 flex flex-row justify-between">
        <button
          className="rounded-md border-2 border-black bg-theme-main p-0.5 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors hover:bg-theme-hover hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          onClick={fetchPreviousPage}
        >
          <MdOutlineKeyboardArrowLeft size={25} />
        </button>
        <button
          className="rounded-md border-2 border-black bg-theme-main p-0.5 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors hover:bg-theme-hover hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          onClick={fetchNextPage}
        >
          <MdOutlineKeyboardArrowRight size={25} />
        </button>
      </div>
    </div>
  );
};

// TODO add alternative mobile stacked ui
const DataTable = ({
  transactions,
  removeTransaction,
  currentUser,
  loading,
}: {
  transactions: TransactionDTO[];
  removeTransaction: (transaction: TransactionDTO) => void;
  currentUser: UserDTO;
  loading: boolean;
}) => {
  const timestampToDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${day}/${month}/${year}`;
  };

  return (
    <div className="rounded-md border-2 border-black px-2 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
      <table className="table-auto">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
            <th>User</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.label}</td>
              <td>{Number(transaction.amount).toFixed(2)}€</td>
              <td>{timestampToDate(transaction.timestamp)}</td>
              <td>{transaction.username}</td>
              <td>
                {/*TODO add confirmation dialog to delete*/}
                {currentUser.id === transaction.userId && (
                  <button
                    className="ml-2 text-theme-main transition-colors hover:text-theme-hover"
                    onClick={() => removeTransaction(transaction)}
                  >
                    <MdDelete size={22} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
