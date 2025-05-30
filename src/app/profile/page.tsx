"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/elements/navbar/Navbar";
import { CreateTransactionDTO } from "@/types/DTO/dataTypes";
import TransactionList from "@/components/elements/home/TransactionList";
import { AlertContext } from "@/contexts/AlertContext";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import {
  getTransactionGroupsFirebase,
  postTransactionFirebase,
} from "@/services/firebaseService";
import { TransactionListLoading } from "@/components/loading/elements/home/LoadingHome";
import { AddDialog } from "@/components/commons/dialogs/ActionDialog";
import { TransactionContext } from "@/contexts/TransactionsContext";
import { LuPlus } from "react-icons/lu";
import { rancho } from "@/styles/fonts";
import { TransactionGroupsContext } from "@/contexts/TransactionGroupsContext";
import { useFirebaseSetup } from "@/utils/hooks";
import { sortTransactionGroups } from "@/utils/sorters";

const Profile = () => {
  const alertContext = useRef(useContext(AlertContext));
  const transactionContext = useContext(TransactionContext);
  const transactionGroupsContext = useContext(TransactionGroupsContext);

  const setTransactionGroups = useRef(
    transactionGroupsContext.setTransactionGroups
  );

  const setTransactionDocs = useRef(transactionContext.setTransactionDocs);
  const handleFilterChange = useRef(
    transactionGroupsContext.handleFilterChange
  );
  const handleGroupChange = useRef(transactionGroupsContext.handleGroupChange);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { db, currentUser, firebaseLoading } = useFirebaseSetup();

  useEffect(() => {
    if (currentUser) {
      try {
        getTransactionGroupsFirebase(db, currentUser.id).then((groups) => {
          const sortedGroups = sortTransactionGroups(
            groups,
            currentUser.groupId
          );
          setTransactionGroups.current(sortedGroups);
        });
        handleFilterChange.current({ userId: currentUser.id });
      } catch {
        toggleStatusErrorAlert(alertContext.current, "GENERIC");
      }
    }
  }, [currentUser, db]);

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
        {!firebaseLoading && currentUser && (
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
          {!firebaseLoading && currentUser ? (
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
