import {
  ExpenseListType,
  MonthlyExpenseTotal,
  MonthYearType,
} from "@/types/componentTypes";
import { useContext, useEffect, useRef } from "react";
import { AlertContext } from "@/contexts/AlertContext";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
import {
  CreateExpenseDTO,
  ExpenseDTO,
  ExpenseGroupDTO,
} from "@/types/DTO/dataTypes";
import { Timestamp } from "firebase/firestore";
import { SettingsContext } from "@/contexts/SettingsContext";

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
      toggleStatusErrorAlert(alertContext.current, "EXPENSES_FAILED", error);
    }
  }, [error]);

  return { expenses, isLoading, isFetching, isPlaceholderData, isEnabled };
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  const { mutate: mutateAddExpense, error } = useMutation({
    mutationFn: async ({ newExpense }: { newExpense: CreateExpenseDTO }) => {
      const { newUserTotal, createdExpense } =
        await postExpenseFirebase(newExpense);
      return { newUserTotal, createdExpense };
    },
    onSuccess: ({ newUserTotal, createdExpense }) => {
      setUserTotalInCache(queryClient, createdExpense, newUserTotal);

      const monthYear: MonthYearType = {
        month: createdExpense.timestamp.toDate().getMonth(),
        year: createdExpense.timestamp.toDate().getFullYear(),
      };

      const addExpenseInCache = (filterId: ExpenseListType) => {
        queryClient.setQueryData<ExpenseDTO[]>(
          ["expenses", { monthYear, filterId: filterId }],
          (oldData) => {
            return oldData && [createdExpense, ...oldData];
          }
        );

        void queryClient.invalidateQueries({
          queryKey: [
            "yearExpenses",
            { year: monthYear.year, filterId: filterId },
          ],
        });
      };

      // Update caches
      addExpenseInCache({ userId: createdExpense.userId });
      if (createdExpense.groupId) {
        addExpenseInCache({ groupId: createdExpense.groupId });
      }

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

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  const { mutate: mutateDeleteExpense, error } = useMutation({
    mutationFn: async ({ expense }: { expense: ExpenseDTO }) => {
      const { newUserTotal } = await deleteExpenseFirebase(expense);
      return { newUserTotal, expense };
    },
    onSuccess: ({ newUserTotal, expense }) => {
      setUserTotalInCache(queryClient, expense, newUserTotal);

      const monthYear: MonthYearType = {
        month: expense.timestamp.toDate().getMonth(),
        year: expense.timestamp.toDate().getFullYear(),
      };

      const deleteExpenseInCache = (filterId: ExpenseListType) => {
        queryClient.setQueryData<ExpenseDTO[]>(
          ["expenses", { monthYear, filterId: filterId }],
          (oldData) => {
            return oldData?.filter((e) => e.id !== expense.id);
          }
        );

        void queryClient.invalidateQueries({
          queryKey: [
            "yearExpenses",
            { year: monthYear.year, filterId: filterId },
          ],
        });
      };

      // Update caches
      deleteExpenseInCache({ userId: expense.userId });
      if (expense.groupId) {
        deleteExpenseInCache({ groupId: expense.groupId });
      }

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

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  const { mutate: mutateUpdateExpense, error } = useMutation({
    mutationFn: async ({ expense }: { expense: ExpenseDTO }) => {
      const { newUserTotal, prevTimestamp } =
        await updateExpenseFirebase(expense);
      return { newUserTotal, prevTimestamp, expense };
    },
    onSuccess: ({ newUserTotal, prevTimestamp, expense }) => {
      setUserTotalInCache(queryClient, expense, newUserTotal);

      updateExpenseInCache(queryClient, expense, prevTimestamp);

      invalidateExpensesTotalInCache(queryClient, expense, prevTimestamp);

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
  filterId?: ExpenseListType,
  showPlaceholderData: boolean = false
) => {
  const alertContext = useRef(useContext(AlertContext));
  const { isInvestmentExpense } = useContext(SettingsContext);

  const {
    data: monthlyExpenseTotals,
    error,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["yearExpenses", { year, filterId }, { isInvestmentExpense }],
    queryFn: async () => {
      const results: MonthlyExpenseTotal[] = [];

      for (let month = 0; month < 12; month++) {
        const sum = await getExpensesMonthlySumFirebase(
          filterId!,
          { month, year },
          isInvestmentExpense
        );
        results.push({ month, totalExpenses: sum ?? -1 });
      }
      return results;
    },
    enabled: !!filterId,
    placeholderData: showPlaceholderData ? (prev) => prev : undefined,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "EXPENSES_FAILED", error);
    }
  }, [error]);

  return { monthlyExpenseTotals, isLoading, isFetching };
};

function updateExpenseInCache(
  queryClient: QueryClient,
  expense: ExpenseDTO,
  prevTimestamp: Timestamp
) {
  const newMonthYear: MonthYearType = {
    month: expense.timestamp.toDate().getMonth(),
    year: expense.timestamp.toDate().getFullYear(),
  };
  const prevMonthYear: MonthYearType = {
    month: prevTimestamp.toDate().getMonth(),
    year: prevTimestamp.toDate().getFullYear(),
  };

  const isSameMonth =
    newMonthYear.month === prevMonthYear.month &&
    newMonthYear.year === prevMonthYear.year;

  const updateExpenseInCacheByFilterId = (filterId: ExpenseListType) => {
    queryClient.setQueryData<ExpenseDTO[]>(
      ["expenses", { monthYear: prevMonthYear, filterId: filterId }],
      (oldData) => {
        if (isSameMonth) {
          // If the expense is still in the same month, update it in place
          return oldData
            ?.map((e) => (e.id === expense.id ? expense : e))
            .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
        } else {
          // If the expense has moved to a different month, remove it from the prev month
          return oldData?.filter((e) => e.id !== expense.id);
        }
      }
    );

    if (!isSameMonth) {
      queryClient.setQueryData<ExpenseDTO[]>(
        [
          "expenses",
          {
            monthYear: newMonthYear,
            filterId: filterId,
          },
        ],
        (oldData) => {
          return (
            oldData &&
            [expense, ...oldData].sort((a, b) =>
              a.timestamp < b.timestamp ? 1 : -1
            )
          );
        }
      );
    }
  };

  updateExpenseInCacheByFilterId({ userId: expense.userId });
  if (expense.groupId) {
    updateExpenseInCacheByFilterId({ groupId: expense.groupId });
  }
}

function invalidateExpensesTotalInCache(
  queryClient: QueryClient,
  expense: ExpenseDTO,
  prevTimestamp: Timestamp
) {
  const newYear = expense.timestamp.toDate().getFullYear();
  const prevYear = prevTimestamp.toDate().getFullYear();

  const isSameYear = newYear === prevYear;

  const invalidateYear = (filterId: ExpenseListType, year: number) => {
    void queryClient.invalidateQueries({
      queryKey: ["yearExpenses", { year: year, filterId: filterId }],
    });
  };

  invalidateYear({ userId: expense.userId }, prevYear);
  if (expense.groupId) {
    invalidateYear({ groupId: expense.groupId }, prevYear);
  }

  if (!isSameYear) {
    // Only invalidate the new year if the year has changed
    invalidateYear({ userId: expense.userId }, newYear);
    if (expense.groupId) {
      invalidateYear({ groupId: expense.groupId }, newYear);
    }
  }
}

function setUserTotalInCache(
  queryClient: QueryClient,
  expense: ExpenseDTO,
  newUserTotal: number | null
) {
  if (newUserTotal != null) {
    // User total is not null if the expense belongs to a group
    queryClient.setQueryData<ExpenseGroupDTO[]>(["groups"], (oldData) => {
      return oldData?.map((group) => {
        if (group.id !== expense.groupId) return group;

        return {
          ...group,
          totals: group.totals.map((t) => {
            return t.id === expense.userId ? { ...t, total: newUserTotal } : t;
          }),
        };
      });
    });
  }
}
