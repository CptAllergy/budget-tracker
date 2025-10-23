import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ExpenseCards,
  ExpenseTable,
} from "@/components/pages/home/ExpensesList";
import { TransactionListLoading } from "@/components/loading/elements/home/LoadingHome";
import { useQueryExpenses } from "@/utils/hooks/reactQueryExpenses";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_TAGS,
  ExpenseCategory,
} from "@/types/transactionFilterTypes";
import { ExpenseDTO, UserDTO } from "@/types/DTO/dataTypes";
import {
  ExpenseListType,
  MonthYearType,
  ReportQueryExpenseCategory,
  ReportQueryExpenseTag,
  ReportQueryType,
  ReportQueryTypeInputs,
} from "@/types/componentTypes";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { LuSearch } from "react-icons/lu";
import { getCategoryIcon } from "@/utils/styles/transactionFilterStyles";
import {
  FormQueryInputDate,
  FormQueryInputSelect,
  QuerySelectOptionType,
} from "@/components/commons/input/QueryExpenseInputs";
import { SubmitHandler, useForm } from "react-hook-form";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";
import { format, isMatch, parse } from "date-fns";
import { getMonthYearLimits } from "@/services/firebaseService";
import "ldrs/react/Ring2.css";
import { Ring2 } from "ldrs/react";

const QueryExpenseList = ({
  currentUser,
  filterId,
  currentYear,
  lastPressedCategory,
}: {
  currentUser?: UserDTO;
  filterId?: ExpenseListType;
  currentYear: number;
  lastPressedCategory?: {
    category: ExpenseCategory;
    monthYear: MonthYearType;
  };
}) => {
  const [activeQuery, setActiveQuery] = useState<ReportQueryType>();
  const [isFetchingAnimation, setIsFetchingAnimation] =
    useState<boolean>(false);

  return (
    <div>
      <TransactionQuery
        setActiveQuery={setActiveQuery}
        currentYear={currentYear}
        lastPressedCategory={lastPressedCategory}
        isFetching={isFetchingAnimation}
      />
      <FilteredExpensesList
        activeQuery={activeQuery}
        filterId={filterId}
        currentUser={currentUser}
        setIsFetchingAnimation={setIsFetchingAnimation}
      />
    </div>
  );
};

