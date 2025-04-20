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
  UserDTO,
} from "@/types/DTO/dataTypes";
import { Dispatch, SetStateAction } from "react";

const MAX_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE);

export async function fetchUsersFirebase(
  db: Firestore,
  userEmail: string,
  setCurrentUser: Dispatch<SetStateAction<UserDTO>>,
  setSecondUser: Dispatch<SetStateAction<UserDTO>>
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
  const currentUser = currentUserSnapshot.docs[0].data() as UserDTO;

  // Find the users in the same group as the current user
  const groupUsersQuery = query(
    collection(db, "users"),
    where("groupId", "==", currentUser.groupId)
  );
  const groupUsersSnapshot = await getDocs(groupUsersQuery);
  if (groupUsersSnapshot.size !== 2) {
    throw "Group must have exactly 2 users";
  }
  // Set the current and second user
  groupUsersSnapshot.forEach((doc) => {
    const userDTO = doc.data() as UserDTO;
    if (userDTO.email === currentUser.email) {
      setCurrentUser({ ...userDTO, id: doc.id });
    } else {
      setSecondUser({ ...userDTO, id: doc.id });
    }
  });
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

export async function fetchTransactionsFirebase(
  db: Firestore,
  setTransactionDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void,
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

  const queryTransactions = query(
    collection(db, "transactions"),
    where("timestamp", ">=", firstDay),
    where("timestamp", "<=", lastDay),
    orderBy("timestamp", "desc")
  );

  const querySnapshot = await getDocs(queryTransactions);
  setTransactionDocs(() => querySnapshot.docs);
}

export async function addNewTransactionFirebase(
  db: Firestore,
  newTransaction: CreateTransactionDTO,
  user: UserDTO,
  setUser: Dispatch<SetStateAction<UserDTO>>,
  setTransactionDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) {
  // Load the first page
  await fetchTransactionsFirebase(db, setTransactionDocs);

  const userRef = doc(db, "users", user.id);
  const transactionRef = doc(collection(db, "transactions"));

  // These Firestore operations must run inside an atomic transaction
  const newUserTotal = await runTransaction(db, async (fbTransaction) => {
    const userDocumentDoc = await fbTransaction.get(userRef);
    if (!userDocumentDoc.exists()) {
      throw "Document does not exist!";
    }
    const userDocument = userDocumentDoc.data() as UserDTO;
    const newUserTotal = userDocument.total + newTransaction.amount;

    // Increase user total document
    fbTransaction.update(userRef, {
      total: newUserTotal,
    });
    // Add transaction document
    fbTransaction.set(transactionRef, newTransaction);

    return newUserTotal;
  });

  // Update the total for the current user
  setUser((prevState) => {
    return {
      ...prevState,
      total: newUserTotal,
    };
  });

  // Update the reference list
  const transactionDoc = await getDoc(transactionRef);
  setTransactionDocs((prevDocs) => {
    return [transactionDoc, ...prevDocs];
  });
}

export async function deleteTransactionFirebase(
  db: Firestore,
  transaction: TransactionDTO,
  currentUser: UserDTO,
  setCurrentUser: Dispatch<SetStateAction<UserDTO>>,
  setTransactionDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) {
  if (transaction.userId !== currentUser.id) {
    throw "Current user does not match transaction user";
  }

  const userRef = doc(db, "users", transaction.userId);
  const transactionRef = doc(db, "transactions", transaction.id);

  // These Firestore operations must run inside an atomic transaction
  const newUserTotal = await runTransaction(db, async (fbTransaction) => {
    const userDocumentDoc = await fbTransaction.get(userRef);
    if (!userDocumentDoc.exists()) {
      throw "Document does not exist!";
    }
    const userDocument = userDocumentDoc.data() as UserDTO;
    const newTotal = userDocument.total - Number(transaction.amount);

    // Decrease user total document by the deleted transaction
    fbTransaction.update(userRef, {
      total: newTotal,
    });
    // Delete transaction document
    fbTransaction.delete(transactionRef);

    return newTotal;
  });

  // Delete reference Update the reference list
  setTransactionDocs((prevRefs) => {
    return prevRefs.filter((value) => value.id != transaction.id);
  });

  // Update the total for the current user
  setCurrentUser((prevState) => {
    return {
      ...prevState,
      total: newUserTotal,
    };
  });
}

// TODO finish edit function
export async function updateTransactionFirebase(
  db: Firestore,
  transaction: TransactionDTO,
  currentUser: UserDTO,
  setCurrentUser: Dispatch<SetStateAction<UserDTO>>,
  setTransactionDocs: (
    updater: (prevDocs: DocumentSnapshot[]) => DocumentSnapshot[]
  ) => void
) {
  if (transaction.userId !== currentUser.id) {
    throw "Current user does not match transaction user";
  }

  const userRef = doc(db, "users", transaction.userId);
  const transactionRef = doc(db, "transactions", transaction.id);

  // These Firestore operations must run inside an atomic transaction
  const newUserTotal = await runTransaction(db, async (fbTransaction) => {
    const userDocumentDoc = await fbTransaction.get(userRef);
    if (!userDocumentDoc.exists()) {
      throw "Document does not exist!";
    }
    // const userDocument = userDocumentDoc.data() as UserDTO;
    // const newTotal = userDocument.total - Number(transaction.amount);

    // TODO change only if the amount is different
    // Decrease user total document by the deleted transaction
    // fbTransaction.update(userRef, {
    //   total: newTotal,
    // });
    // Delete transaction document
    // TODO make sure this update is working, and only updating the correct fields
    fbTransaction.set(
      transactionRef,
      {
        amount: transaction.amount,
        label: transaction.label,
        timestamp: transaction.timestamp,
      },
      { merge: true }
    );

    // TODO return the correct value here. Could be positive or negative depending on the amount change
    return 0;
  });
}
