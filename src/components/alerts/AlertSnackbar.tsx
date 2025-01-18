"use client";

import { AlertContext } from "@/contexts/AlertContext";
import React, { useContext } from "react";
import { IoMdCloseCircle } from "react-icons/io";

interface SnackbarProps {
  duration?: number;
}

export const AlertSnackbar = ({ duration = 3000 }) => {
  const {
    isAlertEnabled, // toggle on or off
    isRefreshEnabled, // Toggle the refresh button on or off
    alertType, // should affect color and feel of alert --> Info, Warning, Error
    alertMessage, // Text that is displayed
    setAlertEnabled,
  } = useContext(AlertContext);

  // TODO add timeout to hide

  const getAlertProps = () => {
    switch (alertType) {
      case "error":
        return {
          headerMessage: "Error:",
          color: "text-red-500",
        };
      case "warning":
        return {
          headerMessage: "Warning: ",
          color: "text-yellow-500",
        };
      case "info":
        return {
          headerMessage: "",
          color: "text-blue-500",
        };
    }
  };

  const { headerMessage, color } = getAlertProps();

  return (
    <>
      {isAlertEnabled && (
        <div className="fixed bottom-0 left-0 z-10 m-5 rounded-lg bg-slate-800">
          <div className="flex items-center p-4 text-white">
            <span className={`pr-2 font-semibold ${color}`}>
              {headerMessage}
            </span>
            <span>{alertMessage}</span>
            {isRefreshEnabled ? (
              <>
                <span className="ml-1">. Please</span>
                <span
                  onClick={() => window.location.reload()}
                  className="ml-1 mr-1 cursor-pointer text-blue-400 hover:text-blue-300 hover:underline"
                >
                  refresh
                </span>
                <span>the page.</span>
              </>
            ) : (
              <span
                onClick={() => setAlertEnabled(false)}
                className="ml-1 cursor-pointer rounded-xl p-1 text-2xl text-blue-400 hover:bg-blue-200 hover:bg-opacity-50 hover:text-blue-600"
              >
                <IoMdCloseCircle />
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};
