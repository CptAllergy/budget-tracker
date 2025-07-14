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
  UserDTO,
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
import { useRouter, useSearchParams } from "next/navigation";
import { useFirebaseSetup } from "@/utils/hooks";
import MonthNavigation from "@/components/elements/home/MonthNavigation";
import { AddDialog } from "@/components/commons/dialogs/AddDialog";
import { MonthYearType } from "@/types/componentTypes";
import { getCurrentMonthYear } from "@/utils/utils";
import { Firestore } from "firebase/firestore";

// TODO check where unnecessary re-renders are occurring
// TODO consider looking into a state manager so changes to context dont cause re-renders (investigate if this is actually a problem)
// TODO add stats page (monthly, yearly)
// TODO add settings menu where user can change color of earning and expenses (red, green or grey, for a negative or neutral value)
const Home = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { db, currentUser, firebaseLoading } = useFirebaseSetup();
  return (
    <div className="">
      <Navbar
        setIsAddDialogOpen={setIsAddDialogOpen}
        currentUser={currentUser}
      />
      <Suspense>
        <PageContents
          db={db}
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          currentUser={currentUser}
          firebaseLoading={firebaseLoading}
        />
      </Suspense>
    </div>
  );
};

const PageContents = ({
  db,
  isAddDialogOpen,
  setIsAddDialogOpen,
  currentUser,
  firebaseLoading,
}: {
  db: Firestore;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: Dispatch<SetStateAction<boolean>>;
  currentUser: UserDTO | undefined;
  firebaseLoading: boolean;
}) => {
  const alertContext = useRef(useContext(AlertContext));
  const expensesContext = useContext(ExpensesContext);
  const expenseGroupsContext = useContext(ExpenseGroupsContext);

  const setExpenseDocs = useRef(expensesContext.setExpenseDocs);
  const handleFilterChange = useRef(expenseGroupsContext.handleFilterChange);

  const setExpenseGroups = useRef(expenseGroupsContext.setExpenseGroups);

  const handleGroupChange = useRef(expenseGroupsContext.handleGroupChange);

  // Used to detect new changes
  const [isChangeFound, setIsChangeFound] = useState<boolean>(false);

  const [monthYear, setMonthYear] = useState<MonthYearType>(
    getCurrentMonthYear()
  );

  const router = useRouter();
  const searchParams = useSearchParams();

  // Runs after sign in to either redirect to profile page or set group
  // TODO sometimes there is a flicker when changing from profile to home page
  useEffect(() => {
    const selectDefaultPage = (groups: ExpenseGroupDTO[]) => {
      if (!groups || groups.length === 0) {
        // Redirect to profile page if no groups are found
        router.push("/profile");
      } else {
        // Check if groupId provided in the URl is available
        const groupIdParam = searchParams.get("groupId");
        const groupParam = groups.find((group) => group.id === groupIdParam);

        try {
          // If groupId is not provided or not found, use the first group (favourite group)
          handleFilterChange.current(
            {
              groupId: groupParam ? groupParam.id : groups[0].id,
              groupName: groupParam ? groupParam.name : groups[0].name,
            },
            groups
          );
        } catch (error) {
          toggleStatusErrorAlert(alertContext.current, "GENERIC", error);
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
        .catch((error) =>
          toggleStatusErrorAlert(alertContext.current, "GENERIC", error)
        );
    }
  }, [currentUser, db, router, searchParams]);

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
      // Navigate to page with new content
      setMonthYear(getCurrentMonthYear());

      toggleStatusAlert(alertContext.current, "New expense created");
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED", error);
      throw "Error adding new expense";
    }
  };

  const createEarning = async (newEarning: CreateEarningDTO) => {
    try {
      await postEarningFirebase(db, newEarning, () => {});

      toggleStatusAlert(
        alertContext.current,
        "New earning added to your profile"
      );
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED", error);
      throw "Error adding new earning";
    }
  };

  return (
    <>
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
    </>
  );
};

export default Home;
