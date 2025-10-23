import { MonthlyEarningTotal, MonthYearType } from "@/types/componentTypes";
import { useContext, useEffect, useRef } from "react";
import { AlertContext } from "@/contexts/AlertContext";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
import { Timestamp } from "firebase/firestore";
import { useTranslate } from "@/utils/hooks/useTranslation";

export const useEarnings = (
  userId?: string,
  monthYear?: MonthYearType,
  showPlaceholderData: boolean = false
) => {
  const alertContext = useRef(useContext(AlertContext));
  const { t } = useTranslate();

  const {
    data: earnings,
    error,
    isLoading,
    isFetching,
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
      toggleStatusErrorAlert(alertContext.current, t, "EARNINGS_FAILED", error);
    }
  }, [error, t]);

  return { earnings, isLoading, isFetching };
};

export const useAddEarning = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));
  const { t } = useTranslate();

  const { mutate: mutateAddEarning, error } = useMutation({
    mutationFn: async ({ newEarning }: { newEarning: CreateEarningDTO }) => {
      const { createdEarning } = await postEarningFirebase(newEarning);
      return { createdEarning };
    },
    onSuccess: ({ createdEarning }) => {
      const monthYear: MonthYearType = {
        month: createdEarning.timestamp.toDate().getMonth(),
        year: createdEarning.timestamp.toDate().getFullYear(),
      };

      queryClient.setQueryData<EarningDTO[]>(
        ["earnings", { monthYear, userId: createdEarning.userId }],
        (oldData) => {
          return oldData && [createdEarning, ...oldData];
        }
      );

      queryClient.setQueryData<MonthlyEarningTotal[]>(
        ["yearEarnings", { year: monthYear.year }],
        (oldData) => {
          const monthData = oldData?.find(
            (data) => data.month === monthYear.month
          );
          if (monthData && oldData) {
            monthData.totalEarnings += createdEarning.amount;
            return oldData.map((m) =>
              m.month === monthData.month ? monthData : m
            );
          }
        }
      );

      toggleStatusAlert(alertContext.current, t("alerts.info.earningNew"));
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, t, "ADD_FAILED", error);
    }
  }, [error, t]);

  return { mutateAddEarning };
};

export const useDeleteEarning = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));
  const { t } = useTranslate();

  const { mutate: mutateDeleteEarning, error } = useMutation({
    mutationFn: async ({ earning }: { earning: EarningDTO }) => {
      await deleteEarningFirebase(earning);
      return { earning };
    },
    onSuccess: ({ earning }) => {
      const monthYear: MonthYearType = {
        month: earning.timestamp.toDate().getMonth(),
        year: earning.timestamp.toDate().getFullYear(),
      };

      queryClient.setQueryData<EarningDTO[]>(
        ["earnings", { monthYear, userId: earning.userId }],
        (oldData) => {
          return oldData?.filter((e) => e.id !== earning.id);
        }
      );

      queryClient.setQueryData<MonthlyEarningTotal[]>(
        ["yearEarnings", { year: monthYear.year }],
        (oldData) => {
          const monthData = oldData?.find(
            (data) => data.month === monthYear.month
          );
          if (monthData && oldData) {
            monthData.totalEarnings -= earning.amount;
            return oldData.map((m) =>
              m.month === monthData.month ? monthData : m
            );
          }
        }
      );

      toggleStatusAlert(alertContext.current, t("alerts.info.earningDeleted"));
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, t, "DELETE_FAILED", error);
    }
  }, [error, t]);

  return { mutateDeleteEarning };
};

export const useUpdateEarning = () => {
  const queryClient = useQueryClient();
  const alertContext = useRef(useContext(AlertContext));
  const { t } = useTranslate();

  const { mutate: mutateUpdateEarning, error } = useMutation({
    mutationFn: async ({ earning }: { earning: EarningDTO }) => {
      const { prevAmount, prevTimestamp } =
        await updateEarningFirebase(earning);
      return { prevAmount, prevTimestamp, earning };
    },
    onSuccess: ({ prevAmount, prevTimestamp, earning }) => {
      updateEarningInCache(queryClient, earning, prevTimestamp);

      updateMonthlyEarningTotalInCache(
        queryClient,
        earning,
        prevAmount,
        prevTimestamp
      );

      toggleStatusAlert(alertContext.current, t("alerts.info.earningUpdated"));
    },
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, t, "UPDATE_FAILED", error);
    }
  }, [error, t]);

  return { mutateUpdateEarning };
};

