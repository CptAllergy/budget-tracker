import {
  collection,
  deleteDoc,
  doc,
  getAggregateFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  setDoc,
  sum,
  where,
} from "firebase/firestore";
import {
  CreateEarningDTO,
  CreateExpenseDTO,
  EarningDTO,
  ExpenseDTO,
  ExpenseGroupDTO,
  UserDTO,
  UserTotalDTO,
} from "@/types/DTO/dataTypes";
import { Dispatch, SetStateAction } from "react";
import { ExpenseListType, MonthYearType } from "@/types/componentTypes";
import { db } from "@/utils/firebase/config";

export async function getCurrentUserFirebase(userId: string) {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("User document does not exist");
  }

  return { id: docSnap.id, ...docSnap.data() } as UserDTO;
}

export async function getExpenseGroupsFirebase(userId: string) {
  const queryExpenseGroups = query(
    collection(db, "groups"),
    where("members", "array-contains", userId)
  );

  const querySnapshot = await getDocs(queryExpenseGroups);
  return await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const totalsSnapshot = await getDocs(
        collection(db, "groups", doc.id, "totals")
      );

      const totals = totalsSnapshot.docs.map((total) => {
        return {
          id: total.id,
          ...total.data(),
        } as UserTotalDTO;
      });

      return {
        id: doc.id,
        ...doc.data(),
        totals: totals,
      } as ExpenseGroupDTO;
    })
  );
}

export async function getExpensesFirebase(
  filterId: ExpenseListType,
  monthYear?: MonthYearType
) {
  const { firstDay, lastDay } = getMonthYearLimits(monthYear);

  const filter = filterId.userId
    ? where("userId", "==", filterId.userId)
    : where("groupId", "==", filterId.groupId);

  const queryExpenses = query(
    collection(db, "expenses"),
    where("timestamp", ">=", firstDay),
    where("timestamp", "<=", lastDay),
    filter,
    orderBy("timestamp", "desc")
  );

  const querySnapshot = await getDocs(queryExpenses);

  return querySnapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() } as ExpenseDTO;
  });
}

export async function getExpensesMonthlySumFirebase(
  filterId: ExpenseListType,
  monthYear: MonthYearType
) {
  const { firstDay, lastDay } = getMonthYearLimits(monthYear);

  const filter = filterId.userId
    ? where("userId", "==", filterId.userId)
    : where("groupId", "==", filterId.groupId);

  const queryExpenses = query(
    collection(db, "expenses"),
    where("timestamp", ">=", firstDay),
    where("timestamp", "<=", lastDay),
    filter
  );

  const snapshot = await getAggregateFromServer(queryExpenses, {
    totalAmount: sum("amount"),
  });

  return snapshot.data().totalAmount;
}

export async function postExpenseFirebase(newExpense: CreateExpenseDTO) {
  const totalRef = newExpense.groupId
    ? doc(db, "groups", newExpense.groupId, "totals", newExpense.userId)
    : null;
  const expenseRef = doc(collection(db, "expenses"));

  // These Firestore operations must run inside an atomic transaction
  const newUserTotal = await runTransaction(db, async (fbTransaction) => {
    let newUserTotal = null;
    if (totalRef) {
      const userTotalDoc = await fbTransaction.get(totalRef);
      if (!userTotalDoc.exists()) {
        throw "Document does not exist!";
      }
      const userTotal = userTotalDoc.data() as UserTotalDTO;
      newUserTotal = userTotal.total + newExpense.amount;

      // Increase currentUser total
      fbTransaction.update(totalRef, {
        total: newUserTotal,
      });
    }

    // Add expense document
    fbTransaction.set(expenseRef, newExpense);

    return newUserTotal;
  });

  const createdExpense = { id: expenseRef.id, ...newExpense } as ExpenseDTO;
  return { newUserTotal, createdExpense };
}

export async function deleteExpenseFirebase(expense: ExpenseDTO) {
  const totalRef = expense.groupId
    ? doc(db, "groups", expense.groupId, "totals", expense.userId)
    : null;
  const expenseRef = doc(db, "expenses", expense.id);

  // These Firestore operations must run inside an atomic transaction
  const newUserTotal = await runTransaction(db, async (fbTransaction) => {
    let newUserTotal = null;
    if (totalRef) {
      const userTotalDoc = await fbTransaction.get(totalRef);
      if (!userTotalDoc.exists()) {
        throw "Document does not exist!";
      }
      const userTotal = userTotalDoc.data() as UserTotalDTO;
      newUserTotal = userTotal.total - Number(expense.amount);
      // Update currentUser total document by the deleted expense
      fbTransaction.update(totalRef, {
        total: newUserTotal,
      });
    }

    // Delete expense document
    fbTransaction.delete(expenseRef);

    return newUserTotal;
  });

  return { newUserTotal };
}

