"use client";

import {
  CreateTransactionDTO,
  TransactionDTO,
  UserDTO,
} from "@/types/DTO/dataTypes";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  collection,
  doc,
  Firestore,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import {
  FormState,
  SubmitHandler,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import { isNumeric } from "@/utils/helpers/parsers";
import { AlertContext } from "@/contexts/AlertContext";
import {
  toggleStatusErrorAlert,
  toggleStatusInfoAlert,
} from "@/utils/toggleAlerts";
import { MdErrorOutline } from "react-icons/md";

type FormInputs = "label" | "amount";

type FormInputType = {
  fieldName: FormInputs;
  formState: FormState<CreateTransactionDTO>;
};

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

    if (
      // Validate amount
      !isNumeric(amountString) ||
      Number(amountString) <= 0 ||
      Number(amountString) > 5000
    ) {
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

      toggleStatusInfoAlert(
        alertContext.current,
        "New transaction added successfully"
      );
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
    }
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-3 text-xl font-bold">New {user.name} Transaction</h2>
      <div className="space-y-2">
        <FormInputText register={register} formState={formState} />
        <FormInputNumber register={register} formState={formState} />
      </div>

      <SubmitButton />
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
      <div className="relative w-fit">
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
        className="rounded-md bg-theme-main px-2 py-0.5 font-semibold text-white transition-colors hover:bg-slate-900"
      >
        Submit
      </button>
    </div>
  );
};

export default NewTransaction;
