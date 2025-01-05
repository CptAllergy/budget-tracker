"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Navbar } from "@/components/elements/navbar/Navbar";
import { Transaction, UserTotalTransactions } from "@/types/dataTypes";
import { SubmitHandler, useForm } from "react-hook-form";

const Home = () => {
  useEffect(() => {}, []);

  const initialTransactions: Transaction[] = [
    {
      label: "Compras Pingo doce",
      amount: 25.78,
      userId: "Carolina",
    },
    {
      label: "Mesas de Cabeceira",
      amount: 180,
      userId: "Gonçalo",
    },
  ];

  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const goncaloTotalInit: UserTotalTransactions = {
    username: "Gonçalo",
    total: 180,
  };

  const carolinaTotalInit: UserTotalTransactions = {
    username: "Carolina",
    total: 25.78,
  };

  const [goncaloUserTotal, setGoncaloUserTotal] = useState(goncaloTotalInit);
  const [carolinaUserTotal, setCarolinaUserTotal] = useState(carolinaTotalInit);

  return (
    <div className="flex flex-col items-center">
      <Navbar />
      <div className="mt-10">
        <Totals user1={goncaloUserTotal} user2={carolinaUserTotal} />
        <Transactions transactions={transactions} />
        <section className="flex flex-col md:flex-row md:space-x-10">
          <NewTransaction
            transactions={transactions}
            setTransactions={setTransactions}
            userTotal={goncaloUserTotal}
            setUserTotal={setGoncaloUserTotal}
          />
          <NewTransaction
            transactions={transactions}
            setTransactions={setTransactions}
            userTotal={carolinaUserTotal}
            setUserTotal={setCarolinaUserTotal}
          />
        </section>
      </div>
    </div>
  );
};

const Totals = ({
  user1,
  user2,
}: {
  user1: UserTotalTransactions;
  user2: UserTotalTransactions;
}) => {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const balance = user1.total - user2.total;

    const [sender, receiver] =
      balance > 0
        ? [user2.username, user1.username]
        : [user1.username, user2.username];

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

const Transactions = ({ transactions }: { transactions: Transaction[] }) => {
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
  transactions: Transaction[];
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  userTotal: UserTotalTransactions;
  setUserTotal: Dispatch<SetStateAction<UserTotalTransactions>>;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Transaction>();

  // TODO initial value for what? confirm this later
  const [formData, setFormData] = useState<Transaction>({
    label: "",
    amount: 0,
    userId: "",
  });

  const onSubmit: SubmitHandler<Transaction> = (data) => {
    const newTransaction: Transaction = {
      label: data.label,
      amount: data.amount as number,
      userId: userTotal.username,
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
    <form className="mt-10 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-3 text-xl font-bold">{userTotal.username}</h2>
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
          className="rounded-md bg-slate-700 px-2 py-0.5 font-semibold text-white transition-colors hover:bg-slate-900"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default Home;
