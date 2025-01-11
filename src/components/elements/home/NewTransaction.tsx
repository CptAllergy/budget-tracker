import {
  CreateTransactionDTO,
  TransactionDTO,
  UserDTO,
} from "@/types/DTO/dataTypes";
import { Dispatch, SetStateAction, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { SubmitHandler, useForm } from "react-hook-form";
import { isNumeric } from "@/utils/helpers/parsers";

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

    // TODO do some proper validations and assertions
    if (
      !isNumeric(amountString) ||
      Number(amountString) < 0 ||
      Number(amountString) > 5000
    ) {
      return;
    }

    const newTransaction: CreateTransactionDTO = {
      label: newData.label,
      amount: Number(amountString),
      userId: user.id,
      username: user.name,
      timestamp: Timestamp.fromDate(new Date()),
    };

    // TODO What happens when this fails
    const transactionRef = await addDoc(
      collection(db, "transactions"),
      newTransaction
    );
    setTransactions([
      { id: transactionRef.id, ...newTransaction },
      ...transactions,
    ]);

    // Update the user total by adding the new transaction
    // TODO What happens when this fails
    const userRef = doc(db, "users", user.id);
    const userDocument = (await getDoc(userRef)).data() as UserDTO;

    setDoc(
      userRef,
      { total: userDocument.total + newTransaction.amount },
      { merge: true }
    ).then(() => {
      // TODO get full new value from database
      setUser((prevState) => {
        return {
          ...prevState,
          total: userDocument.total + newTransaction.amount,
        };
      });
    });
  };

  // TODO clear input after submitting

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
          className="rounded-md bg-slate-700 px-2 py-0.5 font-semibold text-white transition-colors hover:bg-slate-900"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default NewTransaction;
