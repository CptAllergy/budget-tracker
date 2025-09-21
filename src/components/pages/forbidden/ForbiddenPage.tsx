import { Navbar } from "@/components/pages/navbar/Navbar";
import Link from "next/link";
import { User } from "@firebase/auth";

type Props = { initialUser: User | null };

const Forbidden = ({ initialUser }: Props) => {
  return (
    <div className="flex flex-col items-center">
      <Navbar initialUser={initialUser} />
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
