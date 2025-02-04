import "@/styles/globals.css";
import { AlertSnackbar } from "@/components/alerts/AlertSnackbar";
import { AlertContextProvider } from "@/contexts/AlertContext";
import { Metadata } from "next";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { dmSans } from "@/styles/fonts";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={dmSans.className}>
      <body className="bg-theme-background-light">
        <SessionProvider>
          <AlertContextProvider>
            <AlertSnackbar />
            {children}
          </AlertContextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

// TODO add some icon
export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Helping you keep track of your money",
  // icons: {
  //   icon: "/favicon2.ico",
  // },
};
