"use client";

import {
  CreateTransactionDTO,
  TransactionDTO,
  UserDTO,
} from "@/types/DTO/dataTypes";
import { Dispatch, SetStateAction, useContext, useRef, useState } from "react";
import {
  collection,
  doc,
  Firestore,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { SubmitHandler, useForm } from "react-hook-form";
import { isNumeric } from "@/utils/helpers/parsers";
import { AlertContext } from "@/contexts/AlertContext";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";

const NewTransaction = ({
  transactions,
  setTransactions,
  user,
  setUser,
  db,
}: {
  transactions: TransactionDTO[];
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>;
  user: UserDTO;
  setUser: Dispatch<SetStateAction<UserDTO>>;
  db: Firestore;
}) => {
  const alertContext = useRef(useContext(AlertContext));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateTransactionDTO>();

  // TODO initial value for what? confirm this later
  const [formData, setFormData] = useState<CreateTransactionDTO>({
    label: "",
    amount: 0,
    userId: "",
    username: "",
    // TODO what is this even? might not make sense
    timestamp: Timestamp.fromDate(new Date()),
  });

  const onSubmit: SubmitHandler<CreateTransactionDTO> = async (newData) => {
    // Replace comma with period
    const amountString = newData.amount.toString().replace(",", ".");

    // TODO do some proper validations and assertions and return some error
    if (
      !isNumeric(amountString) ||
      Number(amountString) < 0 ||
      Number(amountString) > 5000
    ) {
      // TODO toggle some ui elements or popups explaining the errors
      return;
    }

    const newTransaction: CreateTransactionDTO = {
      label: newData.label,
      amount: Number(amountString),
      userId: user.id,
      username: user.name,
      timestamp: Timestamp.fromDate(new Date()),
    };

    try {
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
      // TODO clear input after submitting
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
    }
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-3 text-xl font-bold">New {user.name} Transaction</h2>
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
          step="0.01"
          placeholder="Amount"
          {...register("amount", { required: true })}
        />
        {errors.amount && <span>This field is required</span>}
      </div>

      <div className="mt-2">
        <button
          type="submit"
          className="rounded-md bg-theme-main px-2 py-0.5 font-semibold text-white transition-colors hover:bg-slate-900"
        >
          Submit
        </button>
      </div>
    </form>
  );
};
export default NewTransaction;
