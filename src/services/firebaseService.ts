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
  where,
} from "firebase/firestore";
import {
  CreateTransactionDTO,
  TransactionDTO,
  UserDTO,
} from "@/types/DTO/dataTypes";
import { Dispatch, SetStateAction } from "react";

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

  // Update the total for the current user
  if (transaction.userId === user1.id) {
    setUser1((prevState) => {
      return {
        ...prevState,
        total: newUserTotal,
      };
    });
  } else {
    throw "Current user does not match transaction user";
  }
}
