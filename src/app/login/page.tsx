import LoginPage from "@/components/pages/login/LoginPage";
import { getServerUser } from "@/utils/firebase/serverApp";
import { User } from "@firebase/auth";

export default async function Login() {
  const { serverUser } = await getServerUser();

  return (
    <main>
      <LoginPage initialUser={serverUser?.toJSON() as User} />
    </main>
  );
}
