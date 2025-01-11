import { Navbar } from "@/components/elements/navbar/Navbar";
import Link from "next/link";

const Forbidden = () => {
  return (
    <div className="flex flex-col items-center">
      <Navbar />
      <p className="mt-10">
        You do not have permission to access Budget Tracker. Only authorized
        users can access the application.
      </p>
      <p>
        You can check a preview{" "}
        <Link href="/preview" className="font-bold hover:underline">
          here
        </Link>
      </p>
    </div>
  );
};

export default Forbidden;
