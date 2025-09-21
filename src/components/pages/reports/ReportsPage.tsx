"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/pages/navbar/Navbar";
import { useCurrentUser, useExpenseGroups } from "@/utils/hooks/reactQueryUser";
import {
  ExpenseListType,
  MonthlyTransactionTotal,
  MonthYearType,
} from "@/types/componentTypes";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  Dot,
  DotProps,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExpenseDTO, ExpenseGroupDTO, UserDTO } from "@/types/DTO/dataTypes";
import { EXPENSE_CATEGORIES } from "@/types/transactionFilterTypes";
import { YearNavigation } from "@/components/pages/home/MonthNavigation";
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
import { format } from "date-fns";
import "ldrs/react/Ring2.css";
import { Ring2 } from "ldrs/react";
import {
  useExpenses,
  useMonthlyExpenseTotal,
} from "@/utils/hooks/reactQueryExpenses";
import {
  useEarnings,
  useMonthlyEarningTotal,
} from "@/utils/hooks/reactQueryEarnings";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { User } from "@firebase/auth";

type Props = { initialUser: User | null };
// TODO add a bar graph alternative to the pie chart, should make some months easier to read
// TODO add a flag to include or remove investments from the pie chart
// TODO split this code into smaller components
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

  const { currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const {
    expenseGroups,
    isLoading: isLoadingGroups,
    isSuccess,
  } = useExpenseGroups(currentUser);

  // Set filter to current currentUser
  useEffect(() => {
    if (currentUser) {
      setFilterId({ userId: currentUser.id });
    }
  }, [currentUser]);

  if (isLoadingUser || isLoadingGroups) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mx-1.5 mt-12">
        {isSuccess && (
          <>
            <section className="mt-4 md:mt-10">
              <div className="mx-1 mt-5 mb-5">
                <FilterSelector
                  currentUser={currentUser!}
                  expenseGroups={expenseGroups!}
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
          </>
        )}
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
  const { t } = useTranslate();
  const {
    expenses,
    isLoading: isLoadingExpenses,
    isPlaceholderData,
    isEnabled,
  } = useExpenses(filterId, monthYear, true);

  if (isLoadingExpenses && !isPlaceholderData) {
    return <div>{t("reports.loading")}</div>;
  }

  return (
    <DonutPieChart
      expenses={expenses && isEnabled ? expenses : []}
      monthYear={monthYear}
      setMonthYear={setMonthYear}
      selectedYear={selectedYear}
    />
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
  const { t } = useTranslate();
  const { earnings, isLoading: isLoadingEarnings } = useEarnings(
    filterId?.userId,
    monthYear
  );

  const {
    expenses,
    isLoading: isLoadingExpenses,
    isPlaceholderData,
    isEnabled,
  } = useExpenses(filterId, monthYear, true);

  if (isLoadingEarnings && !isPlaceholderData) {
    return <div>{t("reports.loading")}</div>;
  }

  return (
    <DonutPieChart
      expenses={expenses && isEnabled ? expenses : []}
      monthYear={monthYear}
      selectedYear={selectedYear}
      setMonthYear={setMonthYear}
    />
  );
};

const YearlyExpenseChart = ({
  filterId,
  year,
  monthYear,
  setMonthYear,
}: {
  filterId?: ExpenseListType;
  year: number;
  monthYear?: MonthYearType;
  setMonthYear: Dispatch<SetStateAction<MonthYearType | undefined>>;
}) => {
  const { t } = useTranslate();
  const {
    monthlyExpenseTotals,
    isLoading: isLoadingExpenses,
    isFetching: isFetchingExpenses,
  } = useMonthlyExpenseTotal(year, filterId);

  const {
    monthlyEarningTotals,
    isLoading: isLoadingEarnings,
    isFetching: isFetchingEarnings,
    isEnabled: isEnabledEarnings,
  } = useMonthlyEarningTotal(year, filterId?.userId);

  if (
    (isLoadingExpenses || isLoadingEarnings) &&
    (!monthlyExpenseTotals || !monthlyEarningTotals)
  ) {
    return <div>{t("reports.yearLoading")}</div>;
  }

  if (!monthlyExpenseTotals) {
    return <div>{t("reports.yearEmpty")}</div>;
  }

  const testTotals: MonthlyTransactionTotal[] = monthlyExpenseTotals.map(
    (expenseTotal, index) => {
      const totalEarning =
        monthlyEarningTotals && isEnabledEarnings
          ? monthlyEarningTotals[index].totalEarnings
          : 0;
      return {
        month: expenseTotal.month,
        totalExpenses: expenseTotal.totalExpenses,
        totalEarnings: totalEarning,
      };
    }
  );

  const chartConfig = {
    totalExpenses: {
      label: t("expenses.expenses"),
      color: "var(--chart-1)",
    },
    totalEarnings: {
      label: t("earnings.earnings"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  interface CustomDotProps extends DotProps {
    payload?: any;
  }

  const SelectedDot = (props: CustomDotProps) => {
    const { cx, cy, stroke, payload } = props;

    const dotMonth: number | undefined = payload?.month;

    if (dotMonth != null && dotMonth === monthYear?.month) {
      return (
        <Dot
          cx={cx}
          cy={cy}
          r={3}
          fill={stroke}
          stroke={stroke}
          strokeWidth={2}
        />
      );
    }

    return false;
  };

  return (
    <Card className="bg-theme-highlight border-0 shadow-none outline-none">
      <CardHeader className="px-4 md:px-6">
        <CardTitle>{t("reports.yearChart")}</CardTitle>
        <CardDescription className="relative">
          {year}
          {(isFetchingExpenses || isFetchingEarnings) && (
            <div className="absolute right-5">
              <Ring2
                size="30"
                stroke="5"
                strokeLength="0.25"
                bgOpacity="0.1"
                speed="0.9"
                color="gray"
              />
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={testTotals}
            margin={{
              left: 12,
              right: 12,
            }}
            onClick={(chartEvent) => {
              // Only handle clicks on actual data points
              if (
                chartEvent &&
                chartEvent.activePayload &&
                chartEvent.activePayload.length > 0
              ) {
                const clickedPoint = chartEvent.activeLabel;
                setMonthYear({ year: year, month: Number(clickedPoint) });
              }
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(new Date(year, value, 1), "LLL")}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="totalExpenses"
              type="monotone"
              stroke="var(--color-totalExpenses)"
              strokeWidth={2}
              dot={<SelectedDot />}
            />
            <Line
              dataKey="totalEarnings"
              type="monotone"
              stroke="var(--color-totalEarnings)"
              strokeWidth={2}
              dot={<SelectedDot />}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const DonutPieChart = ({
  expenses,
  monthYear,
  selectedYear,
  setMonthYear,
}: {
  expenses: ExpenseDTO[];
  monthYear?: MonthYearType;
  selectedYear: number;
  setMonthYear: Dispatch<SetStateAction<MonthYearType | undefined>>;
}) => {
  const { t, getFnsLocale } = useTranslate();
  type ExpenseChartData = {
    category: string;
    amount: number;
    fill: string;
  };

  const chartData = useMemo(() => {
    const buildExpenseChartData = (
      expenses: ExpenseDTO[]
    ): ExpenseChartData[] => {
      // Aggregate amounts by category
      const categoryTotals = expenses.reduce<Record<string, number>>(
        (acc, expense) => {
          const cat = expense.category ?? "other";
          acc[cat] = (acc[cat] ?? 0) + expense.amount;
          return acc;
        },
        {}
      );

      const chartData = Object.entries(categoryTotals).map(
        ([category, amount]) => ({
          category,
          amount,
          fill: `var(--color-${category})`,
        })
      );

      // Ensure all categories are represented, even if they have 0 amount
      EXPENSE_CATEGORIES.map((category) => {
        if (!chartData.some((data) => data.category === category)) {
          chartData.push({
            category,
            amount: 0,
            fill: `var(--color-${category})`,
          });
        }
      });

      // Sort categories alphabetically so that the chart animation is consistent
      chartData.sort((a, b) => a.category.localeCompare(b.category));

      // TODO might want to make this filter optional since it can take up so much space
      return chartData.filter((data) => data.category !== "investments");
    };

    return buildExpenseChartData(expenses);
  }, [expenses]);

  const chartConfig = {
    amount: {
      label: t("form.amount"),
    },
    other: {
      label: t("expenses.categories.other"),
      color: "var(--chart-other)",
    },
    groceries: {
      label: t("expenses.categories.groceries"),
      color: "var(--chart-groceries)",
    },
    dining: {
      label: t("expenses.categories.dining"),
      color: "var(--chart-dining)",
    },
    transportation: {
      label: t("expenses.categories.transportation"),
      color: "var(--chart-transportation)",
    },
    investments: {
      label: t("expenses.categories.investments"),
      color: "var(--chart-investments)",
    },
    gifts: {
      label: t("expenses.categories.gifts"),
      color: "var(--chart-gifts)",
    },
    housingUtilities: {
      label: t("expenses.categories.housingUtilities"),
      color: "var(--chart-housingUtilities)",
    },
    homeGoods: {
      label: t("expenses.categories.homeGoods"),
      color: "var(--chart-homeGoods)",
    },
    health: {
      label: t("expenses.categories.health"),
      color: "var(--chart-health)",
    },
    entertainment: {
      label: t("expenses.categories.entertainment"),
      color: "var(--chart-entertainment)",
    },
    personalCare: {
      label: t("expenses.categories.personalCare"),
      color: "var(--chart-personalCare)",
    },
    repairs: {
      label: t("expenses.categories.repairs"),
      color: "var(--chart-repairs)",
    },
    personalSpending: {
      label: t("expenses.categories.personalSpending"),
      color: "var(--chart-personalSpending)",
    },
  } satisfies ChartConfig;

  const totalAmount = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [chartData]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <Card className="bg-theme-highlight flex flex-col border-0 shadow-none outline-none">
      <CardHeader className="items-center px-4 pb-0 md:px-6">
        <CardTitle>{t("reports.monthChart")}</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-1">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                asChild
                className={`bg-theme-highlight hover:bg-theme-highlight-hover rounded-md border-2 border-black p-1 text-center transition-colors outline-none hover:cursor-pointer`}
              >
                <button className="flex items-center justify-center gap-1 px-2 capitalize">
                  <span>
                    {monthYear
                      ? `${format(
                          new Date(monthYear.year, monthYear.month, 1),
                          "LLLL",
                          {
                            locale: getFnsLocale(),
                          }
                        )}`
                      : t("reports.selectMonth")}
                  </span>
                  <LuChevronDown />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-36">
                <DropdownMenuRadioGroup value={monthYear?.month.toString()}>
                  {months.map((month) => (
                    <DropdownMenuRadioItem
                      key={month}
                      value={month.toString()}
                      onClick={() =>
                        setMonthYear({
                          month: month,
                          year: selectedYear,
                        })
                      }
                      className="capitalize"
                    >
                      {format(new Date(selectedYear, month, 1), "LLLL", {
                        locale: getFnsLocale(),
                      })}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedYear}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {expenses.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {formatNumber(totalAmount)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            € Spent
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          monthYear?.month != null && (
            <p className="text-sm">{t("reports.monthEmpty")}</p>
          )
        )}
      </CardContent>
    </Card>
  );
};

const FilterSelector = ({
  currentUser,
  expenseGroups,
  setFilterId,
}: {
  currentUser: UserDTO;
  expenseGroups: ExpenseGroupDTO[];
  setFilterId: Dispatch<SetStateAction<ExpenseListType | undefined>>;
}) => {
  const { t } = useTranslate();
  const [filterName, setFilterName] = useState("profile");

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
