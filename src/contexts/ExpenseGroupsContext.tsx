"use client";

import React, { createContext, useState } from "react";
import { ExpenseGroupDTO } from "@/types/DTO/dataTypes";
import { ExpenseListType } from "@/types/componentTypes";

// TODO remove this file or think about adapting it to something better, some other way to manage application state
export type ExpenseGroupsContextType = {
  currentGroup?: ExpenseGroupDTO;
  filterId?: ExpenseListType;
  handleFilterChange: (
    newFilterId: ExpenseListType,
    newExpenseGroups?: ExpenseGroupDTO[]
  ) => void;
};

export const ExpenseGroupsContext = createContext<ExpenseGroupsContextType>({
  currentGroup: undefined,
  filterId: undefined,
  handleFilterChange: () => {},
});

type ProviderProps = {
  children?: React.ReactNode;
};

export const ExpenseGroupsContextProvider = ({ children }: ProviderProps) => {
  const { filterId, currentGroup, handleFilterChange } = useCurrentGroupState();

  const contextValue = {
    currentGroup,
    filterId,
    handleFilterChange,
  };

  return (
    <ExpenseGroupsContext.Provider value={contextValue}>
      {children}
    </ExpenseGroupsContext.Provider>
  );
};

const useCurrentGroupState = () => {
  const [filterId, setFilterId] = useState<ExpenseListType>();
  const [currentGroup, setCurrentGroup] = useState<ExpenseGroupDTO>();

  // This function updates the filterId and sets the current group based on the new filterId
  // TODO handleFilterChange can throw an error, so it should be used with try-catch
  // TODO This isn't even working anymore. The currentGroup only changes because the useEffect on the main page detects when the searchParams change
  const handleFilterChange = (
    newFilterId: ExpenseListType,
    newExpenseGroups?: ExpenseGroupDTO[]
  ) => {
    const groups = newExpenseGroups ? newExpenseGroups : [];

    if (newFilterId?.groupId && groups.length > 0) {
      // Match current group with new id
      const filteredGroup = groups.find(
        (group) => group.id === newFilterId?.groupId
      );
      if (!filteredGroup) {
        throw Error("No group found for selected filter");
      }
      setCurrentGroup(filteredGroup);
    } else {
      // User filter has no group
      setCurrentGroup(undefined);
    }
    setFilterId(newFilterId);
  };

  return {
    filterId,
    currentGroup,
    handleFilterChange,
  };
};
