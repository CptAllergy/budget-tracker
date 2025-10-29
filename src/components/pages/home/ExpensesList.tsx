"use client";

import { ExpenseDTO, UserDTO } from "@/types/DTO/dataTypes";
import React, { useContext, useEffect, useState } from "react";
import { TransactionListLoading } from "@/components/loading/elements/home/LoadingHome";
import { timestampToDate } from "@/utils/validations";
import { HiMiniEllipsisHorizontal } from "react-icons/hi2";
import { DropdownMenu } from "@/components/commons/menus/DropdownMenu";
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
import { getExpenseGroupName } from "@/utils/utils";
import {
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from "@/utils/hooks/reactQueryExpenses";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { ExpenseListType, MonthYearType } from "@/types/componentTypes";
import { SettingsContext } from "@/contexts/SettingsContext";
import { useExpenseGroups } from "@/utils/hooks/reactQueryGroups";

type Props = {
  filterId?: ExpenseListType;
  monthYear: MonthYearType;
  currentUser?: UserDTO;
  isProfile?: boolean;
};

const ExpensesList = ({
  filterId,
  monthYear,
  currentUser,
  isProfile,
}: Props) => {
  const { expenses, isLoading } = useExpenses(filterId, monthYear, true);

  const { mutateDeleteExpense } = useDeleteExpense();
  const { mutateUpdateExpense } = useUpdateExpense();

  const removeExpense = async (expense: ExpenseDTO) => {
    mutateDeleteExpense({ expense });
  };

  const updateExpense = async (expense: ExpenseDTO) => {
    mutateUpdateExpense({ expense });
  };

  if (isLoading || !currentUser) {
    return <TransactionListLoading />;
  }

  // Fallback check
  if (!expenses) {
    return <TransactionListLoading />;
  }

  return (
    <ExpensesContent
      expenses={expenses}
      removeExpense={removeExpense}
      updateExpense={updateExpense}
      currentUser={currentUser}
      isProfile={isProfile}
    />
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
              isEditable={true}
              isProfile={isProfile}
            />
          </div>
          <div className="block md:hidden">
            <ExpenseCards
              expenses={expenses}
              currentUser={currentUser}
              showDeleteDialog={showDeleteDialog}
              showEditDialog={showEditDialog}
              isEditable={true}
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
  isEditable,
  isProfile,
}: {
  expenses: ExpenseDTO[];
  currentUser: UserDTO;
  showDeleteDialog: (expense: ExpenseDTO) => void;
  showEditDialog: (expense: ExpenseDTO) => void;
  isEditable: boolean;
  isProfile?: boolean;
}) => {
  const { t } = useTranslate();
  const { isExpenseColorEnabled } = useContext(SettingsContext);
  const { expenseGroups } = useExpenseGroups(currentUser);
  const getGroupName = getExpenseGroupName(expenseGroups, t("navbar.profile"));

  return (
    <div className="overflow-hidden rounded-md border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)]">
      <table className="w-full">
        <thead className="bg-theme-secondary border-b-2 border-black">
          <tr>
            <th
              scope="col"
              className="py-3.5 pr-3 pl-6 text-left text-sm font-semibold text-gray-900"
            >
              {t("form.description")}
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              {t("form.amount")}
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              {t("form.category")}
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              {t("form.tags")}
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
            >
              {t("form.date")}
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
            >
              {isProfile ? t("form.group") : t("form.user")}
            </th>
            {isEditable && (
              <th
                scope="col"
                className="relative py-3.5 text-left text-sm font-semibold text-gray-900"
              ></th>
            )}
          </tr>
        </thead>
        <tbody className="bg-theme-highlight divide-y-2 divide-black">
          {expenses.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-3 py-4 text-sm whitespace-nowrap text-gray-500"
              >
                {t("expenses.table.noExpenses")}
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
              <td
                className={`${isExpenseColorEnabled ? "text-negative-light/80" : "text-gray-500"} px-3 py-4 text-sm font-medium whitespace-nowrap`}
              >
                {isExpenseColorEnabled && "-"}
                {Number(expense.amount).toFixed(2)}€
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                <div className="flex gap-1">
                  <div> {getCategoryIcon(expense.category)}</div>
                  <div>{t(`expenses.categories.${expense.category}`)}</div>
                </div>
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                {expense.tags && <TagList tags={expense.tags} limit={3} />}
              </td>
              <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 sm:table-cell">
                {timestampToDate(expense.timestamp)}
              </td>
              <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 lg:table-cell">
                {isProfile ? getGroupName(expense.groupId) : expense.username}
              </td>
              {isEditable && (
                <td className="relative py-4 pr-4 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                  <ExpenseDropdownMenu
                    selectedExpense={expense}
                    currentUser={currentUser}
                    showDeleteDialog={showDeleteDialog}
                    showEditDialog={showEditDialog}
                  />
                </td>
              )}
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
  isEditable,
  isProfile,
}: {
  expenses: ExpenseDTO[];
  currentUser: UserDTO;
  showDeleteDialog: (expense: ExpenseDTO) => void;
  showEditDialog: (expense: ExpenseDTO) => void;
  isEditable: boolean;
  isProfile?: boolean;
}) => {
  const { t } = useTranslate();
  const { isExpenseColorEnabled } = useContext(SettingsContext);
  const { expenseGroups } = useExpenseGroups(currentUser);
  const getGroupName = getExpenseGroupName(expenseGroups, t("navbar.profile"));

  return (
    <div>
      {expenses.length === 0 && (
        <div>
          <div className="bg-theme-highlight mt-3 rounded-md border-2 border-black px-3 py-4 text-sm whitespace-nowrap text-gray-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            {t("expenses.table.noExpenses")}
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
              <span
                className={`${isExpenseColorEnabled ? "text-negative-light/65" : "text-gray-500/50"} text-sm whitespace-nowrap`}
              >
                {isExpenseColorEnabled && "-"}
                {Number(expense.amount).toFixed(2)}€
              </span>
            </AccordionTrigger>
            <AccordionContent className="bg-theme-secondary rounded-b-md border-t-2 border-black px-2.5 py-1">
              <div className="flex justify-between">
                <div>
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    {t("form.category")}
                  </dt>
                  <dd className="mb-2 font-semibold text-black/70">
                    {t(`expenses.categories.${expense.category}`)}
                  </dd>
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    {t("form.tags")}
                  </dt>
                  <dd className="mb-2 font-semibold text-black/70">
                    {expense.tags && <TagList tags={expense.tags} />}
                  </dd>
                </div>
                <dl className="text-right">
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    {t("form.date")}
                  </dt>
                  <dd className="mb-2 font-semibold text-black/70">
                    {timestampToDate(expense.timestamp)}
                  </dd>
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    {isProfile ? t("form.group") : t("form.user")}
                  </dt>
                  <dd className="mb-2 font-semibold text-black/70">
                    {isProfile
                      ? getGroupName(expense.groupId)
                      : expense.username}
                  </dd>
                </dl>
              </div>
              {isEditable && (
                <div className="text-right">
                  <ExpenseDropdownMenu
                    selectedExpense={expense}
                    currentUser={currentUser}
                    showDeleteDialog={showDeleteDialog}
                    showEditDialog={showEditDialog}
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const TagList = ({ tags, limit }: { tags: ExpenseTag[]; limit?: number }) => {
  const { t } = useTranslate();
  const [visibleCount, setVisibleCount] = useState<number | undefined>(limit);

  useEffect(() => {
    if (!limit) {
      return;
    }

    function handleResize() {
      const width = window.innerWidth;
      if (width < 1024) {
        setVisibleCount(1);
      } else if (width < 1280) {
        setVisibleCount(2);
      } else if (width < 1536) {
        setVisibleCount(limit);
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [limit]);

  return (
    <div>
      {tags.map((tag, index) => (
        <div key={index} className="inline-flex">
          {(!visibleCount || index < visibleCount) && (
            <span className="mr-1 mb-1 inline-flex items-center rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
              {t(`expenses.tags.${tag}`)}
            </span>
          )}
        </div>
      ))}
      {visibleCount && tags.length > visibleCount && (
        <div className="group relative inline-flex">
          <span className="rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-500">
            +{tags.length - visibleCount} more
          </span>
          <div className="pointer-events-none absolute top-full left-0 z-10 mt-1 flex flex-col rounded-md border bg-white p-2 opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
            {tags.slice(visibleCount).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium whitespace-nowrap text-gray-500"
              >
                {t(`expenses.tags.${tag}`)}
              </span>
            ))}
          </div>
        </div>
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
  const { t } = useTranslate();
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
              label: t("actions.edit"),
              onClick: () => {
                showEditDialog(selectedExpense);
              },
            },
            {
              icon: <></>,
              label: t("actions.delete"),
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

export { ExpenseTable, ExpenseCards };
export default ExpensesList;
