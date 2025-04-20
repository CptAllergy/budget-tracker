"use client";

import { CreateTransactionDTO, UserDTO } from "@/types/DTO/dataTypes";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Firestore, Timestamp } from "firebase/firestore";
import {
  FormState,
  SubmitHandler,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import { isNumeric, isValidAmount } from "@/utils/helpers/parsers";
import { AlertContext } from "@/contexts/AlertContext";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import { MdErrorOutline } from "react-icons/md";
import { addNewTransactionFirebase } from "@/services/firebaseService";
import { TransactionContext } from "@/contexts/TransactionsContext";

type FormInputs = "label" | "amount";

type FormInputType = {
  fieldName: FormInputs;
  formState: FormState<CreateTransactionDTO>;
};

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
      <h2 className="rounded-t-md border-b-2 border-black bg-theme-secondary py-1 text-center text-base font-bold md:text-xl">
        Add Transaction ({user.name})
      </h2>
      <div className="flex flex-col items-center rounded-b-md bg-theme-highlight p-4">
        <div className="space-y-2">
          <FormInputText register={register} formState={formState} />
          <FormInputNumber register={register} formState={formState} />
        </div>
        <SubmitButton />
      </div>
    </form>
  );
};

const FormInputText = ({
  register,
  formState,
}: {
  register: UseFormRegister<CreateTransactionDTO>;
  formState: FormState<CreateTransactionDTO>;
}) => {
  return (
    <FormInputError fieldName="label" formState={formState}>
      <input
        type="text"
        placeholder="Description"
        {...register("label", { required: "Description is required" })}
      />
    </FormInputError>
  );
};

const FormInputNumber = ({
  register,
  formState,
}: {
  register: UseFormRegister<CreateTransactionDTO>;
  formState: FormState<CreateTransactionDTO>;
}) => {
  return (
    <FormInputError fieldName="amount" formState={formState}>
      <input
        type="number"
        step="0.01"
        placeholder="Amount"
        onWheel={(e) => (e.target as HTMLElement).blur()}
        {...register("amount", {
          required: "Amount is required",
          min: { value: 0.01, message: "Amount must be positive" },
          max: { value: 5000, message: "Amount can't be higher than 5000" },
        })}
      />
    </FormInputError>
  );
};

const FormInputError = ({
  fieldName,
  formState,
  children,
}: PropsWithChildren<FormInputType>) => {
  const { errors } = formState;

  return (
    <div className="flex flex-col sm:flex-row">
      <div className="relative w-fit rounded-sm border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]">
        {children}
        <div className="absolute inset-y-0 right-0 flex items-center pr-1 text-red-700">
          {errors[fieldName] && <MdErrorOutline size="18" />}
        </div>
      </div>
      {errors[fieldName] && (
        <span className="font-semibold text-red-700 sm:pl-2">
          {errors[fieldName]?.message}
        </span>
      )}
    </div>
  );
};

const SubmitButton = () => {
  return (
    <div className="mt-2">
      <button
        type="submit"
        className="rounded-md border-2 border-black bg-theme-main px-2 py-0.5 font-semibold text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition hover:bg-theme-hover hover:shadow-[3px_3px_0px_rgba(0,0,0,1)]"
      >
        Submit
      </button>
    </div>
  );
};

export default NewTransaction;
