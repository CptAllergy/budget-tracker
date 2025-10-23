"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
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
} from "@/components/commons/menus/ShadDropdownMenu";
import { LuChevronDown } from "react-icons/lu";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { User } from "@firebase/auth";
import { YearlyExpenseChart } from "@/components/pages/reports/YearlyExpenseChart";
import { MonthlyPieChart } from "@/components/pages/reports/MonthlyPieChart";
import { FilterSelectorLoading } from "@/components/loading/elements/home/LoadingHome";
import QueryExpenseList from "@/components/pages/reports/QueryExpenseList";
import { ExpenseCategory } from "@/types/transactionFilterTypes";

type Props = { initialUser: User | null };
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
  // Used to apply category query when clicking on monthly chart
  const [pressedCategory, setPressedCategory] = useState<{
    category: ExpenseCategory;
    monthYear: MonthYearType;
  }>();

  const { currentUser } = useCurrentUser();
  const { expenseGroups } = useExpenseGroups(currentUser);

  // Set filter to current currentUser
  useEffect(() => {
    if (currentUser) {
      setFilterId({ userId: currentUser.id });
    }
  }, [currentUser]);

  useEffect(() => {
    if (year || monthYear) {
      setPressedCategory(undefined);
    }
  }, [year, monthYear]);

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
                  <MonthlyExpenseReport
                    filterId={filterId}
                    monthYear={monthYear}
                    selectedYear={year}
                    setMonthYear={setMonthYear}
                    setPressedCategory={setPressedCategory}
                  />
                </div>
              </div>
            </div>
            <QueryExpenseList
              currentUser={currentUser}
              filterId={filterId}
              currentYear={year}
              lastPressedCategory={pressedCategory}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const MonthlyExpenseReport = ({
  filterId,
  monthYear,
  selectedYear,
  setMonthYear,
  setPressedCategory,
}: {
  filterId?: ExpenseListType;
  monthYear?: MonthYearType;
  selectedYear: number;
  setMonthYear: Dispatch<SetStateAction<MonthYearType | undefined>>;
  setPressedCategory: (pressedCategory?: {
    category: ExpenseCategory;
    monthYear: MonthYearType;
  }) => void;
}) => {
  return (
    <div className="aspect-[16/9]">
      <MonthlyPieChart
        filterId={filterId}
        monthYear={monthYear}
        setMonthYear={setMonthYear}
        selectedYear={selectedYear}
        setPressedCategory={setPressedCategory}
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
    return <FilterSelectorLoading />;
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
