"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Navbar } from "@/components/elements/navbar/Navbar";
import { TransactionDTO, UserDTO } from "@/types/DTO/dataTypes";
import { FirebaseOptions, initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { signOut, useSession } from "next-auth/react";
import NewTransaction from "@/components/elements/home/NewTransaction";
import Totals from "@/components/elements/home/Totals";
import TransactionList from "@/components/elements/home/TransactionList";
import { LoadingRoundedText } from "@/components/loading/text/LoadingRoundedText";

// TODO make the application refresh automatically somehow, no need to refresh to see changes (web socket, temporary refresh...)
const Home = () => {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserDTO>();
  const [secondUser, setSecondUser] = useState<UserDTO>();
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

          // Get All TransactionList
          // TODO don't get all, use some kind of pagination for this
          const q2 = query(
            collection(db, "transactions"),
            orderBy("timestamp", "desc")
          );
          getDocs(q2).then((querySnapshot) => {
            const savedTransactions: TransactionDTO[] = [];
            querySnapshot.forEach((doc) => {
              const savedTransaction = {
                id: doc.id,
                ...doc.data(),
              } as TransactionDTO;
              savedTransactions.push(savedTransaction);
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
      {/*TODO configure some proper width*/}
      <div className="mx-3 mt-10">
        {currentUser && secondUser ? (
          <Totals user1={currentUser} user2={secondUser} />
        ) : (
          <TotalsLoading />
        )}
        <section className="mt-5 flex flex-col md:flex-row md:space-x-10">
          {currentUser ? (
            <NewTransaction
              transactions={transactions}
              setTransactions={setTransactions}
              user={currentUser}
              setUser={setCurrentUser as Dispatch<SetStateAction<UserDTO>>}
              db={db}
            />
          ) : (
            <NewTransactionLoading />
          )}
        </section>
        {currentUser && secondUser ? (
          <TransactionList
            transactions={transactions}
            setTransactions={setTransactions}
            user1={currentUser}
            setUser1={setCurrentUser as Dispatch<SetStateAction<UserDTO>>}
            user2={secondUser}
            setUser2={setSecondUser as Dispatch<SetStateAction<UserDTO>>}
            db={db}
          />
        ) : (
          <TransactionListLoading />
        )}
      </div>
    </div>
  );
};

const TotalsLoading = () => {
  return (
    <div className="mt-2">
      <LoadingRoundedText theme="dark" className="h-4 w-16" />
      <LoadingRoundedText theme="dark" className="mt-6 h-3 w-60" />
    </div>
  );
};

const NewTransactionLoading = () => {
  return (
    <div className="mt-2">
      <LoadingRoundedText theme="dark" className="h-4 w-64" />
      <LoadingRoundedText theme="dark" className="mt-6 h-10 w-40" />
      <LoadingRoundedText theme="dark" className="mt-3 h-5 w-20" />
    </div>
  );
};

const TransactionListLoading = () => {
  return (
    <div className="mt-10">
      <LoadingRoundedText theme="dark" className="h-4 w-36" />
      <LoadingRoundedText theme="dark" className="mt-6 h-3 w-60" />
      <LoadingRoundedText theme="dark" className="mt-6 h-3 w-60" />
      <LoadingRoundedText theme="dark" className="mt-6 h-3 w-60" />
      <LoadingRoundedText theme="dark" className="mt-6 h-3 w-44" />
    </div>
  );
};

export default Home;
