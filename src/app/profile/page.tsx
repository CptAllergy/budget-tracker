"use client";

import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Navbar } from "@/components/elements/navbar/Navbar";
import {
  CreateEarningDTO,
  CreateExpenseDTO,
  EarningDTO,
} from "@/types/DTO/dataTypes";
import ExpensesList from "@/components/elements/home/ExpensesList";
import { AlertContext } from "@/contexts/AlertContext";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import {
  getEarningsFirebase,
  getExpensesFirebase,
  postEarningFirebase,
} from "@/services/firebaseService";
import { ExpensesContext } from "@/contexts/ExpensesContext";
import { LuPlus } from "react-icons/lu";
import { ExpenseGroupsContext } from "@/contexts/ExpenseGroupsContext";
import { useAddExpense, useCurrentUser } from "@/utils/hooks/reactQuery";
import EarningsList from "@/components/elements/profile/EarningsList";
import { MonthNavigation } from "@/components/elements/home/MonthNavigation";
import { AddDialog } from "@/components/commons/dialogs/AddDialog";
import { MonthYearType } from "@/types/componentTypes";
import { getCurrentMonthYear } from "@/utils/utils";
import ProfileSummary from "@/components/elements/profile/ProfileSummary";

const Profile = () => {
  const alertContext = useRef(useContext(AlertContext));
  const expensesContext = useContext(ExpensesContext);
  const expenseGroupsContext = useContext(ExpenseGroupsContext);

  const setExpenseDocs = useRef(expensesContext.setExpenseDocs);
  const handleFilterChange = useRef(expenseGroupsContext.handleFilterChange);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [toggleExpenses, setToggleExpenses] = useState(true);
  const [earnings, setEarnings] = useState<EarningDTO[]>([]);
  const [monthYear, setMonthYear] = useState<MonthYearType>(
    getCurrentMonthYear()
  );

  const { currentUser, isLoading } = useCurrentUser();

  // Set filter to current user
  useEffect(() => {
    if (currentUser) {
      handleFilterChange.current({ userId: currentUser.id });
    }
  }, [currentUser]);

  // Load earnings
  useEffect(() => {
    if (currentUser?.id) {
      getEarningsFirebase(setEarnings, currentUser.id, monthYear).then(
        () => {}
      );
    }
  }, [currentUser?.id, monthYear]);

  // Load expenses
  useEffect(() => {
    if (expenseGroupsContext.filterId) {
      void getExpensesFirebase(
        setExpenseDocs.current,
        expenseGroupsContext.filterId,
        monthYear
      );
    }
  }, [expenseGroupsContext.filterId, monthYear]);

  const { mutateAddExpense } = useAddExpense(setExpenseDocs.current);

  const createExpense = async (newExpense: CreateExpenseDTO) => {
    mutateAddExpense({
      newExpense,
      currentUser: currentUser!,
    });

    setToggleExpenses(true);
    setMonthYear(getCurrentMonthYear());
  };

  const createEarning = async (newEarning: CreateEarningDTO) => {
    try {
      await postEarningFirebase(newEarning, setEarnings);
      // Navigate to page with new content
      setToggleExpenses(false);
      setMonthYear(getCurrentMonthYear());

      toggleStatusAlert(alertContext.current, "New earning created");
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED", error);
      throw "Error adding new earning";
    }
  };

  return (
    <div className="">
      <Navbar setIsAddDialogOpen={setIsAddDialogOpen} />
      {currentUser && (
        <AddDialog
          isDialogOpen={isAddDialogOpen}
          setIsDialogOpen={setIsAddDialogOpen}
          user={currentUser}
          createExpense={createExpense}
          createEarning={createEarning}
        />
      )}
      <div className="fixed right-0 bottom-0 z-5 m-4 sm:hidden">
        {!isLoading && currentUser && (
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-theme-secondary hover:bg-theme-secondary-hover rounded-md border-2 border-black p-1.5 text-white shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
          >
            <LuPlus size="30" />
          </button>
        )}
      </div>
      <div className="mx-3 mt-12">
        <section className="mx-4 flex flex-col items-center">
          <ProfileSummary
            currentUser={currentUser}
            expenses={expensesContext.expenses}
            earnings={earnings}
          />
        </section>
        <section className="mt-4 md:mt-10">
          <div className="mx-1 mt-5 mb-5">
            <MonthNavigation
              monthYear={monthYear}
              setMonthYear={setMonthYear}
            />
            <TransactionTabs
              toggleExpenses={toggleExpenses}
              setToggleExpenses={setToggleExpenses}
            />
            {toggleExpenses ? (
              <ExpensesList
                expenses={expensesContext.expenses}
                currentUser={currentUser}
                isProfile={true}
              />
            ) : (
              <EarningsList
                earnings={earnings}
                setEarnings={setEarnings}
                currentUser={currentUser}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const TransactionTabs = ({
  toggleExpenses,
  setToggleExpenses,
}: {
  toggleExpenses: boolean;
  setToggleExpenses: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="mx-auto flex max-w-6xl flex-col">
      <div className="inline-block min-w-full px-3 py-1 align-middle md:py-2">
        <div className="bg-theme-highlight grid grid-cols-2 gap-1 rounded-md border-2 border-black p-2 text-base font-semibold">
          <div
            onClick={() => setToggleExpenses(true)}
            className={`${toggleExpenses ? "bg-theme-main hover:bg-theme-hover border-2 border-black" : "hover:bg-theme-highlight-hover"} rounded-md p-1 text-center transition-colors hover:cursor-pointer`}
          >
            📉 Expenses
          </div>
          <div
            onClick={() => setToggleExpenses(false)}
            className={`${!toggleExpenses ? "bg-theme-main hover:bg-theme-hover border-2 border-black" : "hover:bg-theme-highlight-hover"} rounded-md p-1 text-center transition-colors hover:cursor-pointer`}
          >
            📈 Earnings
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
