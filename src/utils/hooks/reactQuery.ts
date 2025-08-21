import { signOut, useSession } from "next-auth/react";
import { useContext, useEffect, useRef } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import {
  deleteExpenseFirebase,
  getCurrentUserFirebase,
  getEarningsFirebase,
  getEarningsMonthlySumFirebase,
  getExpenseGroupsFirebase,
  getExpensesFirebase,
  getExpensesMonthlySumFirebase,
  postExpenseFirebase,
  updateExpenseFirebase,
} from "@/services/firebaseService";
import { CreateExpenseDTO, ExpenseDTO, UserDTO } from "@/types/DTO/dataTypes";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FirebaseError } from "@firebase/util";
import { sortExpenseGroups } from "@/utils/sorters";
import {
  ExpenseListType,
  MonthlyEarningTotal,
  MonthlyExpenseTotal,
  MonthYearType,
  YearType,
} from "@/types/componentTypes";
import { DocumentSnapshot } from "firebase/firestore";

// TODO improve all generic error messages

export const useCurrentUser = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const idToken = session?.user?.id_token;

  const alertContext = useRef(useContext(AlertContext));

  const {
    data: currentUser,
    isLoading,
    error,
  } = useQuery<UserDTO, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const auth = getAuth();
      const oAuthCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, oAuthCredential);

      return await getCurrentUserFirebase(userCredential.user.uid);
    },
    enabled: !!idToken,
    retry: false,
    staleTime: 1000 * 60 * 5, // TODO: change this to an appropriate value
  });

  useEffect(() => {
    if (error) {
      if (
        error instanceof FirebaseError &&
        error.code === "auth/invalid-credential"
      ) {
        // Update session storage with auth error
        queryClient.clear();
        sessionStorage.setItem("session_error", "true");
        void signOut();
      } else {
        toggleStatusErrorAlert(alertContext.current, "GENERIC", error);
      }
    }
  }, [error]);

  return { currentUser, isLoading };
};

export const useExpenseGroups = (currentUser?: UserDTO) => {
  const alertContext = useRef(useContext(AlertContext));

  const {
    data: expenseGroups,
    error,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ["groups", currentUser?.id],
    queryFn: async () => {
      const expenseGroups = await getExpenseGroupsFirebase(currentUser!.id);
      return sortExpenseGroups(expenseGroups, currentUser!.groupId);
    },
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "GENERIC", error);
    }
  }, [error]);

  return { expenseGroups, error, isLoading, isError, isSuccess };
};

