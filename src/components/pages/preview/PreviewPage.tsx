"use client";

import { Navbar } from "@/components/pages/navbar/Navbar";
import { User } from "@firebase/auth";

type Props = { initialUser: User | null };

const Preview = ({ initialUser }: Props) => {
  return (
    <div className="flex flex-col items-center">
      <Navbar initialUser={initialUser} />
      <div className="mt-10">Preview page is under construction</div>
    </div>
  );
};

export default Preview;
