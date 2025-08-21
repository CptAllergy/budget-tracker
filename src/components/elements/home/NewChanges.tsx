"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { HiRefresh } from "react-icons/hi";

const NewChanges = ({
  isChangeFound,
  setIsChangeFound,
}: {
  isChangeFound: boolean;
  setIsChangeFound: Dispatch<SetStateAction<boolean>>;
}) => {
  // TODO refactor to check the group, instead of the second user
  useEffect(() => {
    const checkGroupUpdates = async () => {
      // const latestSecondUser = await getUserByIdFirebase(db, secondUser.id);
      //
      // // Compare the most recent data to check for any changes
      // if (latestSecondUser && secondUser.total !== latestSecondUser.total) {
      //   setIsChangeFound(true);
      // } else {
      //   // No change found, check again after 10 seconds
      //   setTimeout(checkLatestTransaction, 10000);
      // }
    };

    const timer = setTimeout(checkGroupUpdates, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, [setIsChangeFound]);

  const refreshButtonStyle = isChangeFound
    ? "bg-theme-main animate-pulse"
    : "bg-gray-400 cursor-default opacity-0";

  const refreshButtonAction = () => {
    if (isChangeFound) {
      window.location.reload();
    }
  };

  return (
    <div className="m-5">
      <button
        className={`${refreshButtonStyle} rounded-full border-2 border-black p-1.5 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-colors`}
        onClick={refreshButtonAction}
      >
        <HiRefresh size={30} />
      </button>
    </div>
  );
};

export default NewChanges;
