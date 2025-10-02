"use client";

import { SummaryLoading } from "@/components/loading/elements/home/LoadingHome";
import { EarningDTO, ExpenseDTO, UserDTO } from "@/types/DTO/dataTypes";
import React, { useMemo } from "react";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { ExpenseListType, MonthYearType } from "@/types/componentTypes";
import "ldrs/react/Ring2.css";
import { Ring2 } from "ldrs/react";
import { useTransactions } from "@/utils/hooks/reactQueryUser";

type Props = {
  filterId?: ExpenseListType;
  monthYear: MonthYearType;
  currentUser?: UserDTO;
};

const ProfileSummary = ({ filterId, monthYear, currentUser }: Props) => {
  const { t } = useTranslate();

  const { transactions, isLoading, isFetching } = useTransactions(
    filterId,
    monthYear
  );

  if (isLoading) {
    return <SummaryLoading />;
  }

  if (!transactions) {
    return <SummaryLoading />;
  }

  return (
    <>
      <div className="bg-theme-secondary w-full max-w-4xl rounded-md border-2 border-black py-2 text-center font-medium shadow-[5px_5px_0px_rgba(0,0,0,1)]">
        <h3 className="mx-2 mb-2 flex justify-between text-base md:mx-4 md:text-xl">
          <span>{t("profile.monthSummary")}</span>
          <span>{currentUser?.name}</span>
        </h3>
        <SummaryContent
          expenses={transactions.expenses}
          earnings={transactions.earnings}
          isFetching={isFetching}
        />
      </div>
    </>
  );
};

const SummaryContent = ({
  expenses,
  earnings,
  isFetching,
}: {
  expenses: ExpenseDTO[];
  earnings: EarningDTO[];
  isFetching: boolean;
}) => {
  const { t } = useTranslate();

  const {
    totalEarnings,
    totalExpenses,
    investmentExpenses,
    netBalance,
    savingsRate,
  } = useMemo(() => {
    const totalEarnings = earnings.reduce(
      (total, earning) => total + earning.amount,
      0
    );
    const totalExpenses = expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    const investmentExpenses = expenses
      .filter((expense) => expense.category === "investments")
      .reduce((total, expense) => total + expense.amount, 0);

    const netBalance = totalEarnings - (totalExpenses - investmentExpenses);

    const savingsRate =
      totalEarnings > 0 ? (netBalance / totalEarnings) * 100 : 0;

    return {
      totalEarnings,
      totalExpenses,
      investmentExpenses,
      netBalance,
      savingsRate,
    };
  }, [earnings, expenses]);

  if (isFetching) {
    return (
      <div className="h-[6.75rem] sm:h-[3.25rem]">
        <Ring2
          size="30"
          stroke="5"
          strokeLength="0.25"
          bgOpacity="0.1"
          speed="0.9"
          color="black"
        />
      </div>
    );
  }

  return (
    <div className="mx-4 mt-3">
      <div className="w-full">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5">
          <div>
            <div className="flex justify-between">
              <span className="text-left">{t("profile.spent")}: </span>
              <span className="text-negative-dark text-right">
                -{Number(totalExpenses - investmentExpenses).toFixed(2)}€
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("profile.earned")}: </span>
              <span className="text-positive-dark">
                {totalEarnings.toFixed(2)}€
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <span>{t("profile.balance")}: </span>
              <span>
                <span
                  className={`${netBalance >= 0 ? "text-positive-dark" : "text-negative-dark"} underline underline-offset-3`}
                >
                  {netBalance >= 0 ? "+" : ""}
                  {netBalance.toFixed(2)}€
                </span>
                <span className="hidden text-sm md:inline">
                  {" "}
                  ({savingsRate.toFixed(2)}%)
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("profile.invested")}: </span>
              <span>{investmentExpenses.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummary;
