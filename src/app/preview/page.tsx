import { getServerUser } from "@/utils/firebase/serverApp";
import { User } from "@firebase/auth";
import PreviewPage from "@/components/pages/preview/PreviewPage";

export default async function Login() {
  const { serverUser } = await getServerUser();

  return (
    <main>
      <PreviewPage initialUser={serverUser?.toJSON() as User} />
    </main>
  );
}
