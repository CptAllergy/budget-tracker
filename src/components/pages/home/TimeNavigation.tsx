"use client";

import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { MonthYearType } from "@/types/componentTypes";
import { useTranslate } from "@/utils/hooks/useTranslation";

const TimeNavigation = ({
  prevAction,
  nextAction,
  children,
}: PropsWithChildren<{
  prevAction: () => void;
  nextAction: () => void;
}>) => {
  return (
    <div>
      <div className="mx-auto flex max-w-6xl">
        <div className="min-w-full px-3 align-middle">
          <div className="bg-theme-highlight flex flex-row items-center justify-between overflow-hidden rounded-md border-2 border-black py-2">
            <button
              className="bg-theme-main hover:bg-theme-hover mx-4 rounded-md border-2 border-black px-2 py-0.5 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              onClick={prevAction}
            >
              <MdOutlineKeyboardArrowLeft size={25} />
            </button>
            {children}
            <button
              className="bg-theme-main hover:bg-theme-hover mx-4 rounded-md border-2 border-black px-2 py-0.5 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              onClick={nextAction}
            >
              <MdOutlineKeyboardArrowRight size={25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MonthNavigation = ({
  monthYear,
  setMonthYear,
}: {
  monthYear: MonthYearType;
  setMonthYear: Dispatch<SetStateAction<MonthYearType>>;
}) => {
  const { month, year } = monthYear;
  const date = new Date(year, month, 1);
  const { locale } = useTranslate();

  const monthString =
    locale &&
    date.toLocaleString(locale, {
      month: "long",
    });

  const handleMonthYearChange = (isPrevious: boolean) => {
    if (isPrevious) {
      setMonthYear((prev) => ({
        month: prev.month === 0 ? 11 : prev.month - 1,
        year: prev.month === 0 ? prev.year - 1 : prev.year,
      }));
    } else {
      setMonthYear((prev) => ({
        month: prev.month === 11 ? 0 : prev.month + 1,
        year: prev.month === 11 ? prev.year + 1 : prev.year,
      }));
    }
  };

  return (
    <TimeNavigation
      prevAction={() => handleMonthYearChange(true)}
      nextAction={() => handleMonthYearChange(false)}
    >
      <p className="-m-2 whitespace-nowrap capitalize">
        {monthString} - {year}
      </p>
    </TimeNavigation>
  );
};

const YearNavigation = ({
  year,
  setYear,
  setMonthYear,
}: {
  year: number;
  setYear: Dispatch<SetStateAction<number>>;
  setMonthYear: Dispatch<SetStateAction<MonthYearType | undefined>>;
}) => {
  const handleYearChange = (isPrevious: boolean) => {
    if (isPrevious) {
      setYear((prev) => prev - 1);
      setMonthYear(undefined);
    } else {
      setYear((prev) => prev + 1);
      setMonthYear(undefined);
    }
  };

  return (
    <TimeNavigation
      prevAction={() => handleYearChange(true)}
      nextAction={() => handleYearChange(false)}
    >
      <p>{year}</p>
    </TimeNavigation>
  );
};

export { MonthNavigation, YearNavigation };
