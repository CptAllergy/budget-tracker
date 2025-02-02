import {
  collection,
  doc,
  endBefore,
  Firestore,
  getDoc,
  getDocs,
  limit,
  limitToLast,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  runTransaction,
  startAfter,
} from "firebase/firestore";
import {
  CreateTransactionDTO,
  TransactionDTO,
  UserDTO,
} from "@/types/DTO/dataTypes";
import { Dispatch, SetStateAction } from "react";
import { Session } from "next-auth";

export function fetchUsersFirebase(
  db: Firestore,
  session: Session,
  setCurrentUser: Dispatch<SetStateAction<UserDTO>>,
  setSecondUser: Dispatch<SetStateAction<UserDTO>>
) {
  // TODO can add some kind of user "pairs", so this doesn't break if there are more than 2 users
  const q = query(collection(db, "users"));
  getDocs(q).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data() as UserDTO;
      if (data.email === session.user.email) {
        setCurrentUser({ ...data, id: doc.id });
      } else {
        setSecondUser({ ...data, id: doc.id });
      }
    });
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

function setTransactionPage(
  querySnapshot: QuerySnapshot,
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>
) {
  const savedTransactions: TransactionDTO[] = [];
  if (!querySnapshot.empty) {
    querySnapshot.forEach((doc) => {
      const savedTransaction = {
        id: doc.id,
        ...doc.data(),
      } as TransactionDTO;
      savedTransactions.push(savedTransaction);
    });

    setTransactions(savedTransactions);
  }
}

export async function fetchTransactionsFirebase(
  db: Firestore,
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>,
  start?: QueryDocumentSnapshot
) {
  // If start is not defined, get the latest page of transactions
  const queryTransactions = start
    ? query(
        collection(db, "transactions"),
        orderBy("timestamp", "desc"),
        startAfter(start),
        limit(Number(process.env.NEXT_PUBLIC_PAGE_SIZE))
      )
    : query(
        collection(db, "transactions"),
        orderBy("timestamp", "desc"),
        limit(Number(process.env.NEXT_PUBLIC_PAGE_SIZE))
      );

  return getDocs(queryTransactions).then((querySnapshot) => {
    setTransactionPage(querySnapshot, setTransactions);

    // Return the first and last document to be used for pagination
    return [
      querySnapshot.docs[0],
      querySnapshot.docs[querySnapshot.docs.length - 1],
    ];
  });
}

export async function fetchPreviousTransactionsFirebase(
  db: Firestore,
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>,
  end: QueryDocumentSnapshot
) {
  // Get the page of transactions before the "end" document
  const queryTransactions = query(
    collection(db, "transactions"),
    orderBy("timestamp", "desc"),
    endBefore(end),
    limitToLast(Number(process.env.NEXT_PUBLIC_PAGE_SIZE))
  );

  return getDocs(queryTransactions).then((querySnapshot) => {
    setTransactionPage(querySnapshot, setTransactions);

    // Return the first and last document to be used for pagination
    return [
      querySnapshot.docs[0],
      querySnapshot.docs[querySnapshot.docs.length - 1],
    ];
  });
}

export async function addNewTransactionFirebase(
  db: Firestore,
  newTransaction: CreateTransactionDTO,
  user: UserDTO,
  setUser: Dispatch<SetStateAction<UserDTO>>,
  transactions: TransactionDTO[],
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>
) {
  const userRef = doc(db, "users", user.id);
  const transactionRef = doc(collection(db, "transactions"));

  // These Firestore operations must run inside an atomic transaction
  const newUserTotal = await runTransaction(db, async (fbTransaction) => {
    const userDocumentDoc = await fbTransaction.get(userRef);
    if (!userDocumentDoc.exists()) {
      throw "Document does not exist!";
    }
    const userDocument = userDocumentDoc.data() as UserDTO;
    const newTotal = userDocument.total + newTransaction.amount;

    // Increase user total document
    fbTransaction.update(userRef, {
      total: newTotal,
    });
    // Add transaction document
    fbTransaction.set(transactionRef, newTransaction);

    return newTotal;
  });

  // Update the transaction list
  setTransactions([
    { id: transactionRef.id, ...newTransaction },
    ...transactions,
  ]);

  // Update the total for the current user
  setUser((prevState) => {
    return {
      ...prevState,
      total: newUserTotal,
    };
  });
}

export async function deleteTransactionFirebase(
  db: Firestore,
  transaction: TransactionDTO,
  user1: UserDTO,
  setUser1: Dispatch<SetStateAction<UserDTO>>,
  user2: UserDTO,
  setUser2: Dispatch<SetStateAction<UserDTO>>,
  transactions: TransactionDTO[],
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>
) {
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

  // Delete transaction and update list
  const filteredTransactions = transactions.filter(
    (value) => value.id != transaction.id
  );
  setTransactions(filteredTransactions);

  // Update the total for the correct user
  if (transaction.userId === user1.id) {
    setUser1((prevState) => {
      return {
        ...prevState,
        total: newUserTotal,
      };
    });
  } else if (transaction.userId === user2.id) {
    setUser2((prevState) => {
      return {
        ...prevState,
        total: newUserTotal,
      };
    });
  }
}
