"use client";

import { UserDTO } from "@/types/DTO/dataTypes";
import { useEffect, useState } from "react";
import { rancho } from "@/styles/fonts";

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
    <div className="bg-theme-secondary w-full max-w-4xl rounded-md border-2 border-black py-1 text-center shadow-[5px_5px_0px_rgba(0,0,0,1)]">
      <div className={`${rancho.className} text-2xl md:text-3xl`}>
        <span className="">
          {sender} owes {receiver}{" "}
        </span>
        <span className="font-bold">{Number(balance).toFixed(2)}€</span>
      </div>
    </div>
  );
};

export default Totals;
