"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Navbar } from "@/components/elements/navbar/Navbar";
import { SubmitHandler, useForm } from "react-hook-form";
import { TransactionDTO, UserDTO } from "@/types/DTO/dataTypes";
import { Timestamp } from "firebase/firestore";

const Home = () => {
  const initialTransactions: TransactionDTO[] = [
    {
      id: "1",
      label: "Groceries",
      amount: 23.4,
      userId: "User 1",
      username: "User 1",
      timestamp: Timestamp.fromDate(new Date()),
    },
    {
      id: "2",
      label: "Chairs",
      amount: 80,
      userId: "User 2",
      username: "User 2",
      timestamp: Timestamp.fromDate(new Date()),
    },
  ];

  const [transactions, setTransactions] =
    useState<TransactionDTO[]>(initialTransactions);

  const user1Init: UserDTO = {
    id: "idUser1",
    name: "User 1",
    email: "user1@email.com",
    total: 23.4,
  };

  const user2Init: UserDTO = {
    id: "idUser2",
    name: "User 2",
    email: "user2@email.com",
    total: 80,
  };

  const [user1, setUser1] = useState(user1Init);
  const [user2, setUser2] = useState(user2Init);

  return (
    <div className="flex flex-col items-center">
      <Navbar />
      <div className="mt-10">
        <Totals user1={user1} user2={user2} />
        <section className="flex flex-col md:flex-row md:space-x-10">
          <NewTransaction
            transactions={transactions}
            setTransactions={setTransactions}
            userTotal={user1}
            setUserTotal={setUser1}
          />
          <NewTransaction
            transactions={transactions}
            setTransactions={setTransactions}
            userTotal={user2}
            setUserTotal={setUser2}
          />
        </section>
        <Transactions transactions={transactions} />
      </div>
    </div>
  );
};

const Totals = ({ user1, user2 }: { user1: UserDTO; user2: UserDTO }) => {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const balance = user1.total - user2.total;

    const [sender, receiver] =
      balance > 0 ? [user2.name, user1.name] : [user1.name, user2.name];

    setSender(sender);
    setReceiver(receiver);
    setBalance(Math.abs(balance));
  }, [user1, user2]);

  return (
    <div>
      <h2 className="mb-3 text-xl font-bold">Totals</h2>
      <div className="underline">
        <span>
          {sender} owes {receiver}{" "}
        </span>
        <span className="font-bold">{Number(balance).toFixed(2)}€</span>
      </div>
    </div>
  );
};

const Transactions = ({ transactions }: { transactions: TransactionDTO[] }) => {
  return (
    <div className="mt-3">
      <h2 className="mb-3 text-xl font-bold">Transactions</h2>
      {transactions.map((transaction, index) => (
        <div key={index}>
          <span className="font-bold">{transaction.label} - </span>
          <span>{Number(transaction.amount).toFixed(2)}€ - </span>
          <span>{transaction.userId}</span>
        </div>
      ))}
    </div>
  );
};

const NewTransaction = ({
  transactions,
  setTransactions,
  userTotal,
  setUserTotal,
}: {
  transactions: TransactionDTO[];
  setTransactions: Dispatch<SetStateAction<TransactionDTO[]>>;
  userTotal: UserDTO;
  setUserTotal: Dispatch<SetStateAction<UserDTO>>;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransactionDTO>();

  const onSubmit: SubmitHandler<TransactionDTO> = (data) => {
    const newTransaction: TransactionDTO = {
      id: "id",
      label: data.label,
      amount: data.amount as number,
      userId: userTotal.id,
      username: userTotal.name,
      timestamp: Timestamp.fromDate(new Date()),
    };
    // Update transactions list
    setTransactions([...transactions, newTransaction]);

    // Update the user total by adding the new transaction
    setUserTotal((prevState) => {
      console.log(prevState);
      return {
        ...prevState,
        total: Number(prevState.total) + Number(data.amount),
      };
    });
  };

  return (
    <form className="mt-5 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-3 text-xl font-bold">{userTotal.name}</h2>
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

export default Home;
