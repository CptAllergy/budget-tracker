"use client";

import { useEffect, useState } from "react";

import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/utils/firebase/config";

export function useUser(initialUser?: User | null) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return user;
}
