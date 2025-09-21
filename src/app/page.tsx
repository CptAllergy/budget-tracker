import { getServerUser } from "@/utils/firebase/serverApp";
import { User } from "@firebase/auth";
import HomePage from "@/components/pages/home/HomePage";

export default async function Home() {
  const { serverUser } = await getServerUser();

  return (
    <main>
      <HomePage initialUser={serverUser?.toJSON() as User} />
    </main>
  );
}
