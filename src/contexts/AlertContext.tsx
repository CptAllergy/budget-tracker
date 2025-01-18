"use client";

import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useState,
} from "react";

type AlertType = "error" | "warning" | "info";

export type AlertContextType = {
  isAlertEnabled: boolean;
  isRefreshEnabled: boolean;
  alertType: AlertType;
  alertMessage: string;
  setAlertEnabled: Dispatch<SetStateAction<boolean>>;
  setRefreshEnabled: Dispatch<SetStateAction<boolean>>;
  setAlertType: Dispatch<SetStateAction<AlertType>>;
  setAlertMessage: Dispatch<SetStateAction<string>>;
};

export const AlertContext = createContext<AlertContextType>({
  isAlertEnabled: false,
  isRefreshEnabled: false,
  alertType: "error",
  alertMessage: "",
  setAlertEnabled: () => {},
  setRefreshEnabled: () => {},
  setAlertType: () => {},
  setAlertMessage: () => {},
});

type ProviderProps = {
  children?: React.ReactNode;
};

export const AlertContextProvider = ({ children }: ProviderProps) => {
  const [isAlertEnabled, setAlertEnabled] = useState<boolean>(false);
  const [isRefreshEnabled, setRefreshEnabled] = useState<boolean>(false);
  const [alertType, setAlertType] = useState<AlertType>("error");
  const [alertMessage, setAlertMessage] = useState<string>(
    "Generic Alert Message"
  );

  const contextValue = {
    isAlertEnabled,
    isRefreshEnabled,
    alertType,
    alertMessage,
    setAlertEnabled,
    setRefreshEnabled,
    setAlertType,
    setAlertMessage,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
    </AlertContext.Provider>
  );
};
