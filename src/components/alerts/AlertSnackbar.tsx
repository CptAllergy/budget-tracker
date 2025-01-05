"use client";

import { AlertContext } from "@/contexts/AlertContext";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import React, { useState, useEffect } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { GiDuck } from "react-icons/gi";
import { GiFrogPrince } from "react-icons/gi";
import { GiCaterpillar } from "react-icons/gi";
import { GiGiantSquid } from "react-icons/gi";

interface SnackbarProps {
  duration?: number;
}

export const AlertSnackbar = ({ duration = 3000 }) => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const {
    isAlertEnabled, // toggle on or off
    isRefreshEnabled, // Toggle the refresh button on or off
    alertType, // should affect color and feel of alert --> Info, Warning, Error
    alertMessage, // Text that is displayed
    setAlertEnabled,
  } = useContext(AlertContext);

  var messageHeader, color, color2, easterMessage;

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  switch (alertType) {
    case "error": {
      //Define message and color
      messageHeader = "Error:";
      color = "text-red-500";
      color2 = "text-red-500";
      easterMessage = "Mr. Duck wants you to";
      break;
    }
    case "warning": {
      messageHeader = "Warning: ";
      color = "text-yellow-500";
      color2 = "text-yellow-200";
      easterMessage = "Prince Frog Warning";
      break;
    }
    case "info": {
      messageHeader = "Info: ";
      color = "text-blue-500";
      color2 = "text-blue-400";
      easterMessage = "Bizz bizz... Caterpillar says";
      break;
    }
    default: {
      messageHeader = "Alert: ";
      color = "text-green-400";
      color2 = "text-green-500";
      easterMessage = "The Kraken says";
    }
  }

  var easterEgg = false;

  // 10 % probability of showing the rubber duck
  if (Math.random() <= 0.11) {
    easterEgg = true;
  }

  return (
    <>
      {isAlertEnabled && (
        <div
          className={`duration-3000 fixed bottom-0 left-0 z-10 m-5 rounded-lg bg-gray-900 p-4 transition-opacity ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div>
            {easterEgg ? (
              <div className="flex items-center rounded bg-gray-900 p-4 text-white shadow-lg">
                <AlertIcon alertType={alertType} />
                <span className={`pr-1 ${color}`}>{messageHeader}</span>
                <span className={`ml-1 ${color2}`}>{easterMessage}</span>
                {isRefreshEnabled && (
                  <span
                    onClick={() => window.location.reload()}
                    className="ml-1 cursor-pointer text-white underline hover:text-red-800 hover:underline"
                  >
                    refresh
                  </span>
                )}
                <span className="ml-1 text-red-400">the page.</span>
                <span
                  onClick={() => setAlertEnabled(false)}
                  className="ml-1 cursor-pointer rounded-lg p-1 text-2xl text-blue-400 hover:bg-blue-200 hover:bg-opacity-50 hover:text-blue-600"
                >
                  <IoMdCloseCircle />
                </span>
              </div>
            ) : (
              <div className="flex items-center rounded bg-transparent p-4 text-white shadow-lg">
                <span className={`pr-2 ${color}`}>{messageHeader}</span>
                <span>{alertMessage}</span>
                {isRefreshEnabled && (
                  <>
                    <span className="ml-1">. Please</span>
                    <span
                      onClick={() => window.location.reload()}
                      className="ml-1 mr-1 cursor-pointer text-blue-400 hover:text-blue-600 hover:underline"
                    >
                      refresh
                    </span>
                    <span>the page.</span>
                  </>
                )}
                <span
                  onClick={() => setAlertEnabled(false)}
                  className="ml-1 cursor-pointer rounded-lg p-1 text-2xl text-blue-400 hover:bg-blue-200 hover:bg-opacity-50 hover:text-blue-600"
                >
                  <IoMdCloseCircle />
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const AlertIcon = ({ alertType }: { alertType: string }) => {
  let IconComponent;
  let color;

  switch (alertType) {
    case "error": {
      IconComponent = GiDuck;
      color = "text-red-500";
      break;
    }
    case "warning": {
      IconComponent = GiFrogPrince;
      color = "text-yellow-200";
      break;
    }
    case "info": {
      IconComponent = GiCaterpillar;
      color = "text-blue-400";
      break;
    }
    default: {
      IconComponent = GiGiantSquid;
      color = "text-green-500";
    }
  }

  return <IconComponent className={`mx-1 h-6 w-6 ${color}`} />;
};
