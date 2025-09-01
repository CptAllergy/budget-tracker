"use client";

import { AlertContext } from "@/contexts/AlertContext";
import React, { useContext, useEffect, useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { FaTerminal } from "react-icons/fa6";

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

  // Hide info alerts automatically with a timeout
  useEffect(() => {
    const fadeOutAlert = () => {
      setOpacity(opacityOut);
      setTimeout(() => setAlertEnabled(false), 300);
    };

    setOpacity(opacityIn);
    if (isAlertEnabled && alertType === "info") {
      setTimeout(fadeOutAlert, 3000);
    }
  }, [isAlertEnabled, setAlertEnabled, alertType]);

  return (
    <>
      {isAlertEnabled && (
        <div
          className={`${opacity} bg-theme-secondary fixed right-5 bottom-5 left-5 z-20 rounded-md border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-opacity md:right-auto md:mr-5`}
        >
          <div className="flex w-full items-center p-4 font-medium">
            <span className="pr-3">
              <FaTerminal size={13} />
            </span>
            <p className="w-full">
              {alertMessage}
              {isRefreshEnabled && (
                <>
                  . Please
                  <button
                    onClick={() => window.location.reload()}
                    className="text-theme-main hover:text-theme-hover mr-1 ml-1 cursor-pointer hover:underline"
                  >
                    refresh
                  </button>
                  the page
                </>
              )}
            </p>
            {!isRefreshEnabled && (
              <span
                onClick={() => setAlertEnabled(false)}
                className="hover:bg-opacity-50 ml-2 cursor-pointer rounded-xl p-0.5 text-black hover:bg-gray-600 hover:text-gray-800"
              >
                <IoMdCloseCircle size={25} />
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};
