"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/elements/navbar/Navbar";

const Home = () => {
  useEffect(() => {}, []);

  return (
    <div className="flex flex-col items-center bg-theme-background-light">
      <Navbar />
    </div>
  );
};

export default Home;
