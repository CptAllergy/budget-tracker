"use client";

import { AlertContextType, AlertType } from "@/contexts/AlertContext";
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
      break;
    }
    case "ADD_FAILED": {
      setAlertMessage("Failed to add new transaction");
      break;
    }
    case "UPDATE_FAILED": {
      setAlertMessage("Failed to update transaction");
      break;
    }
    default: {
      setAlertMessage("An unexpected error has occurred");
      setRefreshEnabled(true);
      break;
    }
  }
};

export const toggleStatusAlert = (
  alertContext: AlertContextType,
  alertMessage: string,
  alertType: AlertType = "info"
) => {
  const { setAlertEnabled, setRefreshEnabled, setAlertType, setAlertMessage } =
    alertContext;

  setAlertMessage(alertMessage);
  setAlertEnabled(true);
  setAlertType(alertType);
  setRefreshEnabled(false);
};
