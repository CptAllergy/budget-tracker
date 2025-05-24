import {
  collection,
  doc,
  DocumentSnapshot,
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import {
  CreateTransactionDTO,
  TransactionDTO,
  TransactionGroupDTO,
  UserDTO,
  UserTotalDTO,
} from "@/types/DTO/dataTypes";
import { Dispatch, SetStateAction } from "react";
import { TransactionListType } from "@/types/componentTypes";

// TODO add firestore rules in firebase to only allow users with correct permission to read and write data

export async function getCurrentUserFirebase(
  db: Firestore,
  userEmail: string,
  setCurrentUser: Dispatch<SetStateAction<UserDTO>>
) {
  // Find the current logged-in user
  const currentUserQuery = query(
    collection(db, "users"),
    where("email", "==", userEmail)
  );
  const currentUserSnapshot = await getDocs(currentUserQuery);
  if (currentUserSnapshot.size !== 1) {
    throw "Failed to find current user";
  }

  const firstUser = currentUserSnapshot.docs[0];
  const currentUser = { id: firstUser.id, ...firstUser.data() } as UserDTO;
  setCurrentUser(currentUser);
}

export async function getTransactionGroupsFirebase(
  db: Firestore,
  userId: string
) {
  const queryTransactionGroups = query(
    collection(db, "groups"),
    where("members", "array-contains", userId)
  );
  const querySnapshot = await getDocs(queryTransactionGroups);

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
      } as TransactionGroupDTO;
    })
  );
}

export async function getUserByIdFirebase(db: Firestore, userId: string) {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as UserDTO;
  } else {
    return null;
  }
}

export async function getTransactionsFirebase(
  db: Firestore,
  setTransactionDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void,
  filterId: TransactionListType,
  monthYear?: { month: number; year: number }
) {
  const date = new Date();

  // Only set the month and year if they are provided, otherwise use the current date
  if (monthYear) {
    date.setMonth(monthYear.month);
    date.setFullYear(monthYear.year);
  }

  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);

  const filter = filterId.userId
    ? where("userId", "==", filterId.userId)
    : where("groupId", "==", filterId.groupId);

  const queryTransactions = query(
    collection(db, "transactions"),
    where("timestamp", ">=", firstDay),
    where("timestamp", "<=", lastDay),
    filter,
    orderBy("timestamp", "desc")
  );

  const querySnapshot = await getDocs(queryTransactions);
  setTransactionDocs(() => querySnapshot.docs);
}

export async function postTransactionFirebase(
  db: Firestore,
  newTransaction: CreateTransactionDTO,
  filterId: TransactionListType,
  currentUser: UserDTO,
  handleGroupChange: (
    updater: (prevDocs: TransactionGroupDTO) => TransactionGroupDTO
  ) => void,
  setTransactionDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) {
  // Load the first page
  await getTransactionsFirebase(db, setTransactionDocs, filterId);

  const totalRef = filterId.groupId
    ? doc(db, "groups", filterId.groupId, "totals", currentUser.id)
    : null;
  const transactionRef = doc(collection(db, "transactions"));

  // These Firestore operations must run inside an atomic transaction
  const newUserTotal = await runTransaction(db, async (fbTransaction) => {
    // const userDocumentDoc = await fbTransaction.get(userRef);
    let newUserTotal = null;
    if (totalRef) {
      const userTotalDoc = await fbTransaction.get(totalRef);
      if (!userTotalDoc.exists()) {
        throw "Document does not exist!";
      }
      const userTotal = userTotalDoc.data() as UserTotalDTO;
      newUserTotal = userTotal.total + newTransaction.amount;
      // Increase user total
      fbTransaction.update(totalRef, {
        total: newUserTotal,
      });
    }

    // Add transaction document
    fbTransaction.set(transactionRef, newTransaction);

    return newUserTotal;
  });

  // Update the total for the current user
  updateCurrentUserTotalState(newUserTotal, currentUser.id, handleGroupChange);

  // Update the reference list
  const transactionDoc = await getDoc(transactionRef);
  setTransactionDocs((prevDocs) => {
    return [transactionDoc, ...prevDocs];
  });
}

