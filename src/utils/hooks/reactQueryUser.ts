import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  getCurrentUserFirebase,
  updateUserDefaultPageFirebase,
} from "@/services/firebaseService";
import { EarningDTO, ExpenseDTO, UserDTO } from "@/types/DTO/dataTypes";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/utils/hooks/useUser";
import {
  ExpenseListType,
  MonthlyEarningTotal,
  MonthlyExpenseTotal,
  MonthYearType,
} from "@/types/componentTypes";
import {
  useEarnings,
  useMonthlyEarningTotal,
} from "@/utils/hooks/reactQueryEarnings";
import {
  useExpenses,
  useMonthlyExpenseTotal,
} from "@/utils/hooks/reactQueryExpenses";
import { useTranslate } from "@/utils/hooks/useTranslation";

export const useCurrentUser = () => {
  const alertContext = useRef(useContext(AlertContext));
  const { t } = useTranslate();
  const user = useUser();
  const uid = user?.uid;

  const {
    data: currentUser,
    error,
    isLoading,
  } = useQuery<UserDTO, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      return await getCurrentUserFirebase(uid!);
    },
    enabled: !!uid,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, t, "GENERIC", error);
    }
  }, [error, t]);

  return { currentUser, isLoading };
};

export const useUpdateDefaultPage = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));
  const { t } = useTranslate();
  const user = useUser();
  const uid = user?.uid;

  const { mutate: mutateUserDefaultPage, error } = useMutation({
    mutationFn: async (defaultPage: string) => {
      if (!uid) throw new Error("User not found");
      return await updateUserDefaultPageFirebase(uid, defaultPage);
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData<UserDTO>(["currentUser"], () => {
        return newUser;
      });
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(
        alertContext.current,
        t,
        "DEFAULT_PAGE_FAILED",
        error
      );
    }
  }, [error, t]);

  return { mutateUserDefaultPage };
};

export const useTransactions = (
  filterId?: ExpenseListType,
  monthYear?: MonthYearType
) => {
  const earningsQuery = useEarnings(filterId?.userId, monthYear, true);
  const expensesQuery = useExpenses(filterId, monthYear, true);

  const isLoading = earningsQuery.isLoading || expensesQuery.isLoading;
  const isFetching = earningsQuery.isFetching || expensesQuery.isFetching;

  const [transactions, setTransactions] = useState<{
    earnings: EarningDTO[];
    expenses: ExpenseDTO[];
  } | null>(null);

  const nextCombined = useMemo(() => {
    if (!earningsQuery.earnings || !expensesQuery.expenses) return null;
    return {
      earnings: earningsQuery.earnings,
      expenses: expensesQuery.expenses,
    };
  }, [earningsQuery.earnings, expensesQuery.expenses]);

  useEffect(() => {
    if (nextCombined) {
      setTransactions(nextCombined);
    }
  }, [nextCombined]);

  return { transactions, isLoading, isFetching };
};

export const useMonthlyTransactionTotals = (
  year: number,
  filterId?: ExpenseListType
) => {
  const earningsQuery = useMonthlyEarningTotal(year, filterId?.userId, true);
  const expensesQuery = useMonthlyExpenseTotal(year, filterId, true);

  const isLoading = earningsQuery.isLoading || expensesQuery.isLoading;
  const isFetching = earningsQuery.isFetching || expensesQuery.isFetching;

  const [monthlyTransactionTotals, setMonthlyTransactionTotals] = useState<{
    monthlyEarningTotals: MonthlyEarningTotal[];
    monthlyExpenseTotals: MonthlyExpenseTotal[];
  } | null>(null);

  const nextCombined = useMemo(() => {
    if (
      !earningsQuery.monthlyEarningTotals ||
      !expensesQuery.monthlyExpenseTotals
    )
      return null;
    return {
      monthlyEarningTotals: earningsQuery.monthlyEarningTotals,
      monthlyExpenseTotals: expensesQuery.monthlyExpenseTotals,
    };
  }, [earningsQuery.monthlyEarningTotals, expensesQuery.monthlyExpenseTotals]);

  useEffect(() => {
    if (nextCombined) {
      setMonthlyTransactionTotals(nextCombined);
    }
  }, [nextCombined]);

  return {
    monthlyTransactionTotals,
    isLoading,
    isFetching,
    isEarningEnabled: earningsQuery.isEnabled,
  };
};
