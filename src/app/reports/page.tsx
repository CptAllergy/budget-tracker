"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/elements/navbar/Navbar";
import {
  useCurrentUser,
  useEarnings,
  useExpenseGroups,
  useExpenses,
  useMonthlyExpenseTotal,
} from "@/utils/hooks/reactQuery";
import {
  ExpenseListType,
  MonthlyEarningTotal,
  MonthlyTransactionTotal,
  MonthYearType,
} from "@/types/componentTypes";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CartesianGrid,
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ExpenseDTO, ExpenseGroupDTO, UserDTO } from "@/types/DTO/dataTypes";
import { EXPENSE_CATEGORIES } from "@/types/transactionFilterTypes";
import { YearNavigation } from "@/components/elements/home/MonthNavigation";
import { rancho } from "@/styles/fonts";

// TODO make reports page look good
// TODO add a bar graph alternative to the pie chart, should make some months easier to read
// TODO add a flag to include or remove investments from the pie chart
const Reports = () => {
  return (
    <div>
      <Navbar />
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
    error,
    isLoading: isLoadingGroups,
    isSuccess,
  } = useExpenseGroups(currentUser);

  // Set filter to current user
  useEffect(() => {
    if (currentUser) {
      setFilterId({ userId: currentUser.id });
    }
  }, [currentUser]);

  if (isLoadingUser || isLoadingGroups) {
    return <div>Loading...</div>;
  }

  // TODO change the filterId selection to a tabs/dropdown combo
  return (
    <div>
      <div className="mx-3 mt-12">
        {isSuccess && (
          <>
            <section className="mx-4 flex flex-col items-center">
              <ReportsHeader
                currentUser={currentUser!}
                expenseGroups={expenseGroups!}
                setFilterId={setFilterId}
              />
            </section>
            <section className="mt-4 md:mt-10">
              <div className="mx-1 mt-5 mb-5">
                <ReportTabs toggleReport={true} setToggleReport={() => {}} />
                <YearNavigation
                  year={year}
                  setYear={setYear}
                  setMonthYear={setMonthYear}
                />
                <div className="mx-auto flex max-w-6xl flex-col">
                  <div className="inline-block min-w-full px-3 py-1 align-middle md:py-2">
                    <div className="bg-theme-highlight grid grid-cols-2 gap-1 rounded-md border-2 border-black p-2 text-base font-semibold">
                      <YearlyExpenseChart
                        filterId={filterId}
                        year={year}
                        setMonthYear={setMonthYear}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {filterId?.groupId && (
          <ExpenseGroupReports filterId={filterId} monthYear={monthYear} />
        )}
        {filterId?.userId && (
          <ProfileReports filterId={filterId} monthYear={monthYear} />
        )}
      </div>
    </div>
  );
};

const ReportsHeader = ({
  currentUser,
  expenseGroups,
  setFilterId,
}: {
  currentUser: UserDTO;
  expenseGroups: ExpenseGroupDTO[];
  setFilterId: Dispatch<SetStateAction<ExpenseListType | undefined>>;
}) => {
  return (
    <div
      className={`${rancho.className} bg-theme-secondary w-full max-w-4xl rounded-md border-2 border-black py-2 text-center text-2xl shadow-[5px_5px_0px_rgba(0,0,0,1)] md:text-2xl`}
    >
      <>
        <div
          className="bg-white hover:cursor-pointer hover:bg-gray-300"
          onClick={() => setFilterId({ userId: currentUser.id })}
        >
          Profile
        </div>
        {expenseGroups.map((expenseGroup) => (
          <div
            key={expenseGroup.id}
            className="bg-white hover:cursor-pointer hover:bg-gray-300"
            onClick={() =>
              setFilterId({
                groupId: expenseGroup.id,
                groupName: expenseGroup.name,
              })
            }
          >
            {expenseGroup.name}
          </div>
        ))}
      </>
    </div>
  );
};

const ExpenseGroupReports = ({
  filterId,
  monthYear,
}: {
  filterId?: ExpenseListType;
  monthYear?: MonthYearType;
}) => {
  const { expenses, isLoading: isLoadingExpenses } = useExpenses(
    filterId,
    monthYear
  );

  if (isLoadingExpenses) {
    return <div>Loading expenses...</div>;
  }

  if (expenses?.length === 0) {
    return <div>No expenses found for the selected period.</div>;
  }

  return (
    <div className="mx-20 mt-12">
      <DonutPieChart expenses={expenses ?? []} />
    </div>
  );
};

const ProfileReports = ({
  filterId,
  monthYear,
}: {
  filterId?: ExpenseListType;
  monthYear?: MonthYearType;
}) => {
  const { earnings, isLoading: isLoadingEarnings } = useEarnings(
    filterId?.userId,
    monthYear
  );

  const { expenses, isLoading: isLoadingExpenses } = useExpenses(
    filterId,
    monthYear
  );

  if (isLoadingEarnings) {
    return <div>Loading earnings...</div>;
  }

  if (expenses?.length === 0) {
    return <div>No expenses found for the selected period.</div>;
  }

  return (
    <div className="mx-20 mt-12">
      <DonutPieChart expenses={expenses ?? []} />
    </div>
  );
};

const YearlyExpenseChart = ({
  filterId,
  year,
  setMonthYear,
}: {
  filterId?: ExpenseListType;
  year: number;
  setMonthYear: Dispatch<SetStateAction<MonthYearType | undefined>>;
}) => {
  const { monthlyExpenseTotals, isLoading } = useMonthlyExpenseTotal(
    year,
    filterId
  );

  const testEarnings: MonthlyEarningTotal[] = [
    { month: 0, totalEarnings: 1000 },
    { month: 1, totalEarnings: 1200 },
    { month: 2, totalEarnings: 800 },
    { month: 3, totalEarnings: 1500 },
    { month: 4, totalEarnings: 900 },
    { month: 5, totalEarnings: 1100 },
    { month: 6, totalEarnings: 1300 },
    { month: 7, totalEarnings: 1400 },
    { month: 8, totalEarnings: 1600 },
    { month: 9, totalEarnings: 1700 },
    { month: 10, totalEarnings: 1800 },
    { month: 11, totalEarnings: 1900 },
  ];

  if (isLoading) {
    return <div>Loading monthly expenses...</div>;
  }

  if (!monthlyExpenseTotals) {
    return <div>No monthly expense totals found for the selected period.</div>;
  }

  const testTotals: MonthlyTransactionTotal[] = monthlyExpenseTotals.map(
    (expenseTotal, index) => {
      const earningsTotal = testEarnings[index]?.totalEarnings;
      return {
        month: expenseTotal.month,
        totalExpenses: expenseTotal.totalExpenses,
        totalEarnings: earningsTotal,
      };
    }
  );

  const chartConfig = {
    totalExpenses: {
      label: "Expenses",
      color: "var(--chart-1)",
    },
    totalEarnings: {
      label: "Earnings",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart - Gradient</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
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
                console.log("Clicked data point:", clickedPoint);

                // Example: navigate somewhere or open a modal
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
              tickFormatter={(value) => value}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="totalExpenses"
              type="monotone"
              stroke="var(--color-totalExpenses)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="totalEarnings"
              type="monotone"
              stroke="var(--color-totalEarnings)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const DonutPieChart = ({ expenses }: { expenses: ExpenseDTO[] }) => {
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

      // TODO might want to make this filter optional
      return chartData.filter((data) => data.category !== "investments");
    };

    return buildExpenseChartData(expenses);
  }, [expenses]);

  const chartConfig = {
    amount: {
      label: "AMOUNT!! what is this even??",
    },
    other: {
      label: "Other",
      color: "var(--chart-other)",
    },
    groceries: {
      label: "Groceries",
      color: "var(--chart-groceries)",
    },
    dining: {
      label: "Dining",
      color: "var(--chart-dining)",
    },
    transportation: {
      label: "Transportation",
      color: "var(--chart-transportation)",
    },
    investments: {
      label: "Investments",
      color: "var(--chart-investments)",
    },
    gifts: {
      label: "Gifts",
      color: "var(--chart-gifts)",
    },
    housingUtilities: {
      label: "Housing & Utilities",
      color: "var(--chart-housingUtilities)",
    },
    health: {
      label: "Health",
      color: "var(--chart-health)",
    },
    entertainment: {
      label: "Entertainment",
      color: "var(--chart-entertainment)",
    },
    personalCare: {
      label: "Personal Care",
      color: "var(--chart-personalCare)",
    },
    repairs: {
      label: "Repairs",
      color: "var(--chart-repairs)",
    },
    personalSpending: {
      label: "Personal Spending",
      color: "var(--chart-personalSpending)",
    },
  } satisfies ChartConfig;

  const totalAmount = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Donut with Text</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          {/*TODO setting key to a different value will reload the component and add the animation we want*/}
          <PieChart key={1}>
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
                          {Number(totalAmount.toFixed(0)).toLocaleString()}
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
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

const ReportTabs = ({
  toggleReport,
  setToggleReport,
}: {
  toggleReport: boolean;
  setToggleReport: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="mx-auto flex max-w-6xl flex-col">
      <div className="inline-block min-w-full px-3 py-1 align-middle md:py-2">
        <div className="bg-theme-highlight grid grid-cols-2 gap-1 rounded-md border-2 border-black p-2 text-base font-semibold">
          <div
            onClick={() => setToggleReport(true)}
            className={`${toggleReport ? "bg-theme-main hover:bg-theme-hover border-2 border-black" : "hover:bg-theme-highlight-hover"} rounded-md p-1 text-center transition-colors hover:cursor-pointer`}
          >
            Profile
          </div>
          <div
            onClick={() => setToggleReport(false)}
            className={`${!toggleReport ? "bg-theme-main hover:bg-theme-hover border-2 border-black" : "hover:bg-theme-highlight-hover"} rounded-md p-1 text-center transition-colors hover:cursor-pointer`}
          >
            Groups V
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
