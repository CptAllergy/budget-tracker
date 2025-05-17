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
import { CreateTransactionDTO, UserDTO } from "@/types/DTO/dataTypes";
import { FirebaseOptions, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { signOut, useSession } from "next-auth/react";
import Totals from "@/components/elements/home/Totals";
import TransactionList from "@/components/elements/home/TransactionList";
import { AlertContext } from "@/contexts/AlertContext";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import {
  addNewTransactionFirebase,
  fetchUsersFirebase,
} from "@/services/firebaseService";
import {
  TotalsLoading,
  TransactionListLoading,
} from "@/components/loading/elements/home/LoadingHome";
import NewChanges from "@/components/elements/home/NewChanges";
import { AddDialog } from "@/components/commons/dialogs/ActionDialog";
import { TransactionContext } from "@/contexts/TransactionsContext";
import { LuPlus } from "react-icons/lu";

const Home = () => {
  const alertContext = useRef(useContext(AlertContext));
  const transactionContext = useContext(TransactionContext);
  const setTransactionDocs = useRef(transactionContext.setTransactionDocs);
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserDTO>();
  const [secondUser, setSecondUser] = useState<UserDTO>();
  // Used to detect new changes
  const [isChangeFound, setIsChangeFound] = useState<boolean>(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  const createTransaction = async (newTransaction: CreateTransactionDTO) => {
    try {
      await addNewTransactionFirebase(
        db,
        newTransaction,
        currentUser!,
        setCurrentUser as Dispatch<SetStateAction<UserDTO>>,
        setTransactionDocs.current
      );

      toggleStatusAlert(alertContext.current, "New transaction created");
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
      throw "Error adding new transaction";
    }
  };

  return (
    <div className="">
      <Navbar setIsAddDialogOpen={setIsAddDialogOpen} />
      {currentUser && (
        <AddDialog
          isDialogOpen={isAddDialogOpen}
          setIsDialogOpen={setIsAddDialogOpen}
          user={currentUser}
          createTransaction={createTransaction}
        />
      )}
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
      <div className="fixed right-0 bottom-0 z-5 m-4 sm:hidden">
        {!loading && currentUser && (
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-theme-secondary hover:bg-theme-secondary-hover rounded-md border-2 border-black p-1.5 text-white shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
          >
            <LuPlus size="30" />
          </button>
        )}
      </div>
      <div className="mx-3 -mt-12">
        <section className="mx-4 flex flex-col items-center">
          {!loading && currentUser && secondUser ? (
            <Totals user1={currentUser} user2={secondUser} />
          ) : (
            <TotalsLoading />
          )}
        </section>
        <section className="mt-4 md:mt-10">
          {!loading && currentUser && secondUser ? (
            <TransactionList
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
