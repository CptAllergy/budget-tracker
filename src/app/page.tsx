"use client";

import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Navbar } from "@/components/elements/navbar/Navbar";
import { TransactionDTO, UserDTO } from "@/types/DTO/dataTypes";
import { FirebaseOptions, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { signOut, useSession } from "next-auth/react";
import NewTransaction from "@/components/elements/home/NewTransaction";
import Totals from "@/components/elements/home/Totals";
import TransactionList from "@/components/elements/home/TransactionList";
import { AlertContext } from "@/contexts/AlertContext";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { fetchUsersFirebase } from "@/services/firebaseService";
import {
  NewTransactionLoading,
  TotalsLoading,
  TransactionListLoading,
} from "@/components/loading/elements/home/LoadingHome";

// TODO make the application refresh automatically somehow, good idea to use SWR maybe, refetch every 30 seconds
const Home = () => {
  const alertContext = useRef(useContext(AlertContext));
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
      signInWithCredential(auth, credential)
        .then(() => {
          // Set the current and second user
          fetchUsersFirebase(
            db,
            session,
            setCurrentUser as Dispatch<SetStateAction<UserDTO>>,
            setSecondUser as Dispatch<SetStateAction<UserDTO>>
          );

          setLoading(false);
        })
        .catch((error) => {
          if (error.code === "auth/invalid-credential") {
            // Update session storage with auth error
            sessionStorage.setItem("session_error", "true");
            void signOut();
          } else {
            toggleStatusErrorAlert(alertContext.current, "GENERIC");
          }
        });
    }
  }, [session]);

  // TODO clean up the styling and make it prettier
  return (
    <div className="flex flex-col items-center">
      <Navbar />
      <p className="mx-3 font-semibold text-red-600">
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

export default Home;
