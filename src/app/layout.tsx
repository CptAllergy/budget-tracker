import "@/styles/globals.css";
import { AlertSnackbar } from "@/components/alerts/AlertSnackbar";
import { AlertContextProvider } from "@/contexts/AlertContext";
import { Metadata } from "next";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Helping you keep track of your money",
  // icons: {
  //   icon: "/favicon2.ico",
  // },
};
