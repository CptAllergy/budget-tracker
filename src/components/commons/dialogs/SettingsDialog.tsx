"use client";

import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useTranslate } from "@/utils/hooks/useTranslation";
import {
  LuCheck,
  LuChevronDown,
  LuCoins,
  LuInfo,
  LuLogOut,
  LuPaintBucket,
  LuPencil,
  LuPlus,
  LuSettings2,
  LuX,
} from "react-icons/lu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/commons/menus/ShadDropdownMenu";
import { Switch } from "@/components/commons/input/Switch";
import { SettingsContext } from "@/contexts/SettingsContext";
import { cn } from "@/utils/utils";
import { useCurrentUser } from "@/utils/hooks/reactQueryUser";
import {
  useAddExpenseGroup,
  useExpenseGroups,
  useLeaveExpenseGroup,
  useUpdateExpenseGroupName,
} from "@/utils/hooks/reactQueryGroups";
import { LeaveGroupDialog } from "@/components/commons/dialogs/LeaveGroupDialog";
import { ExpenseGroupDTO } from "@/types/DTO/dataTypes";

type DialogProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

type SelectedSetting = "general" | "expenseGroups" | "personalization";

const SettingsDialog = ({ isOpen, setIsOpen }: DialogProps) => {
  const { t } = useTranslate();
  const [selectedSetting, setSelectedSetting] =
    useState<SelectedSetting>("general");

  const selectedSettingStyle = (setting: SelectedSetting) => {
    return selectedSetting === setting
      ? "bg-theme-main hover:bg-theme-hover"
      : "bg-theme-highlight hover:bg-theme-highlight-hover";
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="z-30 focus:outline-hidden"
      onClose={() => setIsOpen(false)}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 z-10 bg-black/80 duration-300 data-closed:opacity-0"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="bg-theme-secondary h-[35rem] w-full max-w-2xl rounded-md border-2 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] duration-200 data-closed:opacity-0"
          >
            <div className="flex h-full flex-col gap-4 md:flex-row">
              <div className="space-y-5 border-b border-black pb-4 md:w-1/3 md:border-r md:border-b-0 md:pr-4 md:pb-0">
                <div className="flex items-center justify-between md:justify-start">
                  <div className="text-lg font-semibold md:hidden">
                    {t("navbar.settings")}
                  </div>
                  <button
                    className="rounded-md border-2 border-black bg-white p-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:mr-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <LuX className="size-4 [stroke-width:3]" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div
                    onClick={() => setSelectedSetting("general")}
                    className={`${selectedSettingStyle("general")} group flex cursor-pointer items-center gap-2 rounded-md border-2 border-black p-1 text-sm/7 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all sm:gap-3 sm:p-2 md:text-sm`}
                  >
                    <LuSettings2 className="size-5 flex-shrink-0" />
                    <p className="truncate font-semibold">
                      {t("settings.general")}
                    </p>
                  </div>
                  <div
                    onClick={() => setSelectedSetting("expenseGroups")}
                    className={`${selectedSettingStyle("expenseGroups")} group flex cursor-pointer items-center gap-2 rounded-md border-2 border-black p-1 text-sm/7 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all sm:gap-3 sm:p-2 md:text-sm`}
                  >
                    <LuCoins className="size-5 flex-shrink-0" />
                    <p className="truncate font-semibold">
                      {t("settings.expenseGroups")}
                    </p>
                  </div>
                  <div
                    onClick={() => setSelectedSetting("personalization")}
                    className={`${selectedSettingStyle("personalization")} group flex cursor-pointer items-center gap-2 rounded-md border-2 border-black p-1 text-sm/7 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all sm:gap-3 sm:p-2 md:text-sm`}
                  >
                    <LuPaintBucket className="size-5 flex-shrink-0" />
                    <p className="truncate font-semibold">
                      {t("settings.personalization")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right content */}
              <div className="h-full flex-1 pt-4 md:pt-0 md:pl-1">
                <SelectedSetting selectedSetting={selectedSetting} />
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

const SelectedSetting = ({
  selectedSetting,
}: {
  selectedSetting: SelectedSetting;
}) => {
  switch (selectedSetting) {
    case "general":
      return <GeneralSettings />;
    case "expenseGroups":
      return <ExpenseGroupSettings />;
    case "personalization":
      return <PersonalizationSettings />;
  }
};

const GeneralSettings = () => {
  const { t } = useTranslate();

  return (
    <div>
      <span className="text-lg font-semibold">{t("settings.general")}</span>
      <div className="mt-6 space-y-4 text-sm sm:text-base">
        <LanguageSetting />
        <InvestmentStatusSetting />
      </div>
    </div>
  );
};

const LanguageSetting = () => {
  const { t, locale, setLocale } = useTranslate();
  const languageMap = {
    "en-us": { label: "English" },
    "pt-pt": { label: "Português" },
  };

  if (!locale) return null;

  return (
    <div className="flex flex-row items-center justify-between">
      <span className="font-semibold">{t("settings.language")}</span>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          asChild
          className={`bg-theme-main hover:bg-theme-hover rounded-md border-2 border-black p-1 text-center transition-colors outline-none hover:cursor-pointer md:mr-2`}
        >
          <button className="flex items-center justify-center gap-1 px-2">
            <span className="first-letter:uppercase">
              {languageMap[locale].label}
            </span>
            <LuChevronDown />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={setLocale as (value: string) => void}
          >
            <DropdownMenuRadioItem value="en-us">
              {languageMap["en-us"].label}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="pt-pt">
              {languageMap["pt-pt"].label}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const InvestmentStatusSetting = () => {
  const { t } = useTranslate();
  const { isInvestmentExpense, setBooleanSetting } =
    useContext(SettingsContext);

  return (
    <div className="flex flex-row items-center justify-between">
      <span className="font-semibold">{t("settings.investmentState")}</span>
      <InfoTooltip text={t("settings.investmentStateDescription")}>
        <Switch
          checked={isInvestmentExpense}
          onCheckedChange={(checked) =>
            setBooleanSetting("investment_expense", checked)
          }
          className="md:mr-2"
        />
      </InfoTooltip>
    </div>
  );
};

const ExpenseGroupSettings = () => {
  const { t } = useTranslate();
  const { currentUser } = useCurrentUser();
  const { expenseGroups } = useExpenseGroups(currentUser);

  const { mutateAddExpenseGroup } = useAddExpenseGroup(currentUser);
  const { mutateLeaveExpenseGroup } = useLeaveExpenseGroup(currentUser);
  const { mutateUpdateExpenseGroupName } = useUpdateExpenseGroupName();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<string>();
  const [deleteGroup, setDeleteGroup] = useState<ExpenseGroupDTO>();
  const [inputValue, setInputValue] = useState("");

  return (
    <div>
      <LeaveGroupDialog
        expenseGroup={deleteGroup}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        confirmAction={() => {
          if (deleteGroup) {
            mutateLeaveExpenseGroup(deleteGroup.id);
            setIsDialogOpen(false);
            setDeleteGroup(undefined);
          }
        }}
      />
      <button onClick={() => setIsDialogOpen(true)}>Open</button>
      <div className="flex h-full flex-col">
        <span className="text-lg font-semibold">
          {t("settings.expenseGroups")}
        </span>
        <span className="flex w-full justify-end space-x-2">
          <button
            className="bg-theme-main hover:bg-theme-hover flex items-center rounded-md border-2 border-black py-1 pr-1 pl-1 text-sm font-semibold text-black shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:space-x-1 sm:pr-2"
            onClick={() => {
              mutateAddExpenseGroup();
              setEditGroup(undefined);
            }}
          >
            <LuPlus size="17" className="stroke-[2.5]" />
            <span>{t("navbar.newTransaction")}</span>
          </button>
        </span>

        <div className="mt-3 h-56 space-y-2 overflow-y-auto text-sm sm:h-48 sm:text-base md:h-full">
          {expenseGroups && expenseGroups.length > 0 ? (
            expenseGroups.map((group) => (
              <div
                key={group.id}
                className="bg-theme-highlight group rounded-md border-2 border-black p-1"
              >
                <div className="flex justify-between">
                  {editGroup === group.id ? (
                    <div className="flex items-center gap-2 p-1">
                      <input
                        type="text"
                        value={inputValue}
                        autoFocus
                        onChange={(e) => setInputValue(e.target.value)}
                        className="bg-white"
                      />
                      <button
                        onClick={() => {
                          if (inputValue !== "" && inputValue !== group.name) {
                            mutateUpdateExpenseGroupName({
                              groupId: group.id,
                              groupName: inputValue,
                            });
                          }
                          setEditGroup(undefined);
                        }}
                        className="bg-theme-main hover:bg-theme-hover rounded-sm border-2 border-black p-1"
                      >
                        <LuCheck size={15} />
                      </button>
                    </div>
                  ) : (
                    <span className="p-1 font-semibold">{group.name}</span>
                  )}
                  <div
                    className={`${editGroup !== group.id ? "flex gap-3 group-hover:flex md:hidden md:gap-2" : "hidden"}`}
                  >
                    <span
                      onClick={() => {
                        setIsDialogOpen(true);
                        setDeleteGroup(group);
                        setEditGroup(undefined);
                      }}
                      className="hover:bg-theme-highlight-hover rounded-md p-1 hover:cursor-pointer"
                    >
                      <LuLogOut size={18} />
                    </span>
                    <span
                      onClick={() => {
                        setEditGroup(group.id);
                        setInputValue(group.name);
                      }}
                      className="hover:bg-theme-highlight-hover rounded-md p-1 hover:cursor-pointer"
                    >
                      <LuPencil size={18} />
                    </span>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <span className="block text-sm">
                    {t("settings.groupMembers")}{" "}
                    {group.totals.map((total) => total.name).join(", ")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <span className="text-sm">{t("settings.noExpenseGroups")}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const PersonalizationSettings = () => {
  const { t } = useTranslate();
  return (
    <div>
      <span className="text-lg font-semibold">
        {t("settings.personalization")}
      </span>
      <div className="mt-6 space-y-4 text-sm sm:text-base">
        <TransactionColorSetting />
      </div>
    </div>
  );
};

const TransactionColorSetting = () => {
  const { t } = useTranslate();
  const { isExpenseColorEnabled, isEarningColorEnabled, setBooleanSetting } =
    useContext(SettingsContext);

  return (
    <div className="space-y-5">
      <div className="flex flex-row items-center justify-between">
        <span className="font-semibold">{t("settings.expenseColors")}</span>
        <InfoTooltip text={t("settings.expenseColorsDescription")}>
          <Switch
            checked={isExpenseColorEnabled}
            onCheckedChange={(checked) =>
              setBooleanSetting("expense_color", checked)
            }
            className="md:mr-2"
          />
        </InfoTooltip>
      </div>
      <div className="flex flex-row items-center justify-between">
        <span className="font-semibold">{t("settings.earningColors")}</span>
        <InfoTooltip text={t("settings.earningColorsDescription")}>
          <Switch
            checked={isEarningColorEnabled}
            onCheckedChange={(checked) =>
              setBooleanSetting("earning_color", checked)
            }
            className="md:mr-2"
          />
        </InfoTooltip>
      </div>
    </div>
  );
};

const InfoTooltip = ({
  text,
  children,
}: PropsWithChildren<{ text: string }>) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | PointerEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("pointerdown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="group relative flex items-center">
      {children}

      <span
        className="ml-2 md:hidden"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <LuInfo size={16} />
      </span>

      <div
        className={cn(
          "z-10 inline-block rounded-md border bg-white p-2 text-center text-sm break-words transition-all duration-400",
          "w-[90vw] max-w-sm md:max-w-[10rem] lg:max-w-[20rem]",
          "fixed bottom-4 left-1/2 -translate-x-1/2 md:absolute md:top-full md:bottom-auto md:left-1/2 md:mt-1 md:-translate-x-1/2",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0 md:translate-y-0",
          "group-hover:pointer-events-auto md:group-hover:opacity-100"
        )}
      >
        {text}
      </div>
    </div>
  );
};

export { SettingsDialog, InfoTooltip };
