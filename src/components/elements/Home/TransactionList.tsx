import { TransactionDTO, UserDTO } from "@/types/DTO/dataTypes";
import { Dispatch, SetStateAction } from "react";
import { deleteDoc, doc, Firestore, getDoc, setDoc } from "firebase/firestore";

const TransactionList = ({
  transactions,
  setTransactions,
  user1,
  setUser1,
  user2,
  setUser2,
  db,
}: {
  transactions: TransactionDTO[];
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>;
  user1: UserDTO;
  setUser1: Dispatch<SetStateAction<UserDTO>>;
  user2: UserDTO;
  setUser2: Dispatch<SetStateAction<UserDTO>>;
  db: Firestore;
}) => {
  const removeTransaction = async (transaction: TransactionDTO) => {
    // TODO these operations should be atomic
    // Decrease the user's total by the removed transaction
    // TODO What happens when this fails
    const userRef = doc(db, "users", transaction.userId);
    const userDocument = (await getDoc(userRef)).data() as UserDTO;

    setDoc(
      userRef,
      { total: userDocument.total - Number(transaction.amount) },
      { merge: true }
    ).then(() => {
      if (transaction.userId === user1.id) {
        setUser1((prevState) => {
          return {
            ...prevState,
            total: userDocument.total - Number(transaction.amount),
          };
        });
      } else if (transaction.userId === user2.id) {
        setUser2((prevState) => {
          return {
            ...prevState,
            total: userDocument.total - Number(transaction.amount),
          };
        });
      }
    });

    // Delete transaction and update list
    deleteDoc(doc(db, "transactions", transaction.id)).then(() => {
      const filteredTransactions = transactions.filter(
        (value) => value.id != transaction.id
      );
      setTransactions(filteredTransactions);
    });
  };

  return (
    <div className="mt-3">
      <h2 className="mb-3 text-xl font-bold">Transactions</h2>
      {transactions.map((transaction, index) => (
        <div key={index}>
          <span className="font-bold">{transaction.label} - </span>
          <span>{Number(transaction.amount).toFixed(2)}€ - </span>
          <span>{transaction.username} - </span>
          <button
            className="rounded-md bg-slate-700 px-0.5 text-white transition-colors hover:bg-slate-900"
            onClick={() => removeTransaction(transaction)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