export async function deleteTransactionFirebase(
  db: Firestore,
  transaction: TransactionDTO,
  filterId: TransactionListType,
  currentUser: UserDTO,
  handleGroupChange: (
    updater: (prevDocs: TransactionGroupDTO) => TransactionGroupDTO
  ) => void,
  setTransactionDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) {
  if (transaction.userId !== currentUser.id) {
    throw "Current user does not match transaction user";
  }

  const totalRef = filterId.groupId
    ? doc(db, "groups", filterId.groupId, "totals", currentUser.id)
    : null;
  const transactionRef = doc(db, "transactions", transaction.id);

  // These Firestore operations must run inside an atomic transaction
  const newUserTotal = await runTransaction(db, async (fbTransaction) => {
    let newUserTotal = null;
    if (totalRef) {
      const userTotalDoc = await fbTransaction.get(totalRef);
      if (!userTotalDoc.exists()) {
        throw "Document does not exist!";
      }
      const userTotal = userTotalDoc.data() as UserTotalDTO;
      newUserTotal = userTotal.total - Number(transaction.amount);
      // Decrease user total document by the deleted transaction
      fbTransaction.update(totalRef, {
        total: newUserTotal,
      });
    }

    // Delete transaction document
    fbTransaction.delete(transactionRef);

    return newUserTotal;
  });

  // Delete reference Update the reference list
  setTransactionDocs((prevDocs) => {
    return prevDocs.filter((value) => value.id != transaction.id);
  });

  // Update the total for the current user
  updateCurrentUserTotalState(newUserTotal, currentUser.id, handleGroupChange);
}

export async function updateTransactionFirebase(
  db: Firestore,
  updatedTransaction: TransactionDTO,
  filterId: TransactionListType,
  currentUser: UserDTO,
  handleGroupChange: (
    updater: (prevDocs: TransactionGroupDTO) => TransactionGroupDTO
  ) => void,
  setTransactionDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) {
  if (updatedTransaction.userId !== currentUser.id) {
    throw "Current user does not match transaction user";
  }

  const totalRef = filterId.groupId
    ? doc(db, "groups", filterId.groupId, "totals", currentUser.id)
    : null;
  const transactionRef = doc(db, "transactions", updatedTransaction.id);

  // These Firestore operations must run inside an atomic transaction
  const { newUserTotal, prevTimestamp } = await runTransaction(
    db,
    async (fbTransaction) => {
      const transactionDocumentDoc = await fbTransaction.get(transactionRef);
      const transactionDocument =
        transactionDocumentDoc.data() as TransactionDTO;

      let newUserTotal = null;
      if (totalRef) {
        const userTotalDoc = await fbTransaction.get(totalRef);
        if (!userTotalDoc.exists() || !transactionDocumentDoc.exists()) {
          throw "Document does not exist!";
        }
        const userTotal = userTotalDoc.data() as UserTotalDTO;
        // Update user total document by the updated amount, if it changed

        if (transactionDocument.amount !== updatedTransaction.amount) {
          const difference =
            updatedTransaction.amount - transactionDocument.amount;

          newUserTotal = userTotal.total + difference;
          fbTransaction.update(totalRef, {
            total: newUserTotal,
          });
        }
      }

      fbTransaction.update(transactionRef, {
        amount: updatedTransaction.amount,
        label: updatedTransaction.label,
        timestamp: updatedTransaction.timestamp,
        tags: updatedTransaction.tags,
        category: updatedTransaction.category,
      });

      return {
        newUserTotal: newUserTotal,
        prevTimestamp: transactionDocument.timestamp,
      };
    }
  );

  // Update the total for the current user
  updateCurrentUserTotalState(newUserTotal, currentUser.id, handleGroupChange);

  // Replace the transaction document in the state
  const transactionDoc = await getDoc(transactionRef);
  setTransactionDocs((prevDocs) => {
    const filteredList = prevDocs.filter(
      (value) => value.id !== transactionDoc.id
    );

    const isSameMonth =
      prevTimestamp.toDate().getMonth() ===
      transactionDoc.data()?.timestamp.toDate().getMonth();

    // Sort by timestamp
    if (isSameMonth) {
      return [transactionDoc, ...filteredList].sort((a, b) =>
        a.data()?.timestamp < b.data()?.timestamp ? 1 : -1
      );
    } else {
      return filteredList;
    }
  });
}

function updateCurrentUserTotalState(
  newUserTotal: number | null,
  currentUserId: string,
  handleGroupChange: (
    updater: (prevDocs: TransactionGroupDTO) => TransactionGroupDTO
  ) => void
) {
  // Update the total for the current user
  if (newUserTotal != null) {
    handleGroupChange((prevState) => {
      const prevTotal = prevState.totals.find(
        (total) => total.id === currentUserId
      );
      const newTotal: UserTotalDTO = { ...prevTotal!, total: newUserTotal };
      const newTotals: UserTotalDTO[] = [
        ...prevState.totals.filter((total) => total.id !== currentUserId),
        newTotal,
      ];
      return {
        ...prevState,
        totals: newTotals,
      };
    });
  }
}
