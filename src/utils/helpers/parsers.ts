import { Timestamp } from "firebase/firestore";

function isNumeric(str: any): boolean {
  if (typeof str != "string" && typeof str != "number") return false;
  return !isNaN(str as any) && !isNaN(parseFloat(str as any));
}

function isValidAmount(amount: string): boolean {
  const amountNumber = Number(amount);
  return isNumeric(amount) && amountNumber > 0 && amountNumber <= 5000;
}

function timestampToDate(timestamp: Timestamp) {
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${day}/${month}/${year}`;
}

export { isNumeric, isValidAmount, timestampToDate };
