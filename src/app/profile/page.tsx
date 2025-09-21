import { getServerUser } from "@/utils/firebase/serverApp";
import { User } from "@firebase/auth";
import ProfilePage from "@/components/pages/profile/ProfilePage";

export default async function Profile() {
  const { serverUser } = await getServerUser();

  return (
    <main>
      <ProfilePage initialUser={serverUser?.toJSON() as User} />
    </main>
  );
}
