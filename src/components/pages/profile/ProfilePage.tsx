"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Navbar } from "@/components/pages/navbar/Navbar";
import { CreateEarningDTO, CreateExpenseDTO } from "@/types/DTO/dataTypes";
import ExpensesList from "@/components/pages/home/ExpensesList";
import { LuPlus } from "react-icons/lu";
import { useCurrentUser } from "@/utils/hooks/reactQueryUser";
import EarningsList from "@/components/pages/profile/EarningsList";
import { MonthNavigation } from "@/components/pages/home/TimeNavigation";
import { AddDialog } from "@/components/commons/dialogs/AddDialog";
import { ExpenseListType, MonthYearType } from "@/types/componentTypes";
import { getCurrentMonthYear } from "@/utils/utils";
import ProfileSummary from "@/components/pages/profile/ProfileSummary";
import { useAddExpense } from "@/utils/hooks/reactQueryExpenses";
import { useAddEarning } from "@/utils/hooks/reactQueryEarnings";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { User } from "@firebase/auth";

type Props = { initialUser: User | null };

const Profile = ({ initialUser }: Props) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [toggleExpenses, setToggleExpenses] = useState(true);
  const [monthYear, setMonthYear] = useState<MonthYearType>(
    getCurrentMonthYear()
  );
  const [filterId, setFilterId] = useState<ExpenseListType>();

  const { currentUser, isLoading } = useCurrentUser();

  // Set filter to current currentUser
  useEffect(() => {
    if (currentUser) {
      setFilterId({ userId: currentUser.id });
    }
  }, [currentUser]);

  const { mutateAddExpense } = useAddExpense();
  const { mutateAddEarning } = useAddEarning();

  const createExpense = async (newExpense: CreateExpenseDTO) => {
    mutateAddExpense({ newExpense });

    setToggleExpenses(true);
    setMonthYear(getCurrentMonthYear());
  };

  const createEarning = async (newEarning: CreateEarningDTO) => {
    mutateAddEarning({ newEarning });

    setToggleExpenses(false);
    setMonthYear(getCurrentMonthYear());
  };

  return (
    <div>
      <Navbar
        initialUser={initialUser}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />
      {currentUser && (
        <AddDialog
          isDialogOpen={isAddDialogOpen}
          setIsDialogOpen={setIsAddDialogOpen}
          currentUser={currentUser}
          createExpense={createExpense}
          createEarning={createEarning}
          filterId={filterId}
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
      <div className="mx-1.5 mt-12">
        <section className="mx-4 flex flex-col items-center">
          <ProfileSummary
            filterId={filterId}
            monthYear={monthYear}
            currentUser={currentUser}
          />
        </section>
        <section className="mt-4 md:mt-10">
          <div className="mx-1 mt-5 mb-5">
            <MonthNavigation
              filterId={filterId}
              monthYear={monthYear}
              setMonthYear={setMonthYear}
            />
            <TransactionTabs
              toggleExpenses={toggleExpenses}
              setToggleExpenses={setToggleExpenses}
            />
            {toggleExpenses ? (
              <ExpensesList
                filterId={filterId}
                monthYear={monthYear}
                currentUser={currentUser}
                isProfile={true}
              />
            ) : (
              <EarningsList monthYear={monthYear} currentUser={currentUser} />
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
  const { t } = useTranslate();

  return (
    <div className="mx-auto flex max-w-6xl flex-col">
      <div className="inline-block min-w-full px-3 py-1 align-middle md:py-2">
        <div className="bg-theme-highlight grid grid-cols-2 gap-1 rounded-md border-2 border-black p-2 text-base font-semibold">
          <div
            onClick={() => setToggleExpenses(true)}
            className={`${toggleExpenses ? "bg-theme-main hover:bg-theme-hover border-2 border-black" : "hover:bg-theme-highlight-hover"} rounded-md p-1 text-center transition-colors hover:cursor-pointer`}
          >
            📉 {t("expenses.expenses")}
          </div>
          <div
            onClick={() => setToggleExpenses(false)}
            className={`${!toggleExpenses ? "bg-theme-main hover:bg-theme-hover border-2 border-black" : "hover:bg-theme-highlight-hover"} rounded-md p-1 text-center transition-colors hover:cursor-pointer`}
          >
            📈 {t("earnings.earnings")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
