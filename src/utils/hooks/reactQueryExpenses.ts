// TODO second test setQueryData to update cache without refetching
import {
  ExpenseListType,
  MonthlyExpenseTotal,
  MonthYearType,
} from "@/types/componentTypes";
import { useContext, useEffect, useRef } from "react";
import { AlertContext } from "@/contexts/AlertContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteExpenseFirebase,
  getExpensesFirebase,
  getExpensesMonthlySumFirebase,
  postExpenseFirebase,
  updateExpenseFirebase,
} from "@/services/firebaseService";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import { CreateExpenseDTO, ExpenseDTO } from "@/types/DTO/dataTypes";

export const useExpenses = (
  filterId?: ExpenseListType,
  monthYear?: MonthYearType,
  showPlaceholderData: boolean = false
) => {
  const alertContext = useRef(useContext(AlertContext));

  const {
    data: expenses,
    error,
    isLoading,
    isFetching,
    isPlaceholderData,
    isEnabled,
  } = useQuery({
    queryKey: ["expenses", { monthYear, filterId }],
    queryFn: async () => {
      return await getExpensesFirebase(filterId!, monthYear);
    },
    enabled: !!filterId && !!monthYear,
    placeholderData: showPlaceholderData ? (prev) => prev : undefined,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "GENERIC", error);
    }
  }, [error]);

  return { expenses, isLoading, isFetching, isPlaceholderData, isEnabled };
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  type AddExpenseVars = {
    newExpense: CreateExpenseDTO;
  };

  const { mutate: mutateAddExpense, error } = useMutation({
    mutationFn: async ({ newExpense }: AddExpenseVars) => {
      const userTotalAmount = await postExpenseFirebase(newExpense);
      return { userTotalAmount, userId: newExpense.userId, newExpense };
    },
    onSuccess: ({ userTotalAmount, userId, newExpense }) => {
      if (userTotalAmount != null) {
        // User total is not null if the expense belongs to a group
        // TODO check out this warning
        // TODO this works, but instead of invalidating the query, I should update the cache directly
        queryClient.invalidateQueries({
          queryKey: ["groups", userId],
        });
      }

      const monthYear: MonthYearType = {
        month: newExpense.timestamp.toDate().getMonth(),
        year: newExpense.timestamp.toDate().getFullYear(),
      };
      queryClient.invalidateQueries({
        queryKey: ["expenses", { monthYear }],
      });

      toggleStatusAlert(alertContext.current, "New expense created");
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED", error);
    }
  }, [error]);

  return { mutateAddExpense };
};

// TODO second test setQueryData to update cache without refetching
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  type DeleteExpenseVars = {
    expense: ExpenseDTO;
  };

  const { mutate: mutateDeleteExpense, error } = useMutation({
    mutationFn: async ({ expense }: DeleteExpenseVars) => {
      const userTotalAmount = await deleteExpenseFirebase(expense);
      return { userTotalAmount, userId: expense.userId, expense };
    },
    onSuccess: ({ userTotalAmount, userId, expense }) => {
      if (userTotalAmount != null) {
        // User total is not null if the expense belongs to a group
        // TODO check out this warning
        // TODO this works, but instead of invalidating the query, I should update the cache directly
        queryClient.invalidateQueries({
          queryKey: ["groups", userId],
        });
      }

      const monthYear: MonthYearType = {
        month: expense.timestamp.toDate().getMonth(),
        year: expense.timestamp.toDate().getFullYear(),
      };
      queryClient.invalidateQueries({
        queryKey: ["expenses", { monthYear }],
      });

      toggleStatusAlert(alertContext.current, "Expense deleted");
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "DELETE_FAILED", error);
    }
  }, [error]);

  return { mutateDeleteExpense };
};

// TODO second test setQueryData to update cache without refetching
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  type UpdateExpenseVars = {
    expense: ExpenseDTO;
  };

  const { mutate: mutateUpdateExpense, error } = useMutation({
    mutationFn: async ({ expense }: UpdateExpenseVars) => {
      const { newUserTotal, prevTimestamp } =
        await updateExpenseFirebase(expense);
      return { newUserTotal, prevTimestamp, userId: expense.userId, expense };
    },
    onSuccess: ({ newUserTotal, prevTimestamp, userId, expense }) => {
      if (newUserTotal != null) {
        // User total is not null if the expense belongs to a group
        // TODO check out this warning
        // TODO this works, but instead of invalidating the query, I should update the cache directly
        queryClient.invalidateQueries({
          queryKey: ["groups", userId],
        });
      }

      const newMonthYear: MonthYearType = {
        month: expense.timestamp.toDate().getMonth(),
        year: expense.timestamp.toDate().getFullYear(),
      };
      const prevMonthYear: MonthYearType = {
        month: prevTimestamp.toDate().getMonth(),
        year: prevTimestamp.toDate().getFullYear(),
      };

      queryClient.invalidateQueries({
        queryKey: ["expenses", { monthYear: newMonthYear }],
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses", { monthYear: prevMonthYear }],
      });

      toggleStatusAlert(alertContext.current, "Expense updated");
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "UPDATE_FAILED", error);
    }
  }, [error]);

  return { mutateUpdateExpense };
};

export const useMonthlyExpenseTotal = (
  year: number,
  filterId?: ExpenseListType
) => {
  const alertContext = useRef(useContext(AlertContext));

  const {
    data: monthlyExpenseTotals,
    error,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["yearExpenses", { year, filterId }],
    queryFn: async () => {
      const results: MonthlyExpenseTotal[] = [];

      for (let month = 0; month < 12; month++) {
        const sum = await getExpensesMonthlySumFirebase(filterId!, {
          month,
          year,
        });
        results.push({ month, totalExpenses: sum ?? -1 });
      }
      return results;
    },
    enabled: !!filterId,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "GENERIC", error);
    }
  }, [error]);

  return { monthlyExpenseTotals, isLoading, isFetching };
};
