import { ExpenseGroupDTO, UserDTO } from "@/types/DTO/dataTypes";
import { useContext, useEffect, useRef } from "react";
import { AlertContext } from "@/contexts/AlertContext";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExpenseGroupsFirebase,
  leaveExpenseGroupFirebase,
  postExpenseGroupFirebase,
  updateExpenseGroupNameFirebase,
} from "@/services/firebaseService";
import { sortExpenseGroups } from "@/utils/utils";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";

export const useExpenseGroups = (currentUser?: UserDTO) => {
  const alertContext = useRef(useContext(AlertContext));
  const { t } = useTranslate();

  const {
    data: expenseGroups,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const expenseGroups = await getExpenseGroupsFirebase(currentUser!.id);
      return sortExpenseGroups(expenseGroups, currentUser!.defaultPage);
    },
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, t, "GENERIC", error);
    }
  }, [error, t]);

  return { expenseGroups, isLoading };
};

export const useAddExpenseGroup = (currentUser?: UserDTO) => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));
  const { t } = useTranslate();

  const { mutate: mutateAddExpenseGroup, error } = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("User not found");
      const newExpenseGroup = await postExpenseGroupFirebase(
        currentUser,
        t("settings.defaultGroupName")
      );
      return { newExpenseGroup };
    },
    onSuccess: ({ newExpenseGroup }) => {
      queryClient.setQueryData<ExpenseGroupDTO[]>(["groups"], (oldData) => {
        return oldData && [newExpenseGroup, ...oldData];
      });

      toggleStatusAlert(alertContext.current, t("alerts.info.groupNew"));
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, t, "ADD_FAILED", error);
    }
  }, [error, t]);

  return { mutateAddExpenseGroup };
};

export const useUpdateExpenseGroupName = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));
  const { t } = useTranslate();

  const { mutate: mutateUpdateExpenseGroupName, error } = useMutation({
    mutationFn: async ({
      groupId,
      groupName,
    }: {
      groupId: string;
      groupName: string;
    }) => {
      await updateExpenseGroupNameFirebase(groupId, groupName);
      return { groupId, groupName };
    },
    onSuccess: ({ groupId, groupName }) => {
      queryClient.setQueryData<ExpenseGroupDTO[]>(["groups"], (oldData) => {
        return oldData
          ?.map((g) => (g.id === groupId ? { ...g, name: groupName } : g))
          .sort((a, b) => a.name.localeCompare(b.name));
      });

      toggleStatusAlert(alertContext.current, t("alerts.info.groupUpdated"));
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, t, "UPDATE_FAILED", error);
    }
  }, [error, t]);

  return { mutateUpdateExpenseGroupName };
};

export const useLeaveExpenseGroup = (currentUser?: UserDTO) => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));
  const { t } = useTranslate();

  const { mutate: mutateLeaveExpenseGroup, error } = useMutation({
    mutationFn: async (groupId: string) => {
      if (!currentUser) throw new Error("User not found");
      await leaveExpenseGroupFirebase(currentUser.id, groupId);
      return { groupId };
    },
    onSuccess: ({ groupId }) => {
      queryClient.setQueryData<ExpenseGroupDTO[]>(["groups"], (oldData) => {
        return oldData?.filter((g) => g.id !== groupId);
      });

      toggleStatusAlert(alertContext.current, t("alerts.info.groupDeleted"));
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(
        alertContext.current,
        t,
        "LEAVE_GROUP_FAILED",
        error
      );
    }
  }, [error, t]);

  return { mutateLeaveExpenseGroup };
};
