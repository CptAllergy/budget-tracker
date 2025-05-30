import { signOut, useSession } from "next-auth/react";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FirebaseOptions, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { getCurrentUserFirebase } from "@/services/firebaseService";
import { UserDTO } from "@/types/DTO/dataTypes";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";

export function useFirebaseSetup() {
  const alertContext = useRef(useContext(AlertContext));

  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserDTO>();

  const { data: session } = useSession();

  const db = useMemo(() => {
    const firebaseConfig: FirebaseOptions = JSON.parse(
      process.env.NEXT_PUBLIC_FIREBASE_CONFIG!!
    );
    const app = initializeApp(firebaseConfig);
    return getFirestore(app, "(default)");
  }, []);

  useEffect(() => {
    const auth = getAuth();
    if (session?.user?.id_token) {
      const credential = GoogleAuthProvider.credential(session.user.id_token);
      signInWithCredential(auth, credential)
        .then(async (credentials) => {
          // Set the current and second user
          await getCurrentUserFirebase(
            db,
            credentials.user.uid,
            setCurrentUser as Dispatch<SetStateAction<UserDTO>>
          );
          setFirebaseLoading(false);
        })
        .catch((error) => {
          if (error.code === "auth/invalid-credential") {
            // Update session storage with auth error
            sessionStorage.setItem("session_error", "true");
            void signOut();
          } else {
            toggleStatusErrorAlert(alertContext.current, "GENERIC");
          }
        });
    }
  }, [session?.user?.id_token, db]);

  return {
    db,
    currentUser,
    firebaseLoading,
  };
}
