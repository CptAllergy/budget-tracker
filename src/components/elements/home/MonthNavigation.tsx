import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { Dispatch, SetStateAction } from "react";

const MonthNavigation = ({
  monthYear,
  setMonthYear,
}: {
  monthYear: {
    month: number;
    year: number;
  };
  setMonthYear: Dispatch<
    SetStateAction<{
      month: number;
      year: number;
    }>
  >;
}) => {
  const { month, year } = monthYear;
  const date = new Date(year, month, 1);
  const monthString = date.toLocaleString("en-us", { month: "long" });

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
    <div>
      <div className="mx-auto flex max-w-6xl">
        <div className="min-w-full px-3 align-middle">
          <div className="bg-theme-highlight flex flex-row items-center justify-between overflow-hidden rounded-md border-2 border-black py-2">
            <button
              className="bg-theme-main hover:bg-theme-hover mx-4 rounded-md border-2 border-black px-2 py-0.5 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              onClick={() => handleMonthYearChange(true)}
            >
              <MdOutlineKeyboardArrowLeft size={25} />
            </button>
            <p className="capitalize">
              {monthString} - {year}
            </p>
            <button
              className="bg-theme-main hover:bg-theme-hover mx-4 rounded-md border-2 border-black px-2 py-0.5 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              onClick={() => handleMonthYearChange(false)}
            >
              <MdOutlineKeyboardArrowRight size={25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthNavigation;
