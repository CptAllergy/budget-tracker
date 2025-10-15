"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";

export type SettingToggleOptionType =
  | "investment_expense"
  | "expense_color"
  | "earning_color";

export type SettingsContextType = {
  isInvestmentExpense: boolean;
  isExpenseColorEnabled: boolean;
  isEarningColorEnabled: boolean;
  setBooleanSetting: (
    settingOption: SettingToggleOptionType,
    value: boolean
  ) => void;
};

export const SettingsContext = createContext<SettingsContextType>({
  isInvestmentExpense: false,
  isExpenseColorEnabled: false,
  isEarningColorEnabled: true,
  setBooleanSetting: () => {},
});

type ProviderProps = {
  children?: React.ReactNode;
};

export const SettingsContextProvider = ({ children }: ProviderProps) => {
  const [isInvestmentExpense, setIsInvestmentExpense] =
    useState<boolean>(false);
  const [isExpenseColorEnabled, setIsExpenseColorEnabled] =
    useState<boolean>(false);
  const [isEarningColorEnabled, setIsEarningColorEnabled] =
    useState<boolean>(true);

  // Initialize settings from localStorage
  useEffect(() => {
    const storedIsInvestmentExpense =
      localStorage.getItem("investment_expense") === "true";
    const storedIsExpenseColorEnabled =
      localStorage.getItem("expense_color") === "true";
    const storedIsEarningColorEnabled =
      localStorage.getItem("earning_color") === "true";

    setIsInvestmentExpense(storedIsInvestmentExpense);
    setIsExpenseColorEnabled(storedIsExpenseColorEnabled);
    setIsEarningColorEnabled(storedIsEarningColorEnabled);
  }, []);

  const setBooleanSetting = useCallback(
    (settingOption: SettingToggleOptionType, value: boolean) => {
      switch (settingOption) {
        case "investment_expense":
          setIsInvestmentExpense(value);
          break;
        case "expense_color":
          setIsExpenseColorEnabled(value);
          break;
        case "earning_color":
          setIsEarningColorEnabled(value);
          break;
        default:
          return;
      }

      localStorage.setItem(settingOption, String(value));
    },
    []
  );

  const contextValue = {
    isInvestmentExpense,
    isExpenseColorEnabled,
    isEarningColorEnabled,
    setBooleanSetting,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};
