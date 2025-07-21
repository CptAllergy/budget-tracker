"use client";

import { rancho } from "@/styles/fonts";
import { TotalsLoading } from "@/components/loading/elements/home/LoadingHome";
import { EarningDTO, ExpenseDTO, UserDTO } from "@/types/DTO/dataTypes";
import { useMemo } from "react";

const ProfileSummary = ({
  currentUser,
  expenses,
  earnings,
}: {
  currentUser?: UserDTO;
  expenses: ExpenseDTO[];
  earnings: EarningDTO[];
}) => {
  const totalEarnings = useMemo(() => {
    return earnings.reduce((total, earning) => total + earning.amount, 0);
  }, [earnings]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  const investmentExpenses = useMemo(() => {
    return expenses
      .filter((expense) => expense.category === "Investments")
      .reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  const netBalance = useMemo(() => {
    return totalEarnings - (totalExpenses - investmentExpenses);
  }, [totalEarnings, totalExpenses, investmentExpenses]);

  const savingsRate = useMemo(() => {
    if (totalEarnings <= 0) return 0;
    return (netBalance / totalEarnings) * 100;
  }, [totalEarnings, netBalance]);

  return (
    <>
      {currentUser ? (
        <div
          className={`${rancho.className} bg-theme-secondary w-full max-w-4xl rounded-md border-2 border-black py-2 text-center text-2xl shadow-[5px_5px_0px_rgba(0,0,0,1)] md:text-2xl`}
        >
          <h3 className="mx-2 mb-2 flex justify-between text-xl md:mx-4 md:text-3xl">
            <span>Month Summary</span>
            <span>{currentUser?.name}</span>
          </h3>
          <div className="mx-4 mt-3 sm:flex sm:items-center sm:justify-center">
            <div className="w-fit text-left">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <div>
                    <span>Spent: </span>
                    <span className="text-negative-dark">
                      -{Number(totalExpenses - investmentExpenses).toFixed(2)}€
                    </span>
                  </div>
                  <div>
                    <span>Earned: </span>
                    <span className="text-positive-dark">
                      +{totalEarnings.toFixed(2)}€
                    </span>
                  </div>
                </div>
                <div>
                  <div>
                    <span>Net Balance: </span>
                    <span
                      className={`${netBalance >= 0 ? "text-positive-dark" : "text-negative-dark"} underline underline-offset-3`}
                    >
                      {netBalance >= 0 ? "+" : "-"}
                      {netBalance.toFixed(2)}€
                    </span>
                    <span className="hidden md:inline">
                      {" "}
                      ({savingsRate.toFixed(2)}%)
                    </span>
                  </div>
                  {investmentExpenses > 0 && (
                    <div>
                      <span>Invested: </span>
                      <span>{investmentExpenses.toFixed(2)}€</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <TotalsLoading />
      )}
    </>
  );
};

export default ProfileSummary;
