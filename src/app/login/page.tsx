"use client";

import { Navbar } from "@/components/elements/navbar/Navbar";
import SignIn from "@/components/elements/signin/SignIn";

const Login = () => {
  return (
    <div className="flex flex-col items-center">
      <Navbar />
      <SignIn />
    </div>
  );
};

export default Login;
