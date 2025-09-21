import { useContext, useEffect, useRef } from "react";
import {
  getCurrentUserFirebase,
  getExpenseGroupsFirebase,
} from "@/services/firebaseService";
import { UserDTO } from "@/types/DTO/dataTypes";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";
import { useQuery } from "@tanstack/react-query";
import { sortExpenseGroups } from "@/utils/utils";
import { useUser } from "@/utils/hooks/useUser";

export const useCurrentUser = () => {
  const alertContext = useRef(useContext(AlertContext));
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
      toggleStatusErrorAlert(alertContext.current, "GENERIC", error);
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

  return { expenseGroups, isLoading, isSuccess };
};
