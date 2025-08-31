"use client";

import {
  Dispatch,
  SetStateAction,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Navbar } from "@/components/elements/navbar/Navbar";
import {
  CreateEarningDTO,
  CreateExpenseDTO,
  ExpenseGroupDTO,
} from "@/types/DTO/dataTypes";
import ExpensesList from "@/components/elements/home/ExpensesList";
import { AlertContext } from "@/contexts/AlertContext";
import NewChanges from "@/components/elements/home/NewChanges";
import { LuPlus } from "react-icons/lu";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser, useExpenseGroups } from "@/utils/hooks/reactQuery";
import { MonthNavigation } from "@/components/elements/home/MonthNavigation";
import { AddDialog } from "@/components/commons/dialogs/AddDialog";
import {
  ExpenseListType,
  MonthYearType,
  SetState,
} from "@/types/componentTypes";
import { getCurrentMonthYear } from "@/utils/utils";
import Totals from "@/components/elements/home/Totals";
import { useAddExpense, useExpenses } from "@/utils/hooks/reactQueryExpenses";
import { useAddEarning } from "@/utils/hooks/reactQueryEarnings";

// TODO add settings menu where currentUser can change color of earning and expenses (red, green or grey, for a negative or neutral value)
// TODO Add translations
// TODO go over the whole props passing chain and check if any improper defaults are being used
const Home = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterId, setFilterId] = useState<ExpenseListType>();

  return (
    <div>
      <Navbar setIsAddDialogOpen={setIsAddDialogOpen} />
      <Suspense>
        <PageContents
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          filterIdState={[filterId, setFilterId]}
        />
      </Suspense>
    </div>
  );
};

const PageContents = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  filterIdState,
}: {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: Dispatch<SetStateAction<boolean>>;
  filterIdState: [
    ExpenseListType | undefined,
    SetState<ExpenseListType | undefined>,
  ];
}) => {
  const alertContext = useRef(useContext(AlertContext));
  const [filterId, setFilterId] = filterIdState;

  // Used to detect new changes
  const [isChangeFound, setIsChangeFound] = useState<boolean>(false);

  const [monthYear, setMonthYear] = useState<MonthYearType>(
    getCurrentMonthYear()
  );

  const router = useRouter();
  const searchParams = useSearchParams();

  const { currentUser, isLoading: firebaseLoading } = useCurrentUser();
  const { expenseGroups, error, isLoading } = useExpenseGroups(currentUser);

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

  const {
    expenses,
    isLoading: isLoadingExpenses,
    isPlaceholderData,
    isEnabled,
  } = useExpenses(filterId, monthYear);

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
      <div className="right sticky top-0 z-10 ml-auto flex w-max justify-end">
        <NewChanges
          isChangeFound={isChangeFound}
          setIsChangeFound={setIsChangeFound}
        />
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
      <div className="mx-1.5 -mt-12">
        <section className="mx-4 flex flex-col items-center">
          <Totals groupId={filterId?.groupId} />
        </section>
        <section className="mt-4 md:mt-10">
          <div className="mx-1 mt-5 mb-5">
            <MonthNavigation
              monthYear={monthYear}
              setMonthYear={setMonthYear}
            />
            <ExpensesList expenses={expenses} currentUser={currentUser} />
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
