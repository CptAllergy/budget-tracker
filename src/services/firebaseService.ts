import {
  collection,
  deleteDoc,
  doc,
  DocumentSnapshot,
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

// TODO change these function to return the data instead of setting the state directly, so that they can be used with react query. This can be done incrementally by first just returning
// TODO test getting data for other users, make sure permission are denied
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
  setExpenseDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void,
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
  setExpenseDocs(() => querySnapshot.docs);

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

// TODO can replace currentUser with userId from expense
export async function postExpenseFirebase(
  newExpense: CreateExpenseDTO,
  currentUser: UserDTO,
  setExpenseDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) {
  const totalRef = newExpense.groupId
    ? doc(db, "groups", newExpense.groupId, "totals", currentUser.id)
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

      // Increase user total
      fbTransaction.update(totalRef, {
        total: newUserTotal,
      });
    }

    // Add expense document
    fbTransaction.set(expenseRef, newExpense);

    return newUserTotal;
  });

  // Update the reference list
  const expenseDoc = await getDoc(expenseRef);
  setExpenseDocs((prevDocs) => {
    return [expenseDoc, ...prevDocs];
  });

  return newUserTotal;
}

// TODO can replace currentUser with userId from expense
export async function deleteExpenseFirebase(
  expense: ExpenseDTO,
  currentUser: UserDTO,
  setExpenseDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) {
  if (expense.userId !== currentUser.id) {
    throw "Current user does not match expense owner";
  }

  const totalRef = expense.groupId
    ? doc(db, "groups", expense.groupId, "totals", currentUser.id)
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
      // Update user total document by the deleted expense
      fbTransaction.update(totalRef, {
        total: newUserTotal,
      });
    }

    // Delete expense document
    fbTransaction.delete(expenseRef);

    return newUserTotal;
  });

  // Delete reference document from the state
  setExpenseDocs((prevDocs) => {
    return prevDocs.filter((value) => value.id !== expense.id);
  });

  return newUserTotal;
}

// TODO can replace currentUser with userId from expense
export async function updateExpenseFirebase(
  expenseUpdated: ExpenseDTO,
  currentUser: UserDTO,
  setExpenseDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) {
  if (expenseUpdated.userId !== currentUser.id) {
    throw "Current user does not match expense owner";
  }

  const totalRef = expenseUpdated.groupId
    ? doc(db, "groups", expenseUpdated.groupId, "totals", currentUser.id)
    : null;
  const expenseRef = doc(db, "expenses", expenseUpdated.id);

  // These Firestore operations must run inside an atomic transaction
  const { newUserTotal, prevTimestamp } = await runTransaction(
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
        // Update user total document by the updated amount, if it changed

        if (expenseOld.amount !== expenseUpdated.amount) {
          const difference = expenseUpdated.amount - expenseOld.amount;

          newUserTotal = userTotal.total + difference;
          fbTransaction.update(totalRef, {
            total: newUserTotal,
          });
        }
      }

      fbTransaction.update(expenseRef, {
        amount: expenseUpdated.amount,
        label: expenseUpdated.label,
        timestamp: expenseUpdated.timestamp,
        tags: expenseUpdated.tags,
        category: expenseUpdated.category,
      });

      return {
        newUserTotal: newUserTotal,
        prevTimestamp: expenseOld.timestamp,
      };
    }
  );

  // Replace the expense document in the state
  const expenseDoc = await getDoc(expenseRef);
  setExpenseDocs((prevDocs) => {
    const filteredList = prevDocs.filter((value) => value.id !== expenseDoc.id);

    const isSameMonth =
      prevTimestamp.toDate().getMonth() ===
        expenseDoc.data()?.timestamp.toDate().getMonth() &&
      prevTimestamp.toDate().getFullYear() ===
        expenseDoc.data()?.timestamp.toDate().getFullYear();

    // Sort by timestamp
    if (isSameMonth) {
      return [expenseDoc, ...filteredList].sort((a, b) =>
        a.data()?.timestamp < b.data()?.timestamp ? 1 : -1
      );
    } else {
      return filteredList;
    }
  });

  return newUserTotal;
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

export async function postEarningFirebase(
  newEarning: CreateEarningDTO,
  setEarnings: Dispatch<SetStateAction<EarningDTO[]>>
) {
  const earningRef = doc(collection(db, "earnings"));

  // Add earning document
  await setDoc(earningRef, newEarning);

  // Update earnings list
  const earningDoc = await getDoc(earningRef);
  const earning = { id: earningDoc.id, ...earningDoc.data() } as EarningDTO;
  setEarnings((prevDocs) => {
    return [earning, ...prevDocs];
  });
}

export async function deleteEarningFirebase(
  earning: EarningDTO,
  currentUser: UserDTO,
  setEarnings: Dispatch<SetStateAction<EarningDTO[]>>
) {
  if (earning.userId !== currentUser.id) {
    throw "Current user does not match earning owner";
  }

  const earningRef = doc(db, "earnings", earning.id);

  // Delete transaction document
  await deleteDoc(earningRef);

  // Delete reference document from the state
  setEarnings((prevDocs) => {
    return prevDocs.filter((value) => value.id !== earning.id);
  });
}

export async function updateEarningFirebase(
  earningUpdated: EarningDTO,
  currentUser: UserDTO,
  setEarnings: Dispatch<SetStateAction<EarningDTO[]>>
) {
  if (earningUpdated.userId !== currentUser.id) {
    throw "Current user does not match earning owner";
  }

  const earningRef = doc(db, "earnings", earningUpdated.id);

  // These Firestore operations must run inside an atomic transaction
  const prevTimestamp = await runTransaction(db, async (fbTransaction) => {
    const earningDoc = await fbTransaction.get(earningRef);
    const earningOld = earningDoc.data() as EarningDTO;

    fbTransaction.update(earningRef, {
      amount: earningUpdated.amount,
      label: earningUpdated.label,
      timestamp: earningUpdated.timestamp,
      category: earningUpdated.category,
    });

    return earningOld.timestamp;
  });

  // Replace earning in the state
  const earningDoc = await getDoc(earningRef);
  const earning = { id: earningDoc.id, ...earningDoc.data() } as EarningDTO;
  setEarnings((prevDocs) => {
    const filteredList = prevDocs.filter((value) => value.id !== earning.id);

    const isSameMonth =
      prevTimestamp.toDate().getMonth() ===
        earning.timestamp.toDate().getMonth() &&
      prevTimestamp.toDate().getFullYear() ===
        earning.timestamp.toDate().getFullYear();

    // Sort by timestamp
    if (isSameMonth) {
      return [earning, ...filteredList].sort((a, b) =>
        a.timestamp < b.timestamp ? 1 : -1
      );
    } else {
      return filteredList;
    }
  });
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
