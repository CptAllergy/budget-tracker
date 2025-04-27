"use client";

import { CreateTransactionDTO, UserDTO } from "@/types/DTO/dataTypes";
import { Dispatch, SetStateAction, useContext, useEffect, useRef } from "react";
import { Firestore, Timestamp } from "firebase/firestore";
import { SubmitHandler, useForm } from "react-hook-form";
import { isValidAmount } from "@/utils/helpers/parsers";
import { AlertContext } from "@/contexts/AlertContext";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import { addNewTransactionFirebase } from "@/services/firebaseService";
import { TransactionContext } from "@/contexts/TransactionsContext";
import {
  FormInputNumber,
  FormInputText,
} from "@/components/commons/input/Text";

const NewTransaction = ({
  user,
  setUser,
  db,
}: {
  user: UserDTO;
  setUser: Dispatch<SetStateAction<UserDTO>>;
  db: Firestore;
}) => {
  const alertContext = useRef(useContext(AlertContext));
  const transactionContext = useContext(TransactionContext);
  const setTransactionDocs = useRef(transactionContext.setTransactionDocs);

  const { register, handleSubmit, reset, formState } =
    useForm<CreateTransactionDTO>();

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset();
    }
  }, [formState, reset]);

  const onSubmit: SubmitHandler<CreateTransactionDTO> = async (newData) => {
    // Replace comma with period
    const amountString = newData.amount.toString().replace(",", ".");

    if (!isValidAmount(amountString)) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
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
      await addNewTransactionFirebase(
        db,
        newTransaction,
        user,
        setUser,
        setTransactionDocs.current
      );

      toggleStatusAlert(alertContext.current, "New transaction created");
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
      throw "Error adding new transaction";
    }
  };

  return (
    <form
      className="mx-1 mt-5 w-full max-w-4xl rounded-md border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] md:mt-10"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="bg-theme-secondary rounded-t-md border-b-2 border-black py-1 text-center text-base font-bold md:text-xl">
        Add Transaction ({user.name})
      </h2>
      <div className="bg-theme-highlight flex flex-col items-center rounded-b-md p-4">
        <div className="space-y-2">
          <FormInputText register={register} formState={formState} />
          <FormInputNumber register={register} formState={formState} />
        </div>
        <SubmitButton />
      </div>
    </form>
  );
};

const SubmitButton = () => {
  return (
    <div className="mt-2">
      <button
        type="submit"
        className="bg-theme-main hover:bg-theme-hover rounded-md border-2 border-black px-2 py-0.5 font-semibold text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition hover:shadow-[3px_3px_0px_rgba(0,0,0,1)]"
      >
        Submit
      </button>
    </div>
  );
};

export default NewTransaction;
