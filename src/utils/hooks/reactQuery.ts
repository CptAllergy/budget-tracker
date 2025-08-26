import { signOut, useSession } from "next-auth/react";
import { useContext, useEffect, useRef } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import {
  getCurrentUserFirebase,
  getExpenseGroupsFirebase,
} from "@/services/firebaseService";
import { UserDTO } from "@/types/DTO/dataTypes";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FirebaseError } from "@firebase/util";
import { sortExpenseGroups } from "@/utils/sorters";

// TODO improve all generic error messages
// TODO in mutation hooks don't return the given transaction value, actually use the updated value from firebase for query invalidation/updates
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
    staleTime: 1000 * 60 * 5, // 5 minutes
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
  }, [error, queryClient]);

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

// TODO this function could maybe be adapted to use the useMutation hook
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
