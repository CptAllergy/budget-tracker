"use client";

import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import { TransactionGroupDTO } from "@/types/DTO/dataTypes";
import { TransactionListType } from "@/types/componentTypes";

export type TransactionGroupsContextType = {
  transactionGroups: TransactionGroupDTO[];
  setTransactionGroups: Dispatch<SetStateAction<TransactionGroupDTO[]>>;
  currentGroup?: TransactionGroupDTO;
  filterId?: TransactionListType;
  handleFilterChange: (
    newFilterId: TransactionListType,
    newTransactionGroups?: TransactionGroupDTO[]
  ) => void;
  // This function updates both the current group and the matching element in the group list
  handleGroupChange: (
    updater: (prevDocs: TransactionGroupDTO) => TransactionGroupDTO
  ) => void;
};

export const TransactionGroupsContext =
  createContext<TransactionGroupsContextType>({
    transactionGroups: [],
    setTransactionGroups: () => {},
    currentGroup: undefined,
    filterId: undefined,
    handleFilterChange: () => {},
    handleGroupChange: () => {},
  });

type ProviderProps = {
  children?: React.ReactNode;
};

export const TransactionGroupsContextProvider = ({
  children,
}: ProviderProps) => {
  const [transactionGroups, setTransactionGroups] = useState<
    TransactionGroupDTO[]
  >([]);

  const { filterId, currentGroup, handleFilterChange, handleGroupChange } =
    useCurrentGroupState(transactionGroups, setTransactionGroups);

  const contextValue = {
    transactionGroups,
    setTransactionGroups,
    currentGroup,
    filterId,
    handleFilterChange,
    handleGroupChange,
  };

  return (
    <TransactionGroupsContext.Provider value={contextValue}>
      {children}
    </TransactionGroupsContext.Provider>
  );
};

const useCurrentGroupState = (
  transactionGroups: TransactionGroupDTO[],
  setTransactionGroups: Dispatch<SetStateAction<TransactionGroupDTO[]>>
) => {
  const [filterId, setFilterId] = useState<TransactionListType>();
  const [currentGroup, setCurrentGroup] = useState<TransactionGroupDTO>();

  const handleGroupChange = (
    updater: (prevDoc: TransactionGroupDTO) => TransactionGroupDTO
  ) => {
    setCurrentGroup((prevState) => {
      const newGroup = updater(prevState!);
      setTransactionGroups((prevState) => {
        const updatedGroupIndex = prevState.findIndex(
          (group) => group.id === newGroup.id
        );
        return prevState.toSpliced(updatedGroupIndex, 1, newGroup);
      });
      return newGroup;
    });
  };

  const handleFilterChange = (
    newFilterId: TransactionListType,
    newTransactionGroups?: TransactionGroupDTO[]
  ) => {
    const groups = newTransactionGroups
      ? newTransactionGroups
      : transactionGroups;

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