// TODO second test setQueryData to update cache without refetching
// TODO simplify this hook, probably won't need some of these parameters
export const useAddExpense = (
  setExpenseDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  type AddExpenseVars = {
    newExpense: CreateExpenseDTO;
    currentUser: UserDTO;
  };

  const { mutate: mutateAddExpense, error } = useMutation({
    mutationFn: async ({ newExpense, currentUser }: AddExpenseVars) => {
      const userTotalAmount = await postExpenseFirebase(
        newExpense,
        currentUser!,
        setExpenseDocs
      );
      return { userTotalAmount, currentUserId: currentUser.id };
    },
    onSuccess: ({ userTotalAmount, currentUserId }) => {
      if (userTotalAmount != null) {
        // User total is not null if the expense belongs to a group
        // TODO check out this warning
        // TODO this works, but instead of invalidating the query, I should update the cache directly
        queryClient.invalidateQueries({
          queryKey: ["groups", currentUserId],
        });
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

// TODO second test setQueryData to update cache without refetching
// TODO simplify this hook, probably won't need some of these parameters
export const useDeleteExpense = (
  setExpenseDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  type DeleteExpenseVars = {
    expense: ExpenseDTO;
    currentUser: UserDTO;
  };

  const { mutate: mutateDeleteExpense, error } = useMutation({
    mutationFn: async ({ expense, currentUser }: DeleteExpenseVars) => {
      const userTotalAmount = await deleteExpenseFirebase(
        expense,
        currentUser!,
        setExpenseDocs
      );
      return { userTotalAmount, currentUserId: currentUser.id };
    },
    onSuccess: ({ userTotalAmount, currentUserId }) => {
      if (userTotalAmount != null) {
        // User total is not null if the expense belongs to a group
        // TODO check out this warning
        // TODO this works, but instead of invalidating the query, I should update the cache directly
        queryClient.invalidateQueries({
          queryKey: ["groups", currentUserId],
        });
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

// TODO second test setQueryData to update cache without refetching
// TODO simplify this hook, probably won't need some of these parameters
export const useUpdateExpense = (
  setExpenseDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  type UpdateExpenseVars = {
    expense: ExpenseDTO;
    currentUser: UserDTO;
  };

  const { mutate: mutateUpdateExpense, error } = useMutation({
    mutationFn: async ({ expense, currentUser }: UpdateExpenseVars) => {
      const userTotalAmount = await updateExpenseFirebase(
        expense,
        currentUser!,
        setExpenseDocs
      );
      return { userTotalAmount, currentUserId: currentUser.id };
    },
    onSuccess: ({ userTotalAmount, currentUserId }) => {
      if (userTotalAmount != null) {
        // User total is not null if the expense belongs to a group
        // TODO check out this warning
        // TODO this works, but instead of invalidating the query, I should update the cache directly
        queryClient.invalidateQueries({
          queryKey: ["groups", currentUserId],
        });
      }
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

// TODO this function could maybe be adapoted to use the useMutation hook
// This function updates both the current group and the matching element in the group list
// const handleGroupChange = (
//   updater: (prevDoc: ExpenseGroupDTO) => ExpenseGroupDTO
// ) => {
//   setCurrentGroup((prevState) => {
//     const newGroup = updater(prevState!);
//     // TODO MUST MUTATE REACT QUERY STATE
//     setExpenseGroups((prevState) => {
//       const updatedGroupIndex = prevState.findIndex(
//         (group) => group.id === newGroup.id
//       );
//       return prevState.toSpliced(updatedGroupIndex, 1, newGroup);
//     });
//     return newGroup;
//   });
// };

// TODO this should be used from a mutation, handleGroupChange should be removed
// TODO use this logic if it helps
// function updateCurrentUserTotalState(
//   newUserTotal: number | null,
//   currentUserId: string,
//   filterId: ExpenseListType,
//   handleGroupChange: (
//     updater: (prevDocs: ExpenseGroupDTO) => ExpenseGroupDTO
//   ) => void
// ) {
//   if (newUserTotal != null && filterId.groupId != null) {
//     // Update the total for the current user
//     handleGroupChange((prevState) => {
//       const prevTotal = prevState.totals.find(
//         (total) => total.id === currentUserId
//       );
//       const newTotal: UserTotalDTO = { ...prevTotal!, total: newUserTotal };
//       const newTotals: UserTotalDTO[] = [
//         ...prevState.totals.filter((total) => total.id !== currentUserId),
//         newTotal,
//       ];
//       return {
//         ...prevState,
//         totals: newTotals,
//       };
//     });
//   }
// }

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
    queryKey: ["expenses", filterId, monthYear],
    queryFn: async () => {
      return await getExpensesFirebase(() => {}, filterId!, monthYear);
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

export const useEarnings = (
  userId?: string,
  monthYear?: MonthYearType,
  showPlaceholderData: boolean = false
) => {
  const alertContext = useRef(useContext(AlertContext));

  const {
    data: earnings,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["earnings", userId, monthYear],
    queryFn: async () => {
      return await getEarningsFirebase(() => {}, userId!, monthYear);
    },
    enabled: !!monthYear && !!userId,
    placeholderData: showPlaceholderData ? (prev) => prev : undefined,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "GENERIC", error);
    }
  }, [error]);

  return { earnings, isLoading };
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
    queryKey: ["yearExpenses", filterId, year],
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

export const useMonthlyEarningTotal = (year: number, userId?: string) => {
  const alertContext = useRef(useContext(AlertContext));

  const {
    data: monthlyEarningTotals,
    error,
    isLoading,
    isFetching,
    isEnabled,
  } = useQuery({
    queryKey: ["yearEarnings", userId, year],
    queryFn: async () => {
      const results: MonthlyEarningTotal[] = [];

      for (let month = 0; month < 12; month++) {
        const sum = await getEarningsMonthlySumFirebase(userId!, {
          month,
          year,
        });
        results.push({ month, totalEarnings: sum ?? -1 });
      }
      return results;
    },
    enabled: !!userId,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "GENERIC", error);
    }
  }, [error]);

  return { monthlyEarningTotals, isLoading, isFetching, isEnabled };
};
