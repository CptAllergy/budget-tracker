"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { rancho } from "@/styles/fonts";
import { ExpenseGroupsContext } from "@/contexts/ExpenseGroupsContext";
import { AlertContext } from "@/contexts/AlertContext";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { TotalsLoading } from "@/components/loading/elements/home/LoadingHome";

const Totals = () => {
  const alertContext = useRef(useContext(AlertContext));
  const expenseGroupsContext = useContext(ExpenseGroupsContext);

  const { currentGroup } = expenseGroupsContext;

  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [balance, setBalance] = useState(0);

  // TODO refactor this logic to work for any number of users
  useEffect(() => {
    if (currentGroup) {
      if (
        currentGroup.members.length !== 2 ||
        currentGroup.totals.length !== 2
      ) {
        toggleStatusErrorAlert(
          alertContext.current,
          "GENERIC",
          "Invalid group data"
        );
        return;
      }

      const groupUser1 = currentGroup.totals[0];
      const groupUser2 = currentGroup.totals[1];

      const balance = groupUser1.total / 2 - groupUser2.total / 2;

      const [sender, receiver] =
        balance > 0
          ? [groupUser2.name, groupUser1.name]
          : [groupUser1.name, groupUser2.name];

      setSender(sender);
      setReceiver(receiver);
      setBalance(Math.abs(balance));
    }
  }, [currentGroup]);

  return (
    <>
      {currentGroup ? (
        <div className="bg-theme-secondary w-full max-w-4xl rounded-md border-2 border-black py-1 text-center shadow-[5px_5px_0px_rgba(0,0,0,1)]">
          <div className={`${rancho.className} text-2xl md:text-3xl`}>
            <span className="">
              {sender} owes {receiver}{" "}
            </span>
            <span className="font-bold">{Number(balance).toFixed(2)}€</span>
          </div>
        </div>
      ) : (
        <TotalsLoading />
      )}
    </>
  );
};

export default Totals;
