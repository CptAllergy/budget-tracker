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

import { sortExpenseGroups } from "@/utils/utils";

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
    queryKey: ["groups"],
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
