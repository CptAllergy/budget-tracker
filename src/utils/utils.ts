import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MonthYearType } from "@/types/componentTypes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentMonthYear(): MonthYearType {
  const currentDate = new Date();
  return { month: currentDate.getMonth(), year: currentDate.getFullYear() };
}
