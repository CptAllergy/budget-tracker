"use client";

import { AlertContextType } from "@/contexts/AlertContext";

export const toggleStatusErrorAlert = (
  alertContext: AlertContextType,
  errorCode: number
) => {
  const { setAlertEnabled, setRefreshEnabled, setAlertType, setAlertMessage } =
    alertContext;

  setAlertEnabled(true);
  setAlertType("error");

  switch (errorCode) {
    case 401: {
      setAlertMessage(" Your session has expired!");
      setRefreshEnabled(true);
      break;
    }
    default: {
      setAlertMessage(`An unexpected error has ocurred: ${errorCode}`);
      setRefreshEnabled(false);
      break;
    }
  }
};

export const toggleStatusInfoAlert = (
  alertContext: AlertContextType,
  alertMessage: string
) => {
  const { setAlertEnabled, setRefreshEnabled, setAlertType, setAlertMessage } =
    alertContext;

  setAlertEnabled(true);
  setAlertType("info");
  setAlertMessage(alertMessage);
};
