import { AlertContextType, AlertType } from "@/contexts/AlertContext";
import { CustomErrorCode } from "@/types/errorTypes";

export const toggleStatusErrorAlert = (
  alertContext: AlertContextType,
  t: (translationKey: string) => string,
  errorCode: CustomErrorCode,
  error: unknown
) => {
  const { setAlertEnabled, setRefreshEnabled, setAlertType, setAlertMessage } =
    alertContext;

  setAlertEnabled(true);
  setAlertType("error");

  console.error(error);

  switch (errorCode) {
    case "DEFAULT_PAGE_FAILED": {
      setAlertMessage(t("alerts.error.defaultPageFailed"));
      setRefreshEnabled(false);
      break;
    }
    case "DELETE_FAILED": {
      setAlertMessage(t("alerts.error.deleteFailed"));
      setRefreshEnabled(false);
      break;
    }
    case "ADD_FAILED": {
      setAlertMessage(t("alerts.error.addFailed"));
      setRefreshEnabled(false);
      break;
    }
    case "UPDATE_FAILED": {
      setAlertMessage(t("alerts.error.updateFailed"));
      setRefreshEnabled(false);
      break;
    }
    case "LEAVE_GROUP_FAILED": {
      setAlertMessage(t("alerts.error.leaveGroupFailed"));
      setRefreshEnabled(false);
      break;
    }
    case "EARNINGS_FAILED": {
      setAlertMessage(t("alerts.error.earningsFailed"));
      setRefreshEnabled(false);
      break;
    }
    case "EXPENSES_FAILED": {
      setAlertMessage(t("alerts.error.expensesFailed"));
      setRefreshEnabled(false);
      break;
    }
    case "QUERY_FAILED": {
      setAlertMessage(t("alerts.error.queryFailed"));
      setRefreshEnabled(false);
      break;
    }
    default: {
      setAlertMessage(t("alerts.error.generic"));
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
