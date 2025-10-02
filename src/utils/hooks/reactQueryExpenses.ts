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

        queryClient.setQueryData<MonthlyExpenseTotal[]>(
          [
            "yearExpenses",
            {
              year: monthYear.year,
              filterId: filterId,
            },
          ],
          (oldData) => {
            const monthData = oldData?.find(
              (data) => data.month === monthYear.month
            );
            if (monthData && oldData) {
              monthData.totalExpenses += createdExpense.amount;
              return oldData.map((m) =>
                m.month === monthData.month ? monthData : m
              );
            }
          }
        );
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

        queryClient.setQueryData<MonthlyExpenseTotal[]>(
          [
            "yearExpenses",
            {
              year: monthYear.year,
              filterId: filterId,
            },
          ],
          (oldData) => {
            const monthData = oldData?.find(
              (data) => data.month === monthYear.month
            );
            if (monthData && oldData) {
              monthData.totalExpenses -= expense.amount;
              return oldData.map((m) =>
                m.month === monthData.month ? monthData : m
              );
            }
          }
        );
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
      const { newUserTotal, prevAmount, prevTimestamp } =
        await updateExpenseFirebase(expense);
      return { newUserTotal, prevAmount, prevTimestamp, expense };
    },
    onSuccess: ({ newUserTotal, prevAmount, prevTimestamp, expense }) => {
      setUserTotalInCache(queryClient, expense, newUserTotal);

      updateExpenseInCache(queryClient, expense, prevTimestamp);

      updateMonthlyExpensesTotalInCache(
        queryClient,
        expense,
        prevAmount,
        prevTimestamp
      );

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

function updateMonthlyExpensesTotalInCache(
  queryClient: QueryClient,
  expense: ExpenseDTO,
  prevAmount: number,
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

  const updatePrevMonth = (filterId: ExpenseListType) => {
    queryClient.setQueryData<MonthlyExpenseTotal[]>(
      ["yearExpenses", { year: prevMonthYear.year, filterId: filterId }],
      (oldData) => {
        const monthData = oldData?.find(
          (data) => data.month === prevMonthYear.month
        );

        if (!monthData || !oldData) {
          return;
        }

        if (isSameMonth) {
          // If the expense is still in the same month, update the total by the difference between the new and prev amount
          monthData.totalExpenses += expense.amount - prevAmount;
          return oldData.map((m) =>
            m.month === monthData.month ? monthData : m
          );
        } else {
          // If the expense has moved to a different month, subtract the prev amount from the prev month
          monthData.totalExpenses -= prevAmount;
          return oldData.map((m) =>
            m.month === monthData.month ? monthData : m
          );
        }
      }
    );
  };

  const updateNewMonth = (filterId: ExpenseListType) => {
    queryClient.setQueryData<MonthlyExpenseTotal[]>(
      [
        "yearExpenses",
        {
          year: newMonthYear.year,
          filterId: filterId,
        },
      ],
      (oldData) => {
        const monthData = oldData?.find(
          (data) => data.month === newMonthYear.month
        );

        if (!monthData || !oldData) {
          return;
        }

        // If the expense has moved to a different month, add the new amount to the new month
        monthData.totalExpenses += expense.amount;
        return oldData.map((m) =>
          m.month === monthData.month ? monthData : m
        );
      }
    );
  };

  updatePrevMonth({ userId: expense.userId });
  if (expense.groupId) {
    updatePrevMonth({ groupId: expense.groupId });
  }

  if (!isSameMonth) {
    // Only update the new month if the month has changed
    updateNewMonth({ userId: expense.userId });
    if (expense.groupId) {
      updateNewMonth({ groupId: expense.groupId });
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
