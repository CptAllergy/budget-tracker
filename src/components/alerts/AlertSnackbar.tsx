"use client";

import { AlertContext } from "@/contexts/AlertContext";
import React, { useContext, useEffect, useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";

export const AlertSnackbar = () => {
  const {
    isAlertEnabled, // toggle on or off
    isRefreshEnabled, // Toggle the refresh button on or off
    alertType, // should affect color and feel of alert --> Info, Warning, Error
    alertMessage, // Text that is displayed
    setAlertEnabled,
  } = useContext(AlertContext);

  const opacityIn = "opacity-100 duration-0";
  const opacityOut = "opacity-0 duration-300";
  const [opacity, setOpacity] = useState<string>(opacityIn);

  const fadeOutAlert = () => {
    setOpacity(opacityOut);
    setTimeout(() => setAlertEnabled(false), 300);
  };

  // Hide info alerts automatically with a timeout
  useEffect(() => {
    setOpacity(opacityIn);
    if (isAlertEnabled && alertType === "info") {
      setTimeout(fadeOutAlert, 3000);
    }
  }, [isAlertEnabled, alertType]);

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
        <div
          className={`${opacity} fixed bottom-0 left-0 z-10 m-5 rounded-md border-2 border-black bg-theme-secondary shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-opacity`}
        >
          <div className="flex items-center p-4 font-medium">
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
                className="ml-1 cursor-pointer rounded-xl p-1 text-2xl text-black hover:bg-gray-600 hover:bg-opacity-50 hover:text-gray-800"
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
