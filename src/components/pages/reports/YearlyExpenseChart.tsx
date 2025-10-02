import {
  ExpenseListType,
  MonthlyEarningTotal,
  MonthlyExpenseTotal,
  MonthlyTransactionTotal,
  MonthYearType,
} from "@/types/componentTypes";
import { Dispatch, SetStateAction, useMemo } from "react";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { useMonthlyTransactionTotals } from "@/utils/hooks/reactQueryUser";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Dot, DotProps, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ring2 } from "ldrs/react";
import { format } from "date-fns";
import "ldrs/react/Ring2.css";

export const YearlyExpenseChart = ({
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
  const {
    monthlyTransactionTotals: totals,
    isLoading,
    isFetching,
    isEarningEnabled,
  } = useMonthlyTransactionTotals(year, filterId);

  if (isLoading || !totals) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center">
        <Ring2
          size="30"
          stroke="5"
          strokeLength="0.25"
          bgOpacity="0.1"
          speed="0.9"
          color="gray"
        />
      </div>
    );
  }

  return (
    <YearlyExpenseChartContent
      totals={totals}
      year={year}
      monthYear={monthYear}
      setMonthYear={setMonthYear}
      isFetching={isFetching}
      isEarningEnabled={isEarningEnabled}
    />
  );
};
const YearlyExpenseChartContent = ({
  totals,
  year,
  monthYear,
  setMonthYear,
  isFetching,
  isEarningEnabled,
}: {
  totals: {
    monthlyEarningTotals: MonthlyEarningTotal[];
    monthlyExpenseTotals: MonthlyExpenseTotal[];
  };
  year: number;
  monthYear?: MonthYearType;
  setMonthYear: Dispatch<SetStateAction<MonthYearType | undefined>>;
  isFetching: boolean;
  isEarningEnabled: boolean;
}) => {
  const { t } = useTranslate();

  const chartData: MonthlyTransactionTotal[] = useMemo(() => {
    return totals.monthlyExpenseTotals.map((expenseTotal, index) => {
      const totalEarning = isEarningEnabled
        ? totals.monthlyEarningTotals[index].totalEarnings
        : 0;
      return {
        month: expenseTotal.month,
        totalExpenses: expenseTotal.totalExpenses,
        totalEarnings: totalEarning,
      };
    });
  }, [
    isEarningEnabled,
    totals.monthlyEarningTotals,
    totals.monthlyExpenseTotals,
  ]);

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
          {isFetching && (
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
            data={chartData}
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
