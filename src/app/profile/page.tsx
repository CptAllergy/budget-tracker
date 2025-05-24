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
import TransactionList from "@/components/elements/home/TransactionList";
import { AlertContext } from "@/contexts/AlertContext";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import {
  getCurrentUserFirebase,
  postTransactionFirebase,
} from "@/services/firebaseService";
import { TransactionListLoading } from "@/components/loading/elements/home/LoadingHome";
import { AddDialog } from "@/components/commons/dialogs/ActionDialog";
import { TransactionContext } from "@/contexts/TransactionsContext";
import { LuPlus } from "react-icons/lu";
import { rancho } from "@/styles/fonts";
import { TransactionGroupsContext } from "@/contexts/TransactionGroupsContext";

const Profile = () => {
  const alertContext = useRef(useContext(AlertContext));
  const transactionContext = useContext(TransactionContext);
  const transactionGroupsContext = useContext(TransactionGroupsContext);

  const setTransactionDocs = useRef(transactionContext.setTransactionDocs);
  const handleFilterChange = useRef(
    transactionGroupsContext.handleFilterChange
  );
  const handleGroupChange = useRef(transactionGroupsContext.handleGroupChange);

  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserDTO>();

  // TODO place this duplicate code in some common function
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
          await getCurrentUserFirebase(
            db,
            session.user.email,
            setCurrentUser as Dispatch<SetStateAction<UserDTO>>
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

  useEffect(() => {
    if (currentUser) {
      try {
        handleFilterChange.current({ userId: currentUser.id });
      } catch {
        toggleStatusErrorAlert(alertContext.current, "GENERIC");
      }
    }
  }, [currentUser]);

  const createTransaction = async (newTransaction: CreateTransactionDTO) => {
    try {
      await postTransactionFirebase(
        db,
        newTransaction,
        transactionGroupsContext.filterId!,
        currentUser!,
        handleGroupChange.current,
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
      <Navbar
        setIsAddDialogOpen={setIsAddDialogOpen}
        currentUser={currentUser}
      />
      {currentUser && (
        <AddDialog
          isDialogOpen={isAddDialogOpen}
          setIsDialogOpen={setIsAddDialogOpen}
          user={currentUser}
          createTransaction={createTransaction}
        />
      )}
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
      <div className="mx-3 mt-12">
        <section className="mx-4 flex flex-col items-center">
          <div
            className={`${rancho.className} bg-theme-secondary w-full max-w-4xl rounded-md border-2 border-black py-1 text-center text-2xl shadow-[5px_5px_0px_rgba(0,0,0,1)] md:text-3xl`}
          >
            {currentUser?.name}&#39;s Profile
          </div>
        </section>
        <section className="mt-4 md:mt-10">
          {!loading && currentUser ? (
            <TransactionList currentUser={currentUser} db={db} />
          ) : (
            <TransactionListLoading />
          )}
        </section>
      </div>
    </div>
  );
};
export default Profile;
