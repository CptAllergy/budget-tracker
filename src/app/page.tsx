"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Navbar } from "@/components/elements/navbar/Navbar";
import { TransactionDTO, UserDTO } from "@/types/DTO/dataTypes";
import { SubmitHandler, useForm } from "react-hook-form";
import { FirebaseOptions, initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  getFirestore,
  query,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { signOut, useSession } from "next-auth/react";

// TODO make the application refresh automatically somehow, no need to refresh to see changes (web socket, temporary refresh...)
const Home = () => {
  const { data: session } = useSession();

  // TODO add some loading states to avoid this initial value
  const defaultUser = { id: "", name: "", email: "", total: 0 };

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserDTO>(defaultUser);
  const [secondUser, setSecondUser] = useState<UserDTO>(defaultUser);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);

  const firebaseConfig: FirebaseOptions = JSON.parse(
    process.env.NEXT_PUBLIC_FIREBASE_CONFIG!!
  );
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth();

  useEffect(() => {
    if (session && session.user && loading) {
      const credential = GoogleAuthProvider.credential(session.user.id_token);
      // TODO can probably handle loading state better
      setLoading(false);
      signInWithCredential(auth, credential)
        .then(() => {
          // Set the current and secondary user
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

          // Get All Transactions
          // TODO don't get all, use some kind of pagination for this
          const q2 = query(collection(db, "transactions"));
          getDocs(q2).then((querySnapshot) => {
            const savedTransactions: TransactionDTO[] = [];
            querySnapshot.forEach((doc) => {
              savedTransactions.push(doc.data() as TransactionDTO);
            });
            setTransactions(savedTransactions);
          });
        })
        .catch((error) => {
          if (error.code === "auth/invalid-credential") {
            // TODO show session expired message
            void signOut();
          } else {
            // TODO other errors
          }
        });
    }
  }, [session]);

  // TODO clean up the styling and make it prettier
  return (
    <div className="flex flex-col items-center">
      <Navbar />
      <p className="text-red-600">
        Notice: This ui is still under development, to see changes from other
        users you must refresh the page{" "}
      </p>
      <div className="mt-10">
        <Totals user1={currentUser} user2={secondUser} />
        <section className="-mt-5 flex flex-col md:flex-row md:space-x-10">
          <NewTransaction
            transactions={transactions}
            setTransactions={setTransactions}
            userTotal={currentUser}
            setUserTotal={setCurrentUser}
            db={db}
          />
        </section>
        <Transactions transactions={transactions} />
      </div>
    </div>
  );
};

const Totals = ({ user1, user2 }: { user1: UserDTO; user2: UserDTO }) => {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const balance = user1.total - user2.total;

    const [sender, receiver] =
      balance > 0 ? [user2.name, user1.name] : [user1.name, user2.name];

    setSender(sender);
    setReceiver(receiver);
    setBalance(Math.abs(balance));
  }, [user1, user2]);

  return (
    <div>
      <h2 className="mb-3 text-xl font-bold">Totals</h2>
      <div className="underline">
        <span>
          {sender} owes {receiver}{" "}
        </span>
        <span className="font-bold">{Number(balance).toFixed(2)}€</span>
      </div>
    </div>
  );
};

const Transactions = ({ transactions }: { transactions: TransactionDTO[] }) => {
  return (
    <div className="mt-3">
      <h2 className="mb-3 text-xl font-bold">Transactions</h2>
      {transactions.map((transaction, index) => (
        <div key={index}>
          <span className="font-bold">{transaction.label} - </span>
          <span>{Number(transaction.amount).toFixed(2)}€ - </span>
          <span>{transaction.username}</span>
        </div>
      ))}
    </div>
  );
};

const NewTransaction = ({
  transactions,
  setTransactions,
  userTotal,
  setUserTotal,
  db,
}: {
  transactions: TransactionDTO[];
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>;
  userTotal: UserDTO;
  setUserTotal: Dispatch<SetStateAction<UserDTO>>;
  db: Firestore;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransactionDTO>();

  // TODO initial value for what? confirm this later
  const [formData, setFormData] = useState<TransactionDTO>({
    label: "",
    amount: 0,
    username: "",
    // TODO what is this even? might not make sense
    timestamp: Timestamp.fromDate(new Date()),
  });

  const onSubmit: SubmitHandler<TransactionDTO> = (data) => {
    const newTransaction: TransactionDTO = {
      label: data.label,
      amount: data.amount as number,
      username: userTotal.name,
      timestamp: Timestamp.fromDate(new Date()),
    };

    // TODO What happens when this fails
    addDoc(collection(db, "transactions"), newTransaction).then(() => {
      // Update transactions list
      setTransactions([...transactions, newTransaction]);
    });

    // Update the user total by adding the new transaction
    // TODO What happens when this fails
    const userRef = doc(db, "users", userTotal.id);
    // TODO don't use the last value from user total, it could be mismatched somehow, actually get it from the database before
    setDoc(
      userRef,
      { total: userTotal.total + Number(data.amount) },
      { merge: true }
    ).then(() => {
      setUserTotal((prevState) => {
        return {
          ...prevState,
          total: Number(prevState.total) + Number(data.amount),
        };
      });
    });
  };

  return (
    <form className="mt-10 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-3 text-xl font-bold">
        New {userTotal.name} Transaction
      </h2>
      <div>
        <input
          type="text"
          placeholder="Description"
          {...register("label", { required: true })}
        />
        {errors.label && <span>This field is required</span>}
      </div>
      <div>
        <input
          type="number"
          placeholder="Amount"
          {...register("amount", { required: true })}
        />
        {errors.amount && <span>This field is required</span>}
      </div>

      <div className="mt-2">
        <button
          type="submit"
          className="rounded-md bg-slate-700 px-2 py-0.5 font-semibold text-white transition-colors hover:bg-slate-900"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default Home;
