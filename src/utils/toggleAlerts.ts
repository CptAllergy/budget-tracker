"use client";

import { AlertContextType } from "@/contexts/AlertContext";
import { CustomErrorCode } from "@/types/errorTypes";

export const toggleStatusErrorAlert = (
  alertContext: AlertContextType,
  errorCode: CustomErrorCode
) => {
  const { setAlertEnabled, setRefreshEnabled, setAlertType, setAlertMessage } =
    alertContext;

  setAlertEnabled(true);
  setAlertType("error");

  switch (errorCode) {
    case "SESSION_EXPIRED": {
      setAlertMessage("Your session has expired");
      setRefreshEnabled(false);
      break;
    }
    case "DELETE_FAILED": {
      setAlertMessage("Failed to remove transaction");
      setRefreshEnabled(true);
      break;
    }
    case "ADD_FAILED": {
      setAlertMessage("Failed to add new transaction");
      setRefreshEnabled(true);
      break;
    }
    default: {
      setAlertMessage("An unexpected error has occurred");
      setRefreshEnabled(true);
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

  setAlertMessage(alertMessage);
  setAlertEnabled(true);
  setAlertType("info");
  setRefreshEnabled(false);
};
