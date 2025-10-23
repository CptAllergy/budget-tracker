import { ExpenseDTO } from "@/types/DTO/dataTypes";
import { ExpenseListType, MonthYearType } from "@/types/componentTypes";
import { Dispatch, SetStateAction, useContext, useMemo } from "react";
import { useTranslate } from "@/utils/hooks/useTranslation";
import {
  EXPENSE_CATEGORIES,
  ExpenseCategory,
} from "@/types/transactionFilterTypes";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/commons/charts/Chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/commons/charts/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/commons/menus/ShadDropdownMenu";
import { format } from "date-fns";
import { LuChevronDown } from "react-icons/lu";
import { Label, Pie, PieChart } from "recharts";
import { useExpenses } from "@/utils/hooks/reactQueryExpenses";
import "ldrs/react/Ring2.css";
import { SettingsContext } from "@/contexts/SettingsContext";

type ExpenseChartData = {
  category: string;
  amount: number;
  fill: string;
};

export const MonthlyPieChart = ({
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
  const { t } = useTranslate();

  const {
    expenses,
    isLoading: isLoadingExpenses,
    isPlaceholderData,
    isEnabled,
  } = useExpenses(filterId, monthYear, true);

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

  return (
    <MonthlyPieChartContent
      expenses={expenses && isEnabled ? expenses : []}
      monthYear={monthYear}
      setMonthYear={setMonthYear}
      setPressedCategory={setPressedCategory}
      selectedYear={selectedYear}
      chartConfig={chartConfig}
      isPending={isLoadingExpenses && !isPlaceholderData}
    />
  );
};

const MonthlyPieChartContent = ({
  expenses,
  monthYear,
  selectedYear,
  setMonthYear,
  setPressedCategory,
  chartConfig,
  isPending,
}: {
  expenses: ExpenseDTO[];
  monthYear?: MonthYearType;
  selectedYear: number;
  setMonthYear: Dispatch<SetStateAction<MonthYearType | undefined>>;
  setPressedCategory: (pressedCategory?: {
    category: ExpenseCategory;
    monthYear: MonthYearType;
  }) => void;
  chartConfig: ChartConfig;
  isPending?: boolean;
}) => {
  const { t } = useTranslate();
  const { isInvestmentExpense } = useContext(SettingsContext);

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

      return isInvestmentExpense
        ? chartData
        : chartData.map((data) =>
            data.category === "investments" ? { ...data, amount: 0 } : data
          );
    };

    return buildExpenseChartData(expenses);
  }, [expenses, isInvestmentExpense]);

  const totalAmount = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [chartData]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

  return (
    <Card className="bg-theme-highlight flex flex-col border-0 shadow-none outline-none">
      <MonthlyChartHeader
        monthYear={monthYear}
        selectedYear={selectedYear}
        setMonthYear={setMonthYear}
      />
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
                className="cursor-pointer"
                onClick={(chartEvent) => {
                  // Only handle clicks on actual data points
                  if (chartEvent && chartEvent.category) {
                    if (
                      typeof chartEvent.category === "string" &&
                      EXPENSE_CATEGORIES.includes(chartEvent.category) &&
                      monthYear
                    ) {
                      setPressedCategory({
                        category: chartEvent.category as ExpenseCategory,
                        monthYear,
                      });
                    }
                  }
                }}
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
                          className="cursor-default"
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
                            € {t("reports.spent")}
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
          !isPending &&
          monthYear?.month != null && (
            <p className="text-sm">{t("reports.monthEmpty")}</p>
          )
        )}
      </CardContent>
    </Card>
  );
};

const MonthlyChartHeader = ({
  monthYear,
  selectedYear,
  setMonthYear,
}: {
  monthYear?: MonthYearType;
  selectedYear: number;
  setMonthYear: Dispatch<SetStateAction<MonthYearType | undefined>>;
}) => {
  const { t, getFnsLocale } = useTranslate();

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
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
  );
};
