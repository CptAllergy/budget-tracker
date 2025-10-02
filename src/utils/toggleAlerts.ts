import { AlertContextType, AlertType } from "@/contexts/AlertContext";
import { CustomErrorCode } from "@/types/errorTypes";

export const toggleStatusErrorAlert = (
  alertContext: AlertContextType,
  errorCode: CustomErrorCode,
  error: unknown
) => {
  const { setAlertEnabled, setRefreshEnabled, setAlertType, setAlertMessage } =
    alertContext;

  setAlertEnabled(true);
  setAlertType("error");

  console.error(error);

  switch (errorCode) {
    case "SESSION_EXPIRED": {
      setAlertMessage("Your session has expired");
      setRefreshEnabled(false);
      break;
    }
    case "DELETE_FAILED": {
      setAlertMessage("Unexpected error while deleting");
      setRefreshEnabled(false);
      break;
    }
    case "ADD_FAILED": {
      setAlertMessage("Unexpected error while creating");
      setRefreshEnabled(false);
      break;
    }
    case "UPDATE_FAILED": {
      setAlertMessage("Unexpected error while updating");
      setRefreshEnabled(false);
      break;
    }
    case "EARNINGS_FAILED": {
      setAlertMessage("Unexpected error while loading earnings");
      setRefreshEnabled(false);
      break;
    }
    case "EXPENSES_FAILED": {
      setAlertMessage("Unexpected error while loading expenses");
      setRefreshEnabled(false);
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
