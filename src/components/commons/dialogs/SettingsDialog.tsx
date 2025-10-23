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
  LuChevronDown,
  LuInfo,
  LuPaintBucket,
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

type DialogProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

type SelectedSetting = "general" | "personalization";

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
            className="bg-theme-secondary w-full max-w-2xl rounded-md border-2 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] duration-200 data-closed:opacity-0"
          >
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="space-y-5 border-b border-black pb-4 md:w-1/3 md:border-r md:border-b-0 md:pr-4 md:pb-0">
                <div className="flex justify-end md:justify-start">
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
              <div className="flex-1 pt-4 md:pt-0 md:pl-4">
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
