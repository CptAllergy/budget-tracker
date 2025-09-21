import { getServerUser } from "@/utils/firebase/serverApp";
import { User } from "@firebase/auth";
import ReportsPage from "@/components/pages/reports/ReportsPage";

export default async function Login() {
  const { serverUser } = await getServerUser();

  return (
    <main>
      <ReportsPage initialUser={serverUser?.toJSON() as User} />
    </main>
  );
}
