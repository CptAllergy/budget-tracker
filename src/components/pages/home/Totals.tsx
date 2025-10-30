"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { AlertContext } from "@/contexts/AlertContext";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { TotalsLoading } from "@/components/loading/elements/home/LoadingHome";
import { ExpenseGroupDTO } from "@/types/DTO/dataTypes";
import { useCurrentUser } from "@/utils/hooks/reactQueryUser";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { useExpenseGroups } from "@/utils/hooks/reactQueryGroups";
import { settleBalances } from "@/utils/utils";
import { TotalSettlementType } from "@/types/componentTypes";

const Totals = ({ groupId }: { groupId?: string }) => {
  const { t } = useTranslate();
  const alertContext = useRef(useContext(AlertContext));

  const [currentGroup, setCurrentGroup] = useState<ExpenseGroupDTO>();
  const [settlements, setSettlements] = useState<TotalSettlementType[]>([]);

  const { currentUser } = useCurrentUser();
  const { expenseGroups, isLoading } = useExpenseGroups(currentUser);

  // Get current group
  useEffect(() => {
    if (expenseGroups) {
      const group = expenseGroups.find((group) => group.id === groupId);
      setCurrentGroup(group);
    }
  }, [expenseGroups, groupId]);

  // Calculate settlements dynamically
  useEffect(() => {
    if (currentGroup) {
      if (!currentGroup.members?.length || !currentGroup.totals?.length) {
        toggleStatusErrorAlert(
          alertContext.current,
          t,
          "GENERIC",
          "Invalid group data"
        );
        return;
      }

      const settlements = settleBalances(currentGroup.totals);
      setSettlements(settlements);
    }
  }, [currentGroup, t]);

  if (isLoading || !currentGroup) return <TotalsLoading />;

  return (
    <div className="bg-theme-secondary w-full max-w-4xl rounded-md border-2 border-black py-1 text-center shadow-[5px_5px_0px_rgba(0,0,0,1)]">
      <div className="py-1 text-lg md:text-xl">
        {currentGroup.totals.length === 1 ? (
          <div>
            <span>{t("totals.totalSpent")} </span>
            <span className="font-bold">
              {currentGroup.totals[0].total.toFixed(2)}€
            </span>
          </div>
        ) : settlements.length === 0 ? (
          <div>{t("totals.settled")}</div>
        ) : (
          settlements.map(({ from, to, amount }, i) => (
            <div key={i}>
              <span>
                {from} {t("totals.owes")} {to}{" "}
              </span>
              <span className="font-bold">{amount.toFixed(2)}€</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Totals;
