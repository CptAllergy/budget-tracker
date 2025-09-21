import "@/styles/globals.css";
import { AlertSnackbar } from "@/components/commons/alerts/AlertSnackbar";
import { AlertContextProvider } from "@/contexts/AlertContext";
import { Metadata } from "next";
import { ReactNode } from "react";

import { dmSans } from "@/styles/fonts";
import QueryProvider from "@/contexts/QueryContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={dmSans.className}>
      <body className="absolute inset-0 -z-10 h-full w-full bg-orange-400 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px]">
        <QueryProvider>
          <AlertContextProvider>
            <AlertSnackbar />
            {children}
          </AlertContextProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Helping keep track of your money",
  icons: {
    icon: "/icons/favicon.ico",
  },
};