export const useMonthlyEarningTotal = (
  year: number,
  userId?: string,
  showPlaceholderData: boolean = false
) => {
  const alertContext = useRef(useContext(AlertContext));
  const { t } = useTranslate();

  const {
    data: monthlyEarningTotals,
    error,
    isLoading,
    isFetching,
    isEnabled,
  } = useQuery({
    queryKey: ["yearEarnings", { year }],
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
    placeholderData: showPlaceholderData ? (prev) => prev : undefined,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (error) {
      toggleStatusErrorAlert(alertContext.current, t, "EARNINGS_FAILED", error);
    }
  }, [error, t]);

  return { monthlyEarningTotals, isLoading, isFetching, isEnabled };
};

function updateEarningInCache(
  queryClient: QueryClient,
  earning: EarningDTO,
  prevTimestamp: Timestamp
) {
  const newMonthYear: MonthYearType = {
    month: earning.timestamp.toDate().getMonth(),
    year: earning.timestamp.toDate().getFullYear(),
  };
  const prevMonthYear: MonthYearType = {
    month: prevTimestamp.toDate().getMonth(),
    year: prevTimestamp.toDate().getFullYear(),
  };

  const isSameMonth =
    newMonthYear.month === prevMonthYear.month &&
    newMonthYear.year === prevMonthYear.year;

  queryClient.setQueryData<EarningDTO[]>(
    ["earnings", { monthYear: prevMonthYear, userId: earning.userId }],
    (oldData) => {
      if (isSameMonth) {
        // If the earning is still in the same month, update it in place
        return oldData
          ?.map((e) => (e.id === earning.id ? earning : e))
          .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
      } else {
        // If the earning has moved to a different month, remove it from the prev month
        return oldData?.filter((e) => e.id !== earning.id);
      }
    }
  );

  if (!isSameMonth) {
    // Only update the new month if the month has changed
    queryClient.setQueryData<EarningDTO[]>(
      ["earnings", { monthYear: newMonthYear, userId: earning.userId }],
      (oldData) => {
        return (
          oldData &&
          [earning, ...oldData].sort((a, b) =>
            a.timestamp < b.timestamp ? 1 : -1
          )
        );
      }
    );
  }
}

function updateMonthlyEarningTotalInCache(
  queryClient: QueryClient,
  earning: EarningDTO,
  prevAmount: number,
  prevTimestamp: Timestamp
) {
  const newMonthYear: MonthYearType = {
    month: earning.timestamp.toDate().getMonth(),
    year: earning.timestamp.toDate().getFullYear(),
  };
  const prevMonthYear: MonthYearType = {
    month: prevTimestamp.toDate().getMonth(),
    year: prevTimestamp.toDate().getFullYear(),
  };

  const isSameMonth =
    newMonthYear.month === prevMonthYear.month &&
    newMonthYear.year === prevMonthYear.year;

  queryClient.setQueryData<MonthlyEarningTotal[]>(
    ["yearEarnings", { year: prevMonthYear.year }],
    (oldData) => {
      const monthData = oldData?.find(
        (data) => data.month === prevMonthYear.month
      );

      if (!monthData || !oldData) {
        return;
      }

      if (isSameMonth) {
        // If the earning is still in the same month, update the total by the difference between the new and prev amount
        monthData.totalEarnings += earning.amount - prevAmount;
        return oldData.map((m) =>
          m.month === monthData.month ? monthData : m
        );
      } else {
        // If the earning has moved to a different month, subtract the prev amount from the prev month
        monthData.totalEarnings -= prevAmount;
        return oldData.map((m) =>
          m.month === monthData.month ? monthData : m
        );
      }
    }
  );

  if (!isSameMonth) {
    // Only update the new month if the month has changed
    queryClient.setQueryData<MonthlyEarningTotal[]>(
      ["yearEarnings", { year: newMonthYear.year }],
      (oldData) => {
        const monthData = oldData?.find(
          (data) => data.month === newMonthYear.month
        );

        if (!monthData || !oldData) {
          return;
        }

        // If the earning has moved to a different month, add the new amount to the new month
        monthData.totalEarnings += earning.amount;
        return oldData.map((m) =>
          m.month === monthData.month ? monthData : m
        );
      }
    );
  }
}