export async function updateExpenseFirebase(updateExpense: ExpenseDTO) {
  const totalRef = updateExpense.groupId
    ? doc(db, "groups", updateExpense.groupId, "totals", updateExpense.userId)
    : null;
  const expenseRef = doc(db, "expenses", updateExpense.id);

  // These Firestore operations must run inside an atomic transaction
  const { newUserTotal, prevAmount, prevTimestamp } = await runTransaction(
    db,
    async (fbTransaction) => {
      const expenseDoc = await fbTransaction.get(expenseRef);
      const expenseOld = expenseDoc.data() as ExpenseDTO;

      let newUserTotal = null;
      if (totalRef) {
        const userTotalDoc = await fbTransaction.get(totalRef);
        if (!userTotalDoc.exists() || !expenseDoc.exists()) {
          throw "Document does not exist!";
        }
        const userTotal = userTotalDoc.data() as UserTotalDTO;
        // Update currentUser total document by the updated amount, if it changed

        if (expenseOld.amount !== updateExpense.amount) {
          const difference = updateExpense.amount - expenseOld.amount;

          newUserTotal = userTotal.total + difference;
          fbTransaction.update(totalRef, {
            total: newUserTotal,
          });
        }
      }

      fbTransaction.update(expenseRef, {
        amount: updateExpense.amount,
        label: updateExpense.label,
        timestamp: updateExpense.timestamp,
        tags: updateExpense.tags,
        category: updateExpense.category,
      });

      return {
        newUserTotal: newUserTotal,
        prevAmount: expenseOld.amount,
        prevTimestamp: expenseOld.timestamp,
      };
    }
  );

  return { newUserTotal, prevAmount, prevTimestamp };
}

export async function getEarningsFirebase(
  setEarnings: Dispatch<SetStateAction<EarningDTO[]>>,
  userId: string,
  monthYear?: { month: number; year: number }
) {
  const { firstDay, lastDay } = getMonthYearLimits(monthYear);

  const queryEarnings = query(
    collection(db, "earnings"),
    where("timestamp", ">=", firstDay),
    where("timestamp", "<=", lastDay),
    where("userId", "==", userId),
    orderBy("timestamp", "desc")
  );

  const querySnapshot = await getDocs(queryEarnings);
  const earnings = querySnapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() } as EarningDTO;
  });
  setEarnings(earnings);
  return earnings;
}

export async function getEarningsMonthlySumFirebase(
  userId: string,
  monthYear: MonthYearType
) {
  const { firstDay, lastDay } = getMonthYearLimits(monthYear);

  const queryEarnings = query(
    collection(db, "earnings"),
    where("timestamp", ">=", firstDay),
    where("timestamp", "<=", lastDay),
    where("userId", "==", userId)
  );

  const snapshot = await getAggregateFromServer(queryEarnings, {
    totalAmount: sum("amount"),
  });

  return snapshot.data().totalAmount;
}

export async function postEarningFirebase(newEarning: CreateEarningDTO) {
  const earningRef = doc(collection(db, "earnings"));
  // Add earning document
  await setDoc(earningRef, newEarning);

  return { createdEarning: { id: earningRef.id, ...newEarning } as EarningDTO };
}

export async function deleteEarningFirebase(earning: EarningDTO) {
  const earningRef = doc(db, "earnings", earning.id);
  await deleteDoc(earningRef);
}

export async function updateEarningFirebase(earningUpdated: EarningDTO) {
  const earningRef = doc(db, "earnings", earningUpdated.id);

  // Uses a transaction to ensure previous timestamp value
  const { prevAmount, prevTimestamp } = await runTransaction(
    db,
    async (fbTransaction) => {
      const earningDoc = await fbTransaction.get(earningRef);
      const earningOld = earningDoc.data() as EarningDTO;

      fbTransaction.update(earningRef, {
        amount: earningUpdated.amount,
        label: earningUpdated.label,
        timestamp: earningUpdated.timestamp,
        category: earningUpdated.category,
      });

      return {
        prevAmount: earningOld.amount,
        prevTimestamp: earningOld.timestamp,
      };
    }
  );

  return { prevAmount, prevTimestamp };
}

function getMonthYearLimits(monthYear?: MonthYearType): {
  firstDay: Date;
  lastDay: Date;
} {
  const date = new Date();

  // Only set the month and year if they are provided, otherwise use the current date
  if (monthYear) {
    date.setDate(1);
    date.setMonth(monthYear.month);
    date.setFullYear(monthYear.year);
  }

  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  return { firstDay, lastDay };
}
