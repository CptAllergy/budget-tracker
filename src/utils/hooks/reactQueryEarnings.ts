import { MonthlyEarningTotal, MonthYearType } from "@/types/componentTypes";
import { useContext, useEffect, useRef } from "react";
import { AlertContext } from "@/contexts/AlertContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteEarningFirebase,
  getEarningsFirebase,
  getEarningsMonthlySumFirebase,
  postEarningFirebase,
  updateEarningFirebase,
} from "@/services/firebaseService";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import { CreateEarningDTO, EarningDTO } from "@/types/DTO/dataTypes";

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
    queryKey: ["earnings", { monthYear, userId }],
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

// TODO second test setQueryData to update cache without refetching
export const useAddEarning = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  type AddEarningVars = {
    newEarning: CreateEarningDTO;
  };

  const { mutate: mutateAddEarning, error } = useMutation({
    mutationFn: async ({ newEarning }: AddEarningVars) => {
      const savedEarning = await postEarningFirebase(newEarning);
      return { savedEarning };
    },
    onSuccess: ({ savedEarning }) => {
      // TODO this works, but instead of invalidating the query, I should update the cache directly
      const monthYear: MonthYearType = {
        month: savedEarning.timestamp.toDate().getMonth(),
        year: savedEarning.timestamp.toDate().getFullYear(),
      };

      // TODO check out this warning
      queryClient.invalidateQueries({
        queryKey: ["earnings", { monthYear }],
      });
      toggleStatusAlert(alertContext.current, "New earning created");
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED", error);
    }
  }, [error]);

  return { mutateAddEarning };
};

// TODO second test setQueryData to update cache without refetching
export const useDeleteEarning = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  type DeleteEarningVars = {
    earning: EarningDTO;
  };

  const { mutate: mutateDeleteEarning, error } = useMutation({
    mutationFn: async ({ earning }: DeleteEarningVars) => {
      await deleteEarningFirebase(earning);
      return { earning };
    },
    onSuccess: ({ earning }) => {
      // TODO this works, but instead of invalidating the query, I should update the cache directly
      const monthYear: MonthYearType = {
        month: earning.timestamp.toDate().getMonth(),
        year: earning.timestamp.toDate().getFullYear(),
      };

      // TODO check out this warning
      queryClient.invalidateQueries({
        queryKey: ["earnings", { monthYear }],
      });
      toggleStatusAlert(alertContext.current, "Earning deleted");
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "DELETE_FAILED", error);
    }
  }, [error]);

  return { mutateDeleteEarning };
};

// TODO second test setQueryData to update cache without refetching
export const useUpdateEarning = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));

  type UpdateEarningVars = {
    earning: EarningDTO;
  };

  const { mutate: mutateUpdateEarning, error } = useMutation({
    mutationFn: async ({ earning }: UpdateEarningVars) => {
      const { prevTimestamp, earning: savedEarning } =
        await updateEarningFirebase(earning);
      return { prevTimestamp, savedEarning };
    },
    onSuccess: ({ prevTimestamp, savedEarning }) => {
      // TODO this works, but instead of invalidating the query, I should update the cache directly
      const newMonthYear: MonthYearType = {
        month: savedEarning.timestamp.toDate().getMonth(),
        year: savedEarning.timestamp.toDate().getFullYear(),
      };
      const prevMonthYear: MonthYearType = {
        month: prevTimestamp.toDate().getMonth(),
        year: prevTimestamp.toDate().getFullYear(),
      };

      // TODO check out this warning
      queryClient.invalidateQueries({
        queryKey: ["earnings", { monthYear: newMonthYear }],
      });
      queryClient.invalidateQueries({
        queryKey: ["earnings", { monthYear: prevMonthYear }],
      });
      toggleStatusAlert(alertContext.current, "Earning updated");
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, "UPDATE_FAILED", error);
    }
  }, [error]);

  return { mutateUpdateEarning };
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
    queryKey: ["yearEarnings", { year, userId }],
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
