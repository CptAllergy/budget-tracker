"use client";

import { Dispatch, SetStateAction, Suspense, useEffect, useState } from "react";
import { Navbar } from "@/components/pages/navbar/Navbar";
import {
  CreateEarningDTO,
  CreateExpenseDTO,
  ExpenseGroupDTO,
} from "@/types/DTO/dataTypes";
import ExpensesList from "@/components/pages/home/ExpensesList";
import { LuPlus } from "react-icons/lu";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser, useExpenseGroups } from "@/utils/hooks/reactQueryUser";
import { MonthNavigation } from "@/components/pages/home/TimeNavigation";
import { AddDialog } from "@/components/commons/dialogs/AddDialog";
import { ExpenseListType, MonthYearType } from "@/types/componentTypes";
import { getCurrentMonthYear } from "@/utils/utils";
import Totals from "@/components/pages/home/Totals";
import { useAddExpense } from "@/utils/hooks/reactQueryExpenses";
import { useAddEarning } from "@/utils/hooks/reactQueryEarnings";
import { User } from "@firebase/auth";

type Props = { initialUser: User | null };

const Home = ({ initialUser }: Props) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div>
      <Navbar
        initialUser={initialUser}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />
      <Suspense>
        <PageContents
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
        />
      </Suspense>
    </div>
  );
};

const PageContents = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
}: {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [filterId, setFilterId] = useState<ExpenseListType>();

  const [monthYear, setMonthYear] = useState<MonthYearType>(
    getCurrentMonthYear()
  );

  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentUser, isLoading: firebaseLoading } = useCurrentUser();
  const { expenseGroups } = useExpenseGroups(currentUser);

  // Runs after sign in to either redirect to profile page or set group
  useEffect(() => {
    const selectDefaultPage = (groups: ExpenseGroupDTO[]) => {
      if (!groups || groups.length === 0) {
        // Redirect to profile page if no groups are found
        router.push("/profile");
      } else {
        // Check if groupId provided in the URl is available
        const groupIdParam = searchParams.get("groupId");
        const groupParam = groups.find((group) => group.id === groupIdParam);

        // If groupId is not provided or not found, use the first group (favourite group)
        setFilterId({
          groupId: groupParam ? groupParam.id : groups[0].id,
        });
      }
    };

    if (currentUser && expenseGroups) {
      selectDefaultPage(expenseGroups);
    }
  }, [currentUser, expenseGroups, router, searchParams, setFilterId]);

  const { mutateAddExpense } = useAddExpense();
  const { mutateAddEarning } = useAddEarning();

  const createExpense = async (newExpense: CreateExpenseDTO) => {
    mutateAddExpense({ newExpense });

    // Navigate to page with new content
    setMonthYear(getCurrentMonthYear());
  };

  const createEarning = async (newEarning: CreateEarningDTO) => {
    mutateAddEarning({ newEarning });
  };

  return (
    <>
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
        {!firebaseLoading && currentUser && (
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
          <Totals groupId={filterId?.groupId} />
        </section>
        <section className="mt-4 md:mt-10">
          <div className="mx-1 mt-5 mb-5">
            <MonthNavigation
              filterId={filterId}
              monthYear={monthYear}
              setMonthYear={setMonthYear}
            />
            <ExpensesList
              filterId={filterId}
              monthYear={monthYear}
              currentUser={currentUser}
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
