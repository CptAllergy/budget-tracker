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
import { Firestore } from "firebase/firestore";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";
import {
  deleteTransactionFirebase,
  fetchTransactionsFirebase,
  updateTransactionFirebase,
} from "@/services/firebaseService";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { TransactionListLoading } from "@/components/loading/elements/home/LoadingHome";
import { timestampToDate } from "@/utils/helpers/parsers";
import { TransactionContext } from "@/contexts/TransactionsContext";
import { HiMiniEllipsisHorizontal } from "react-icons/hi2";
import {
  DeleteDialog,
  EditDialog,
} from "@/components/commons/dialogs/ActionDialog";
import { DropdownMenu } from "@/components/commons/menus/DropdownMenu";

const TransactionList = ({
  currentUser,
  setCurrentUser,
  db,
}: {
  currentUser: UserDTO;
  setCurrentUser: Dispatch<SetStateAction<UserDTO>>;
  db: Firestore;
}) => {
  const alertContext = useRef(useContext(AlertContext));
  const transactionContext = useContext(TransactionContext);
  const setTransactionDocs = useRef(transactionContext.setTransactionDocs);

  const [monthYear, setMonthYear] = useState<{ month: number; year: number }>(
    () => {
      const currentDate = new Date();
      return { month: currentDate.getMonth(), year: currentDate.getFullYear() };
    }
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set transaction list
    fetchTransactionsFirebase(db, setTransactionDocs.current, monthYear).then(
      () => setLoading(false)
    );
  }, [db, monthYear]);

  const removeTransaction = async (transaction: TransactionDTO) => {
    try {
      await deleteTransactionFirebase(
        db,
        transaction,
        currentUser,
        setCurrentUser,
        setTransactionDocs.current
      );

      toggleStatusAlert(alertContext.current, "Transaction deleted");
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "DELETE_FAILED");
      throw "Error deleting transaction";
    }
  };

  const updateTransaction = async (transaction: TransactionDTO) => {
    try {
      await updateTransactionFirebase(
        db,
        transaction,
        currentUser,
        setCurrentUser,
        setTransactionDocs.current
      );

      toggleStatusAlert(alertContext.current, "Transaction updated");
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "UPDATE_FAILED");
      throw "Error updating transaction";
    }
  };

  const handleMonthYearChange = (isPrevious: boolean) => {
    if (isPrevious) {
      setMonthYear((prev) => ({
        month: prev.month === 0 ? 11 : prev.month - 1,
        year: prev.month === 0 ? prev.year - 1 : prev.year,
      }));
    } else {
      setMonthYear((prev) => ({
        month: prev.month === 11 ? 0 : prev.month + 1,
        year: prev.month === 11 ? prev.year + 1 : prev.year,
      }));
    }
  };

  return (
    <div className="mx-1 mt-5 mb-5">
      {loading ? (
        // TODO could probably improve this loading animation
        <TransactionListLoading />
      ) : (
        <>
          <NavigationOptions
            monthYear={monthYear}
            handleMonthYearChange={handleMonthYearChange}
          />
          <TransactionTable
            transactions={transactionContext.transactions}
            removeTransaction={removeTransaction}
            updateTransaction={updateTransaction}
            currentUser={currentUser}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

const TransactionTable = ({
  transactions,
  removeTransaction,
  updateTransaction,
  currentUser,
  loading,
}: {
  transactions: TransactionDTO[];
  removeTransaction: (transaction: TransactionDTO) => void;
  updateTransaction: (transaction: TransactionDTO) => void;
  currentUser: UserDTO;
  loading: boolean;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDTO>();

  const showDeleteDialog = (transaction: TransactionDTO) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };
  const showEditDialog = (transaction: TransactionDTO) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  // TODO divide into smaller components
  // TODO display category and tags. This will probably require an alternative layout for mobile
  return (
    <div className="">
      <DeleteDialog
        isDialogOpen={isDeleteDialogOpen}
        setIsDialogOpen={setIsDeleteDialogOpen}
        removeTransaction={removeTransaction}
        transaction={selectedTransaction}
      />
      <EditDialog
        isDialogOpen={isEditDialogOpen}
        setIsDialogOpen={setIsEditDialogOpen}
        updateTransaction={updateTransaction}
        transaction={selectedTransaction}
      />
      <div className="mx-auto flex max-w-6xl flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full px-3 py-2 align-middle">
            <div className="overflow-hidden rounded-md border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)]">
              <table className="w-full">
                <thead className="bg-theme-secondary border-b-2 border-black">
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
                      className="py-3.5 text-left text-sm font-semibold text-gray-900"
                    ></th>
                  </tr>
                </thead>
                <tbody className="bg-theme-highlight divide-y-2 divide-black">
                  {transactions.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-4 text-sm whitespace-nowrap text-gray-500"
                      >
                        No transactions found
                      </td>
                    </tr>
                  )}
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="w-full max-w-0 truncate py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
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
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                        {Number(transaction.amount).toFixed(2)}€
                      </td>
                      <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 sm:table-cell">
                        {timestampToDate(transaction.timestamp)}
                      </td>
                      <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 lg:table-cell">
                        {transaction.username}
                      </td>
                      <td className="relative py-4 pr-4 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                        {currentUser.id === transaction.userId && (
                          <>
                            <DropdownMenu
                              menuButton={
                                <div className="bg-theme-main hover:bg-theme-hover rounded-md border-2 border-black p-1 text-white transition-colors">
                                  <HiMiniEllipsisHorizontal size={20} />
                                </div>
                              }
                              menuItems={[
                                {
                                  icon: <></>,
                                  label: "Edit",
                                  onClick: () => {
                                    showEditDialog(transaction);
                                  },
                                },
                                {
                                  icon: <></>,
                                  label: "Delete",
                                  onClick: () => {
                                    showDeleteDialog(transaction);
                                  },
                                },
                              ]}
                            />
                          </>
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

const NavigationOptions = ({
  monthYear,
  handleMonthYearChange,
}: {
  monthYear: { month: number; year: number };
  handleMonthYearChange: (isPrevious: boolean) => void;
}) => {
  const { month, year } = monthYear;
  const date = new Date(year, month, 1);
  const monthString = date.toLocaleString("en-us", { month: "long" });

  return (
    <div>
      <div className="mx-auto flex max-w-6xl">
        <div className="min-w-full px-3 align-middle">
          <div className="bg-theme-highlight flex flex-row items-center justify-between overflow-hidden rounded-md border-2 border-black py-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <button
              className="bg-theme-main hover:bg-theme-hover mx-4 rounded-md border-2 border-black px-2 py-0.5 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              onClick={() => handleMonthYearChange(true)}
            >
              <MdOutlineKeyboardArrowLeft size={25} />
            </button>
            <p className="capitalize">
              {monthString} - {year}
            </p>
            <button
              className="bg-theme-main hover:bg-theme-hover mx-4 rounded-md border-2 border-black px-2 py-0.5 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              onClick={() => handleMonthYearChange(false)}
            >
              <MdOutlineKeyboardArrowRight size={25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
