import { onIdTokenChanged, User } from "@firebase/auth";
import { useEffect } from "react";
import { auth } from "@/utils/firebase/config";
import { deleteCookie, setCookie } from "cookies-next";
import { useQueryClient } from "@tanstack/react-query";

export function useUserSession(initialUser: User | null) {
  const queryClient = useQueryClient();
  useEffect(() => {
    return onIdTokenChanged(auth, async (user: User | null) => {
      if (user) {
        const idToken = await user.getIdToken();
        await setCookie("__session", idToken, { secure: true });
      } else {
        await deleteCookie("__session");
        queryClient.clear();
      }
      if (initialUser?.uid === user?.uid) {
        return;
      }
      window.location.reload();
    });
  }, [initialUser, queryClient]);

  return initialUser;
}
