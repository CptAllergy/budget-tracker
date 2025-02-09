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
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
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
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { timestampToDate } from "@/utils/helpers/parsers";

const TransactionList = ({
  transactions,
  setTransactions,
  currentUser,
  setCurrentUser,
  db,
}: {
  transactions: TransactionDTO[];
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>;
  currentUser: UserDTO;
  setCurrentUser: Dispatch<SetStateAction<UserDTO>>;
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
  }, [db, setTransactions]);

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
        transactions,
        setTransactions
      );

      toggleStatusAlert(alertContext.current, "Transaction deleted");
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
        <TransactionTable
          transactions={transactions}
          removeTransaction={removeTransaction}
          currentUser={currentUser}
          loading={loading}
        />
      )}
      <div className="mx-auto mt-2 flex max-w-6xl flex-row justify-between">
        <button
          className="mx-2 rounded-md border-2 border-black bg-theme-main px-2 py-0.5 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors hover:bg-theme-hover hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          onClick={fetchPreviousPage}
        >
          <MdOutlineKeyboardArrowLeft size={25} />
        </button>
        <button
          className="mx-2 rounded-md border-2 border-black bg-theme-main px-2 py-0.5 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors hover:bg-theme-hover hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          onClick={fetchNextPage}
        >
          <MdOutlineKeyboardArrowRight size={25} />
        </button>
      </div>
    </div>
  );
};

const TransactionTable = ({
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletedTransaction, setDeletedTransaction] =
    useState<TransactionDTO>();

  const showDeleteDialog = (transaction: TransactionDTO) => {
    setDeletedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="">
      <DeleteDialog
        isDialogOpen={isDeleteDialogOpen}
        setIsDialogOpen={setIsDeleteDialogOpen}
        removeTransaction={removeTransaction}
        transaction={deletedTransaction}
      />
      <div className="mx-auto flex max-w-6xl flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full px-3 py-2 align-middle">
            <div className="overflow-hidden shadow-[7px_7px_0px_rgba(0,0,0,1)] ring-4 ring-black">
              <table className="w-full divide-y-4 divide-black">
                <thead className="bg-theme-secondary">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    ></th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black bg-theme-highlight">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="w-full max-w-0 truncate whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                        {transaction.label}
                        <dl className="font-normal lg:hidden">
                          <dt className="mt-1 truncate text-gray-700 sm:hidden">
                            {timestampToDate(transaction.timestamp)}
                          </dt>
                          <dt className="mt-1 truncate text-gray-500 sm:text-gray-700">
                            {transaction.username}
                          </dt>
                        </dl>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {Number(transaction.amount).toFixed(2)}€
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell">
                        {timestampToDate(transaction.timestamp)}
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell">
                        {transaction.username}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {currentUser.id === transaction.userId && (
                          <button
                            className="text-theme-main transition-colors hover:text-theme-hover"
                            onClick={() => showDeleteDialog(transaction)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  removeTransaction,
  transaction,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  removeTransaction: (transaction: TransactionDTO) => void;
  transaction: TransactionDTO | undefined;
}) => {
  const deleteTransaction = () => {
    if (transaction) {
      removeTransaction(transaction);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      as="div"
      className="z-30 focus:outline-none"
      onClose={() => setIsDialogOpen(false)}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 z-10 bg-black/80 duration-300 data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-md border-2 border-black bg-theme-secondary p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] duration-200 data-[closed]:opacity-0"
          >
            <DialogTitle as="h3" className="text-lg font-bold">
              Delete Transaction
            </DialogTitle>
            {transaction && (
              <p className="mt-4 text-sm font-medium">
                {transaction.label} | {Number(transaction.amount).toFixed(2)}€ |{" "}
                {timestampToDate(transaction.timestamp)}
              </p>
            )}
            <p className="mt-2 text-sm font-medium">
              Are you sure you want to delete this transaction?
            </p>
            <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                className="rounded-md border-2 border-black bg-white px-4 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,1)] transition hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] focus:outline-none"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-md border-2 border-black bg-theme-main px-4 py-2 text-sm font-semibold text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition hover:bg-theme-hover hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] focus:outline-none"
                onClick={deleteTransaction}
              >
                Delete
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default TransactionList;