const TransactionQuery = ({
  setActiveQuery,
  currentYear,
  lastPressedCategory,
  isFetching,
}: {
  setActiveQuery: (query: ReportQueryType) => void;
  currentYear: number;
  lastPressedCategory?: {
    category: ExpenseCategory;
    monthYear: MonthYearType;
  };
  isFetching: boolean;
}) => {
  const { t } = useTranslate();
  const alertContext = useRef(useContext(AlertContext));

  const categoryOptions = useMemo(() => {
    const options: QuerySelectOptionType<ReportQueryExpenseCategory>[] = [
      ...EXPENSE_CATEGORIES,
    ].map((cat) => {
      return {
        label: `expenses.categories.${cat}`,
        value: cat,
        icon: getCategoryIcon(cat),
      };
    });

    options.unshift({
      label: t("expenses.all"),
      value: "all",
      icon: "🌐",
    });
    return options;
  }, [t]);

  const tagOptions = useMemo(() => {
    const options: QuerySelectOptionType<ReportQueryExpenseTag>[] = [
      ...EXPENSE_TAGS,
    ].map((tag) => {
      return {
        label: `expenses.tags.${tag}`,
        value: tag,
        icon: "",
      };
    });

    options.unshift({
      label: t("expenses.all"),
      value: "all",
      icon: "",
    });
    return options;
  }, [t]);

  const { register, handleSubmit, formState, control, setValue } =
    useForm<ReportQueryTypeInputs>({
      defaultValues: {
        firstDay: format(
          new Date(new Date().getFullYear(), 0, 1),
          "dd/MM/yyyy"
        ),
        lastDay: format(
          new Date(new Date().getFullYear(), 11, 31),
          "dd/MM/yyyy"
        ),
        category: "all",
        tag: "all",
      },
    });

  const onSubmit: SubmitHandler<ReportQueryTypeInputs> = async (query) => {
    if (
      !isMatch(query.firstDay, "dd/MM/yyyy") ||
      !isMatch(query.lastDay, "dd/MM/yyyy")
    ) {
      toggleStatusErrorAlert(
        alertContext.current,
        t,
        "QUERY_FAILED",
        "Invalid query date"
      );
      throw "Invalid query data: Invalid date";
    }

    setActiveQuery({
      firstDay: parse(query.firstDay, "dd/MM/yyyy", new Date()),
      lastDay: parse(query.lastDay, "dd/MM/yyyy", new Date()),
      category: query.category,
      tag: query.tag,
    });
  };

  const [isQueryUpdated, setIsQueryUpdated] = useState(false);

  // Set default dates on year change
  useEffect(() => {
    setValue("firstDay", format(new Date(currentYear, 0, 1), "dd/MM/yyyy"));
    setValue("lastDay", format(new Date(currentYear, 11, 31), "dd/MM/yyyy"));
    setValue("category", "all");
    setValue("tag", "all");
    setIsQueryUpdated(true);
  }, [setValue, currentYear]);

  // Set category and dates if coming from chart click
  useEffect(() => {
    if (lastPressedCategory) {
      const { firstDay, lastDay } = getMonthYearLimits(
        lastPressedCategory.monthYear
      );
      setValue("category", lastPressedCategory.category);
      setValue("firstDay", format(firstDay, "dd/MM/yyyy"));
      setValue("lastDay", format(lastDay, "dd/MM/yyyy"));
    } else {
      setValue("firstDay", format(new Date(currentYear, 0, 1), "dd/MM/yyyy"));
      setValue("lastDay", format(new Date(currentYear, 11, 31), "dd/MM/yyyy"));
      setValue("category", "all");
      setValue("tag", "all");
    }
    setIsQueryUpdated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, lastPressedCategory]);

  //
  useEffect(() => {
    if (isQueryUpdated) {
      setTimeout(() => {
        setIsQueryUpdated(false);
      }, 600);
    }
  }, [isQueryUpdated]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col">
      <div className="inline-block min-w-full px-3 py-1 align-middle md:py-2">
        <div className="bg-theme-highlight rounded-md border-2 border-black p-2">
          <span className="">{t("reports.query.title")}</span>
          <form
            className={`${isQueryUpdated ? "text-white" : "text-black"} mt-4 grid grid-cols-1 gap-2 text-base font-semibold transition-colors sm:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr_1fr_1fr_auto]`}
          >
            <div>
              <label className="text-black">
                {t("reports.query.firstDay")}
              </label>
              <FormQueryInputDate
                className={isQueryUpdated ? "bg-theme-main" : ""}
                register={register}
                formState={formState}
                fieldName="firstDay"
              />
            </div>
            <div>
              <label className="text-black">{t("reports.query.lastDay")}</label>
              <FormQueryInputDate
                className={isQueryUpdated ? "bg-theme-main" : ""}
                register={register}
                formState={formState}
                fieldName="lastDay"
              />
            </div>
            <div>
              <label className="text-black">
                {t("reports.query.category")}
              </label>
              <FormQueryInputSelect<ReportQueryExpenseCategory>
                className={isQueryUpdated ? "bg-theme-main" : ""}
                control={control}
                options={categoryOptions}
                fieldName="category"
              />
            </div>
            <div>
              <label className="text-black">{t("reports.query.tag")}</label>
              <FormQueryInputSelect<ReportQueryExpenseTag>
                className={isQueryUpdated ? "bg-theme-main" : ""}
                control={control}
                options={tagOptions}
                fieldName="tag"
              />
            </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-1 lg:px-3">
              <button
                onClick={handleSubmit(onSubmit)}
                className="bg-theme-main hover:bg-theme-hover mt-5.5 flex w-full items-center rounded-md border-2 border-black py-1.5 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] lg:px-3"
              >
                <span className="flex w-full items-center justify-center gap-2">
                  {isFetching ? (
                    <Ring2
                      size="22"
                      stroke="3"
                      strokeLength="0.25"
                      bgOpacity="0.1"
                      speed="0.9"
                      color="white"
                    />
                  ) : (
                    <>
                      <span className="lg:hidden">{t("reports.search")}</span>
                      <LuSearch size={22} />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const FilteredExpensesList = ({
  activeQuery,
  filterId,
  currentUser,
  setIsFetchingAnimation,
}: {
  activeQuery?: ReportQueryType;
  filterId?: ExpenseListType;
  currentUser?: UserDTO;
  setIsFetchingAnimation: (isFetching: boolean) => void;
}) => {
  const { t } = useTranslate();
  // Change "all" to undefined for querying all categories/tags by removing the filter
  const query = activeQuery
    ? {
        firstDay: activeQuery.firstDay,
        lastDay: activeQuery.lastDay,
        category:
          activeQuery?.category === "all" ? undefined : activeQuery?.category,
        tag: activeQuery?.tag === "all" ? undefined : activeQuery?.tag,
      }
    : undefined;

  const { expenses, isLoading, isEnabled, isFetching } = useQueryExpenses(
    query,
    filterId,
    true
  );

  useEffect(() => {
    setIsFetchingAnimation(isFetching);
  }, [isFetching, setIsFetchingAnimation]);

  const isProfile = useMemo(() => filterId?.userId != null, [filterId]);

  if (!isEnabled) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col">
        <div className="inline-block min-w-full px-3 py-2 align-middle">
          <div className="bg-theme-highlight mt-2 rounded-md border-2 border-black px-3 py-4 text-sm text-gray-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            {t("reports.pendingSearch")}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !currentUser) {
    return <TransactionListLoading />;
  }

  // Fallback check
  if (!expenses) {
    return <TransactionListLoading />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col">
      <div className="inline-block min-w-full px-3 py-2 align-middle">
        <QueryExpenseSummary expenses={expenses} />
        <div className="hidden md:block">
          <ExpenseTable
            expenses={expenses}
            currentUser={currentUser}
            showDeleteDialog={() => {}}
            showEditDialog={() => {}}
            isEditable={false}
            isProfile={isProfile}
          />
        </div>
        <div className="block md:hidden">
          <ExpenseCards
            expenses={expenses}
            currentUser={currentUser}
            showDeleteDialog={() => {}}
            showEditDialog={() => {}}
            isEditable={false}
            isProfile={isProfile}
          />
        </div>
      </div>
    </div>
  );
};

const QueryExpenseSummary = ({ expenses }: { expenses: ExpenseDTO[] }) => {
  const { t } = useTranslate();
  const total = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <div className="bg-theme-secondary mb-3 rounded-md border-2 border-black py-2">
      <span className="ml-4 text-left font-semibold">
        {t("profile.spent")}:{" "}
      </span>
      <span>{Number(total).toFixed(2)}€</span>
    </div>
  );
};

export default QueryExpenseList;
