"use client";

import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import { ExpenseGroupDTO } from "@/types/DTO/dataTypes";
import { ExpenseListType } from "@/types/componentTypes";

export type ExpenseGroupsContextType = {
  expenseGroups: ExpenseGroupDTO[];
  setExpenseGroups: Dispatch<SetStateAction<ExpenseGroupDTO[]>>;
  currentGroup?: ExpenseGroupDTO;
  filterId?: ExpenseListType;
  handleFilterChange: (
    newFilterId: ExpenseListType,
    newExpenseGroups?: ExpenseGroupDTO[]
  ) => void;
  // This function updates both the current group and the matching element in the group list
  handleGroupChange: (
    updater: (prevDocs: ExpenseGroupDTO) => ExpenseGroupDTO
  ) => void;
};

export const ExpenseGroupsContext = createContext<ExpenseGroupsContextType>({
  expenseGroups: [],
  setExpenseGroups: () => {},
  currentGroup: undefined,
  filterId: undefined,
  handleFilterChange: () => {},
  handleGroupChange: () => {},
});

type ProviderProps = {
  children?: React.ReactNode;
};

export const ExpenseGroupsContextProvider = ({ children }: ProviderProps) => {
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroupDTO[]>([]);

  const { filterId, currentGroup, handleFilterChange, handleGroupChange } =
    useCurrentGroupState(expenseGroups, setExpenseGroups);

  const contextValue = {
    expenseGroups,
    setExpenseGroups,
    currentGroup,
    filterId,
    handleFilterChange,
    handleGroupChange,
  };

  return (
    <ExpenseGroupsContext.Provider value={contextValue}>
      {children}
    </ExpenseGroupsContext.Provider>
  );
};

const useCurrentGroupState = (
  expenseGroups: ExpenseGroupDTO[],
  setExpenseGroups: Dispatch<SetStateAction<ExpenseGroupDTO[]>>
) => {
  const [filterId, setFilterId] = useState<ExpenseListType>();
  const [currentGroup, setCurrentGroup] = useState<ExpenseGroupDTO>();

  const handleGroupChange = (
    updater: (prevDoc: ExpenseGroupDTO) => ExpenseGroupDTO
  ) => {
    setCurrentGroup((prevState) => {
      const newGroup = updater(prevState!);
      setExpenseGroups((prevState) => {
        const updatedGroupIndex = prevState.findIndex(
          (group) => group.id === newGroup.id
        );
        return prevState.toSpliced(updatedGroupIndex, 1, newGroup);
      });
      return newGroup;
    });
  };

  const handleFilterChange = (
    newFilterId: ExpenseListType,
    newExpenseGroups?: ExpenseGroupDTO[]
  ) => {
    const groups = newExpenseGroups ? newExpenseGroups : expenseGroups;

    if (newFilterId?.groupId && groups.length > 0) {
      // Match current group with new id
      const filteredGroup = groups.find(
        (group) => group.id === newFilterId?.groupId
      );
      if (!filteredGroup) {
        throw "No group found for selected filter";
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
    handleGroupChange,
  };
};
