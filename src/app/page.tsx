"use client";

import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
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
import NewChanges from "@/components/elements/home/NewChanges";

// TODO fix loading animations
const Home = () => {
  const alertContext = useRef(useContext(AlertContext));
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserDTO>();
  const [secondUser, setSecondUser] = useState<UserDTO>();
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  // Used to detect new changes
  const [isChangeFound, setIsChangeFound] = useState<boolean>(false);

  const db = useMemo(() => {
    const firebaseConfig: FirebaseOptions = JSON.parse(
      process.env.NEXT_PUBLIC_FIREBASE_CONFIG!!
    );
    const app = initializeApp(firebaseConfig);
    return getFirestore(app);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    if (session?.user?.email && session.user.id_token) {
      const credential = GoogleAuthProvider.credential(session.user.id_token);
      signInWithCredential(auth, credential)
        .then(async () => {
          // Set the current and second user
          await fetchUsersFirebase(
            db,
            session.user.email,
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
  }, [session?.user?.email, session?.user?.id_token, db]);

  return (
    <div className="">
      <Navbar />
      <div className="right sticky top-0 z-10 ml-auto flex w-max justify-end">
        {!loading && secondUser && (
          <NewChanges
            isChangeFound={isChangeFound}
            setIsChangeFound={setIsChangeFound}
            secondUser={secondUser}
            db={db}
          />
        )}
      </div>
      <div className="mx-3 -mt-8">
        <section className="mx-4 flex flex-col items-center">
          {!loading && currentUser && secondUser ? (
            <Totals user1={currentUser} user2={secondUser} />
          ) : (
            <TotalsLoading />
          )}
          {!loading && currentUser ? (
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
        <section className="mt-4 md:mt-10">
          {!loading && currentUser && secondUser ? (
            <TransactionList
              transactions={transactions}
              setTransactions={setTransactions}
              currentUser={currentUser}
              setCurrentUser={
                setCurrentUser as Dispatch<SetStateAction<UserDTO>>
              }
              db={db}
            />
          ) : (
            <TransactionListLoading />
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
