"use client";

import { UserDTO } from "@/types/DTO/dataTypes";
import { useEffect, useState } from "react";

const Totals = ({ user1, user2 }: { user1: UserDTO; user2: UserDTO }) => {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const balance = user1.total / 2 - user2.total / 2;

    const [sender, receiver] =
      balance > 0 ? [user2.name, user1.name] : [user1.name, user2.name];

    setSender(sender);
    setReceiver(receiver);
    setBalance(Math.abs(balance));
  }, [user1, user2]);

  return (
    <div className="mx-1">
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

export default Totals;
