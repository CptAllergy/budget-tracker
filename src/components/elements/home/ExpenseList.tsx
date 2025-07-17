"use client";

import { ExpenseDTO, UserDTO } from "@/types/DTO/dataTypes";
import { useContext, useEffect, useRef, useState } from "react";
import { Firestore } from "firebase/firestore";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";
import {
  deleteExpenseFirebase,
  getExpensesFirebase,
  updateExpenseFirebase,
} from "@/services/firebaseService";
import { TransactionListLoading } from "@/components/loading/elements/home/LoadingHome";
import { timestampToDate } from "@/utils/validations";
import { ExpensesContext } from "@/contexts/ExpensesContext";
import { HiMiniEllipsisHorizontal } from "react-icons/hi2";
import { DropdownMenu } from "@/components/commons/menus/DropdownMenu";
import { ExpenseGroupsContext } from "@/contexts/ExpenseGroupsContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/commons/Accordion";
import { getCategoryIcon } from "@/utils/styles/transactionFilterStyles";
import { ExpenseTag } from "@/types/transactionFilterTypes";
import { DeleteDialog } from "@/components/commons/dialogs/DeleteDialog";
import { EditDialog } from "@/components/commons/dialogs/EditDialog";
import { useGetGroupName } from "@/utils/hooks";

const ExpenseList = ({
  currentUser,
  monthYear,
  db,
  isProfile,
}: {
  currentUser?: UserDTO;
  monthYear: { month: number; year: number };
  db: Firestore;
  isProfile?: boolean;
}) => {
  const alertContext = useRef(useContext(AlertContext));
  const expenseContext = useContext(ExpensesContext);
  const expenseGroupsContext = useContext(ExpenseGroupsContext);

  const setExpenseDocs = useRef(expenseContext.setExpenseDocs);
  const handleGroupChange = useRef(expenseGroupsContext.handleGroupChange);
  const filterId = expenseGroupsContext.filterId;

  useEffect(() => {
    // Set expense list
    if (filterId) {
      void getExpensesFirebase(db, setExpenseDocs.current, filterId, monthYear);
    }
  }, [db, filterId, monthYear]);

  const removeExpense = async (expense: ExpenseDTO) => {
    try {
      await deleteExpenseFirebase(
        db,
        expense,
        filterId!,
        currentUser!,
        handleGroupChange.current,
        setExpenseDocs.current
      );

      toggleStatusAlert(alertContext.current, "Expense deleted");
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "DELETE_FAILED", error);
      throw "Error deleting expense";
    }
  };

  const updateExpense = async (expense: ExpenseDTO) => {
    try {
      await updateExpenseFirebase(
        db,
        expense,
        filterId!,
        currentUser!,
        handleGroupChange.current,
        setExpenseDocs.current
      );

      toggleStatusAlert(alertContext.current, "Expense updated");
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "UPDATE_FAILED", error);
      throw "Error updating expense";
    }
  };

  return (
    <div>
      {expenseContext.expenses && currentUser ? (
        <ExpensesContent
          expenses={expenseContext.expenses}
          removeExpense={removeExpense}
          updateExpense={updateExpense}
          currentUser={currentUser}
          isProfile={isProfile}
        />
      ) : (
        <TransactionListLoading />
      )}
    </div>
  );
};

