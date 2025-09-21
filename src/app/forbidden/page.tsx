import { getServerUser } from "@/utils/firebase/serverApp";
import { User } from "@firebase/auth";
import ForbiddenPage from "@/components/pages/forbidden/ForbiddenPage";

export default async function Login() {
  const { serverUser } = await getServerUser();

  return (
    <main>
      <ForbiddenPage initialUser={serverUser?.toJSON() as User} />
    </main>
  );
}
