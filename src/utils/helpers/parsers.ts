import { Timestamp } from "firebase/firestore";

export function isNumeric(str: any): boolean {
  if (typeof str != "string" && typeof str != "number") return false;
  return !isNaN(str as any) && !isNaN(parseFloat(str as any));
}

export function isValidAmount(amount: string): boolean {
  const amountNumber = Number(amount);
  return isNumeric(amount) && amountNumber > 0 && amountNumber <= 5000;
}

export function isValidDate(date: Date | undefined): boolean {
  if (!date) return false;

  try {
    // Must be able to convert to firestore timestamp
    if (!Timestamp.fromDate(date)) return false;
  } catch {
    return false;
  }
  return date <= new Date();
}

export function timestampToDate(timestamp: Timestamp) {
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${day}/${month}/${year}`;
}
