"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Navbar } from "@/components/pages/navbar/Navbar";
import { useCurrentUser, useExpenseGroups } from "@/utils/hooks/reactQueryUser";
import { ExpenseListType, MonthYearType } from "@/types/componentTypes";
import { ExpenseGroupDTO, UserDTO } from "@/types/DTO/dataTypes";
import { YearNavigation } from "@/components/pages/home/TimeNavigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LuChevronDown } from "react-icons/lu";
import "ldrs/react/Ring2.css";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { User } from "@firebase/auth";
import { YearlyExpenseChart } from "@/components/pages/reports/YearlyExpenseChart";
import { MonthlyPieChart } from "@/components/pages/reports/MonthlyPieChart";
import { TotalsLoading } from "@/components/loading/elements/home/LoadingHome";

type Props = { initialUser: User | null };
// TODO add a flag to include or remove investments from the pie chart
const Reports = ({ initialUser }: Props) => {
  return (
    <div>
      <Navbar initialUser={initialUser} />
      <ReportsContent />
    </div>
  );
};

const ReportsContent = () => {
  const [monthYear, setMonthYear] = useState<MonthYearType>();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [filterId, setFilterId] = useState<ExpenseListType>();

  const { currentUser } = useCurrentUser();
  const { expenseGroups } = useExpenseGroups(currentUser);

  // Set filter to current currentUser
  useEffect(() => {
    if (currentUser) {
      setFilterId({ userId: currentUser.id });
    }
  }, [currentUser]);

  return (
    <div>
      <div className="mx-1.5 mt-12">
        <section className="mt-4 md:mt-10">
          <div className="mx-1 mt-5 mb-5">
            <FilterSelector
              currentUser={currentUser}
              expenseGroups={expenseGroups}
              setFilterId={setFilterId}
            />
            <YearNavigation
              year={year}
              setYear={setYear}
              setMonthYear={setMonthYear}
            />
            <div className="mx-auto flex max-w-6xl flex-col">
              <div className="inline-block min-w-full px-3 py-1 align-middle md:py-2">
                <div className="bg-theme-highlight grid grid-cols-1 rounded-md border-2 border-black text-base font-semibold md:grid-cols-2">
                  <YearlyExpenseChart
                    filterId={filterId}
                    year={year}
                    monthYear={monthYear}
                    setMonthYear={setMonthYear}
                  />
                  {filterId?.groupId && (
                    <ExpenseGroupReports
                      filterId={filterId}
                      monthYear={monthYear}
                      selectedYear={year}
                      setMonthYear={setMonthYear}
                    />
                  )}
                  {filterId?.userId && (
                    <ProfileReports
                      filterId={filterId}
                      monthYear={monthYear}
                      selectedYear={year}
                      setMonthYear={setMonthYear}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const ExpenseGroupReports = ({
  filterId,
  monthYear,
  selectedYear,
  setMonthYear,
}: {
  filterId?: ExpenseListType;
  monthYear?: MonthYearType;
  selectedYear: number;
  setMonthYear: Dispatch<SetStateAction<MonthYearType | undefined>>;
}) => {
  return (
    <div className="aspect-[16/9]">
      <MonthlyPieChart
        filterId={filterId}
        monthYear={monthYear}
        setMonthYear={setMonthYear}
        selectedYear={selectedYear}
      />
    </div>
  );
};

// TODO add earnings report
const ProfileReports = ({
  filterId,
  monthYear,
  selectedYear,
  setMonthYear,
}: {
  filterId?: ExpenseListType;
  monthYear?: MonthYearType;
  selectedYear: number;
  setMonthYear: Dispatch<SetStateAction<MonthYearType | undefined>>;
}) => {
  return (
    <div className="aspect-[16/9]">
      <MonthlyPieChart
        filterId={filterId}
        monthYear={monthYear}
        selectedYear={selectedYear}
        setMonthYear={setMonthYear}
      />
    </div>
  );
};

const FilterSelector = ({
  currentUser,
  expenseGroups,
  setFilterId,
}: {
  currentUser?: UserDTO;
  expenseGroups?: ExpenseGroupDTO[];
  setFilterId: Dispatch<SetStateAction<ExpenseListType | undefined>>;
}) => {
  const { t } = useTranslate();
  const [filterName, setFilterName] = useState("profile");

  if (!currentUser || !expenseGroups) {
    return <TotalsLoading />;
  }

  if (expenseGroups.length === 0) {
    // No need to show the filter if there are no options
    return;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col">
      <div className="inline-block min-w-full px-3 py-1 align-middle md:py-2">
        <div className="bg-theme-highlight rounded-md border-2 border-black p-2 text-base font-semibold">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              asChild
              className={`bg-theme-main hover:bg-theme-hover w-full rounded-md border-2 border-black p-1 text-center transition-colors outline-none hover:cursor-pointer`}
            >
              <button className="flex items-center justify-center gap-1 px-2">
                <span className="first-letter:uppercase">
                  {filterName === "profile" ? t("reports.profile") : filterName}
                </span>
                <LuChevronDown />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>{t("reports.filter")}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filterName}
                onValueChange={setFilterName}
              >
                <DropdownMenuRadioItem
                  value="profile"
                  onClick={() => setFilterId({ userId: currentUser.id })}
                >
                  {t("reports.profile")}
                </DropdownMenuRadioItem>
                {expenseGroups.length > 0 && <DropdownMenuSeparator />}
                {expenseGroups.map((expenseGroup) => (
                  <DropdownMenuRadioItem
                    key={expenseGroup.id}
                    value={expenseGroup.name}
                    onClick={() =>
                      setFilterId({
                        groupId: expenseGroup.id,
                      })
                    }
                  >
                    {expenseGroup.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Reports;
