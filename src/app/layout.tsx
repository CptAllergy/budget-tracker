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
      <body className="absolute inset-0 -z-10 h-full w-full bg-orange-400 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px]">
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
