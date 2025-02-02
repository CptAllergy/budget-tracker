"use client";

import { Navbar } from "@/components/elements/navbar/Navbar";
import { useContext, useEffect, useRef } from "react";
import { AlertContext } from "@/contexts/AlertContext";
import { toggleStatusAlert } from "@/utils/toggleAlerts";

const Login = () => {
  const alertContext = useRef(useContext(AlertContext));

  useEffect(() => {
    const sessionError = sessionStorage.getItem("session_error");
    if (sessionError) {
      toggleStatusAlert(
        alertContext.current,
        "Your session has expired. Please login again",
        "warning"
      );
      sessionStorage.removeItem("session_error");
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      <Navbar />
      <p className="mx-3 mt-10 text-xl">Welcome to Budget Tracker!</p>
      <p className="mx-3 mt-5 w-80">
        Budget Tracker helps you manage splitting money between 2 persons. It
        keeps tracks of your transactions and your partner&#39;s, letting you
        know how much money you owe each other.
      </p>
    </div>
  );
};

export default Login;