const ExpensesContent = ({
  expenses,
  removeExpense,
  updateExpense,
  currentUser,
  isProfile,
}: {
  expenses: ExpenseDTO[];
  removeExpense: (expense: ExpenseDTO) => void;
  updateExpense: (expense: ExpenseDTO) => void;
  currentUser: UserDTO;
  isProfile?: boolean;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [selectedExpense, setSelectedExpense] = useState<ExpenseDTO>();

  const showDeleteDialog = (expense: ExpenseDTO) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };
  const showEditDialog = (expense: ExpenseDTO) => {
    setSelectedExpense(expense);
    setIsEditDialogOpen(true);
  };

  return (
    <div>
      <DeleteDialog
        isDialogOpen={isDeleteDialogOpen}
        setIsDialogOpen={setIsDeleteDialogOpen}
        removeExpenseData={{ removeExpense, expense: selectedExpense }}
      />
      <EditDialog
        isDialogOpen={isEditDialogOpen}
        setIsDialogOpen={setIsEditDialogOpen}
        updateExpenseData={{ updateExpense, expense: selectedExpense }}
      />
      <div className="mx-auto flex max-w-6xl flex-col">
        <div className="inline-block min-w-full px-3 py-2 align-middle">
          <div className="hidden md:block">
            <ExpenseTable
              expenses={expenses}
              currentUser={currentUser}
              showDeleteDialog={showDeleteDialog}
              showEditDialog={showEditDialog}
              isProfile={isProfile}
            />
          </div>
          <div className="block md:hidden">
            <ExpenseCards
              expenses={expenses}
              currentUser={currentUser}
              showDeleteDialog={showDeleteDialog}
              showEditDialog={showEditDialog}
              isProfile={isProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpenseTable = ({
  expenses,
  currentUser,
  showDeleteDialog,
  showEditDialog,
  isProfile,
}: {
  expenses: ExpenseDTO[];
  currentUser: UserDTO;
  showDeleteDialog: (expense: ExpenseDTO) => void;
  showEditDialog: (expense: ExpenseDTO) => void;
  isProfile?: boolean;
}) => {
  const { getGroupName } = useGetGroupName();

  return (
    <div className="overflow-hidden rounded-md border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)]">
      <table className="w-full">
        <thead className="bg-theme-secondary border-b-2 border-black">
          <tr>
            <th
              scope="col"
              className="py-3.5 pr-3 pl-6 text-left text-sm font-semibold text-gray-900"
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
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Category
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Tags
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
              {isProfile ? "Group" : "User"}
            </th>
            <th
              scope="col"
              className="py-3.5 text-left text-sm font-semibold text-gray-900"
            ></th>
          </tr>
        </thead>
        <tbody className="bg-theme-highlight divide-y-2 divide-black">
          {expenses.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-3 py-4 text-sm whitespace-nowrap text-gray-500"
              >
                No expenses found
              </td>
            </tr>
          )}
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td className="w-full max-w-0 truncate py-4 pr-3 pl-6 text-sm font-medium whitespace-nowrap text-gray-900">
                {expense.label}
                <dl className="font-normal lg:hidden">
                  <dt className="mt-1 truncate text-gray-700 sm:hidden">
                    {timestampToDate(expense.timestamp)}
                  </dt>
                  <dt className="mt-1 truncate text-gray-500 sm:text-gray-700">
                    {expense.username}
                  </dt>
                </dl>
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                {Number(expense.amount).toFixed(2)}€
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                <div className="flex gap-1">
                  <div> {getCategoryIcon(expense.category)}</div>
                  <div> {expense.category}</div>
                </div>
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                <TagList tags={expense.tags} limit={3} />
              </td>
              <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 sm:table-cell">
                {timestampToDate(expense.timestamp)}
              </td>
              <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 lg:table-cell">
                {isProfile ? getGroupName(expense.groupId) : expense.username}
              </td>
              <td className="relative py-4 pr-4 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                <ExpenseDropdownMenu
                  selectedExpense={expense}
                  currentUser={currentUser}
                  showDeleteDialog={showDeleteDialog}
                  showEditDialog={showEditDialog}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ExpenseCards = ({
  expenses,
  currentUser,
  showDeleteDialog,
  showEditDialog,
  isProfile,
}: {
  expenses: ExpenseDTO[];
  currentUser: UserDTO;
  showDeleteDialog: (expense: ExpenseDTO) => void;
  showEditDialog: (expense: ExpenseDTO) => void;
  isProfile?: boolean;
}) => {
  const { getGroupName } = useGetGroupName();

  return (
    <div>
      {expenses.length === 0 && (
        <div>
          <div className="bg-theme-highlight mt-3 rounded-md border-2 border-black px-3 py-4 text-sm whitespace-nowrap text-gray-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            No expenses found
          </div>
        </div>
      )}
      <Accordion type="single" collapsible className="mt-3 space-y-2 pb-6">
        {expenses.map((expense) => (
          <AccordionItem
            value={expense.id}
            key={expense.id}
            className="bg-theme-highlight rounded-md border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          >
            <AccordionTrigger className="flex w-full gap-2 px-2">
              <div className="flex-1 space-x-1 truncate text-left text-sm font-medium whitespace-nowrap">
                <span className="align-baseline text-lg leading-none">
                  {getCategoryIcon(expense.category)}
                </span>
                <span className="align-baseline text-gray-900">
                  {expense.label}
                </span>
              </div>
              <span className="text-sm whitespace-nowrap text-gray-500/50">
                {Number(expense.amount).toFixed(2)}€
              </span>
            </AccordionTrigger>
            <AccordionContent className="bg-theme-secondary rounded-b-md border-t-2 border-black px-2.5 py-1">
              <div className="flex justify-between">
                <div>
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    Category
                  </dt>
                  <dd className="mb-2 font-semibold text-black/70">
                    {expense.category}
                  </dd>
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    Tags
                  </dt>
                  <dd className="mb-2 font-semibold text-black/70">
                    <TagList tags={expense.tags} />
                  </dd>
                </div>
                <dl className="text-right">
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    Date
                  </dt>
                  <dd className="mb-2 font-semibold text-black/70">
                    {timestampToDate(expense.timestamp)}
                  </dd>
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    {isProfile ? "Group" : "User"}
                  </dt>
                  <dd className="mb-2 font-semibold text-black/70">
                    {isProfile
                      ? getGroupName(expense.groupId)
                      : expense.username}
                  </dd>
                </dl>
              </div>
              <div className="text-right">
                <ExpenseDropdownMenu
                  selectedExpense={expense}
                  currentUser={currentUser}
                  showDeleteDialog={showDeleteDialog}
                  showEditDialog={showEditDialog}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const TagList = ({ tags, limit }: { tags?: ExpenseTag[]; limit?: number }) => {
  return (
    <div>
      {tags &&
        tags.map((tag, index) => (
          <div key={index} className="inline-flex">
            {(!limit || index < limit) && (
              <span className="mr-1 mb-1 inline-flex items-center rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                {tag}
              </span>
            )}
          </div>
        ))}
      {/*TODO on hover of the more tag, display all of the remaining tags*/}
      {tags && limit && tags.length > limit && (
        <span className="rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-500">
          +{tags.length - limit} more
        </span>
      )}
    </div>
  );
};

const ExpenseDropdownMenu = ({
  selectedExpense,
  currentUser,
  showDeleteDialog,
  showEditDialog,
}: {
  selectedExpense: ExpenseDTO;
  currentUser: UserDTO;
  showDeleteDialog: (expense: ExpenseDTO) => void;
  showEditDialog: (expense: ExpenseDTO) => void;
}) => {
  return (
    <div>
      {currentUser.id === selectedExpense.userId && (
        <DropdownMenu
          menuButton={
            <div className="bg-theme-main hover:bg-theme-hover inline-flex rounded-md border-2 border-black px-3 py-0.5 text-white transition-colors md:px-1 md:py-1">
              <HiMiniEllipsisHorizontal size={20} />
            </div>
          }
          menuItems={[
            {
              icon: <></>,
              label: "Edit",
              onClick: () => {
                showEditDialog(selectedExpense);
              },
            },
            {
              icon: <></>,
              label: "Delete",
              onClick: () => {
                showDeleteDialog(selectedExpense);
              },
            },
          ]}
        />
      )}
    </div>
  );
};

export default ExpenseList;
