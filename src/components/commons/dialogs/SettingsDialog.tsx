"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useTranslate } from "@/utils/hooks/useTranslation";
import {
  LuBlocks,
  LuChevronDown,
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
} from "@/components/ui/dropdown-menu";

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
  const { t, locale, setLocale } = useTranslate();

  const languageMap = {
    "en-us": { label: "English" },
    "pt-pt": { label: "Português" },
  };

  if (!locale) return null;

  return (
    <div>
      <span className="text-lg font-semibold">{t("settings.general")}</span>
      <div className="mt-6">
        <div className="flex flex-row items-center justify-between">
          <span className="font-semibold">{t("settings.language")}</span>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              asChild
              className={`bg-theme-main hover:bg-theme-hover mr-4 rounded-md border-2 border-black p-1 text-center transition-colors outline-none hover:cursor-pointer`}
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
      <div>
        <LuBlocks className="mt-5 size-6 flex-shrink-0" />
      </div>
    </div>
  );
};

export { SettingsDialog };
