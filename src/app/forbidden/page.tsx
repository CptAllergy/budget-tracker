"use client";

import { Navbar } from "@/components/elements/navbar/Navbar";

const Forbidden = () => {
  // TODO a preview here and improve this page
  return (
    <div className="flex flex-col items-center">
      <Navbar />
      <p className="mt-10">
        You do not have permission to access Budget Tracker. Only authorized
        users can access the application.
      </p>
      <p>You can check a preview here</p>
    </div>
  );
};

export default Forbidden;
