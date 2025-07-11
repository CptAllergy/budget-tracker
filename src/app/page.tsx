"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/elements/navbar/Navbar";
import {
  CreateEarningDTO,
  CreateExpenseDTO,
  ExpenseGroupDTO,
} from "@/types/DTO/dataTypes";
import Totals from "@/components/elements/home/Totals";
import ExpenseList from "@/components/elements/home/ExpenseList";
import { AlertContext } from "@/contexts/AlertContext";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import {
  getExpenseGroupsFirebase,
  postEarningFirebase,
  postExpenseFirebase,
} from "@/services/firebaseService";
import {
  TotalsLoading,
  TransactionListLoading,
} from "@/components/loading/elements/home/LoadingHome";
import NewChanges from "@/components/elements/home/NewChanges";
import { ExpensesContext } from "@/contexts/ExpensesContext";
import { LuPlus } from "react-icons/lu";
import { ExpenseGroupsContext } from "@/contexts/ExpenseGroupsContext";
import { sortExpenseGroups } from "@/utils/sorters";
import { useRouter } from "next/navigation";
import { useFirebaseSetup } from "@/utils/hooks";
import MonthNavigation from "@/components/elements/home/MonthNavigation";
import { AddDialog } from "@/components/commons/dialogs/AddDialog";

// TODO consider looking into a state manager so changes to context dont cause re-renders (investigate if this is actually a problem)
// TODO add stats page (monthly, yearly)
// TODO check where unnecessary re-renders are occurring
// TODO fix bug, when adding a new transaction/earning the monthYear is not updated, only the list of expenses/earnings. To fix, update monthYear instead when adding a new transaction/earning
// TODO add settings menu where user can change color of earning and expenses (red, green or grey, for a negative or neutral value)
const Home = () => {
  const alertContext = useRef(useContext(AlertContext));
  const expensesContext = useContext(ExpensesContext);
  const expenseGroupsContext = useContext(ExpenseGroupsContext);

  const setExpenseDocs = useRef(expensesContext.setExpenseDocs);
  const handleFilterChange = useRef(expenseGroupsContext.handleFilterChange);

  const setExpenseGroups = useRef(expenseGroupsContext.setExpenseGroups);

  const handleGroupChange = useRef(expenseGroupsContext.handleGroupChange);

  // Used to detect new changes
  const [isChangeFound, setIsChangeFound] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [monthYear, setMonthYear] = useState<{ month: number; year: number }>(
    () => {
      const currentDate = new Date();
      return { month: currentDate.getMonth(), year: currentDate.getFullYear() };
    }
  );

  const { db, currentUser, firebaseLoading } = useFirebaseSetup();
  const router = useRouter();

  // Runs after sign in to either redirect to profile page or set group
  useEffect(() => {
    // TODO if received value from local storage with different groupId, use that value so set default (after checking it's valid) and then clear local storage
    const selectDefaultPage = (groups: ExpenseGroupDTO[]) => {
      if (!groups || groups.length === 0) {
        // Redirect to profile page if no groups are found
        router.push("/profile");
      } else {
        // Since the groups are sorted, the first group is the favourite one
        try {
          handleFilterChange.current(
            {
              groupId: groups[0].id,
              groupName: groups[0].name,
            },
            groups
          );
        } catch {
          toggleStatusErrorAlert(alertContext.current, "GENERIC");
        }
      }
    };

    if (currentUser) {
      getExpenseGroupsFirebase(db, currentUser.id)
        .then((groups) => {
          const sortedGroups = sortExpenseGroups(groups, currentUser.groupId);
          setExpenseGroups.current(sortedGroups);
          selectDefaultPage(sortedGroups);
        })
        .catch(() => toggleStatusErrorAlert(alertContext.current, "GENERIC"));
    }
  }, [currentUser, db, router]);

  const createExpense = async (newExpense: CreateExpenseDTO) => {
    try {
      await postExpenseFirebase(
        db,
        newExpense,
        expenseGroupsContext.filterId!,
        currentUser!,
        handleGroupChange.current,
        setExpenseDocs.current
      );

      toggleStatusAlert(alertContext.current, "New expense created");
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
      throw "Error adding new expense";
    }
  };

  const createEarning = async (newEarning: CreateEarningDTO) => {
    try {
      await postEarningFirebase(db, newEarning, currentUser!.id, () => {});

      toggleStatusAlert(
        alertContext.current,
        "New earning created in your profile"
      );
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
      throw "Error adding new earning";
    }
  };

  return (
    <div className="">
      <Navbar
        setIsAddDialogOpen={setIsAddDialogOpen}
        currentUser={currentUser}
      />
      {currentUser && (
        <AddDialog
          isDialogOpen={isAddDialogOpen}
          setIsDialogOpen={setIsAddDialogOpen}
          user={currentUser}
          createExpense={createExpense}
          createEarning={createEarning}
        />
      )}
      <div className="right sticky top-0 z-10 ml-auto flex w-max justify-end">
        {!firebaseLoading && (
          <NewChanges
            isChangeFound={isChangeFound}
            setIsChangeFound={setIsChangeFound}
            db={db}
          />
        )}
      </div>
      <div className="fixed right-0 bottom-0 z-5 m-4 sm:hidden">
        {!firebaseLoading && currentUser && (
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-theme-secondary hover:bg-theme-secondary-hover rounded-md border-2 border-black p-1.5 text-white shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
          >
            <LuPlus size="30" />
          </button>
        )}
      </div>
      <div className="mx-3 -mt-12">
        <section className="mx-4 flex flex-col items-center">
          {/*TODO handle loading inside component*/}
          {!firebaseLoading && currentUser ? <Totals /> : <TotalsLoading />}
        </section>
        <section className="mt-4 md:mt-10">
          {!firebaseLoading && currentUser ? (
            <div className="mx-1 mt-5 mb-5">
              <MonthNavigation
                monthYear={monthYear}
                setMonthYear={setMonthYear}
              />
              <ExpenseList
                currentUser={currentUser}
                monthYear={monthYear}
                db={db}
              />
            </div>
          ) : (
            <TransactionListLoading />
          )}
        </section>
      </div>
    </div>
  );
};
export default Home;
