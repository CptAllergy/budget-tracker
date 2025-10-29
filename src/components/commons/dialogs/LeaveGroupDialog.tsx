import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useTranslate } from "@/utils/hooks/useTranslation";
import { ExpenseGroupDTO } from "@/types/DTO/dataTypes";

type LeaveDialogProps = {
  expenseGroup?: ExpenseGroupDTO;
  confirmAction?: () => void;
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
};

const LeaveGroupDialog = ({
  expenseGroup,
  confirmAction,
  isDialogOpen,
  setIsDialogOpen,
}: LeaveDialogProps) => {
  const { t } = useTranslate();

  return (
    expenseGroup && (
      <Dialog
        open={isDialogOpen}
        as="div"
        className="z-30 focus:outline-hidden"
        onClose={() => setIsDialogOpen(false)}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 z-10 bg-black/80 duration-300 data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="bg-theme-secondary w-full max-w-md rounded-md border-2 border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] duration-200 data-closed:opacity-0"
            >
              <DialogTitle as="h3" className="text-lg font-bold">
                <div>{t("settings.leaveCheckTitle")}</div>
              </DialogTitle>
              <div className="mt-4 text-sm">
                <p>
                  {t("settings.groupName")} {expenseGroup.name}
                </p>
                <p>
                  {t("settings.groupMembers")}{" "}
                  {expenseGroup.totals.map((total) => total.name).join(", ")}
                </p>
                <p className="mt-2">{t("settings.leaveCheckMessage")}</p>
              </div>
              <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <button
                  className="rounded-md border-2 border-black bg-white px-4 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,1)] transition hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] focus:outline-hidden"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("form.cancel")}
                </button>
                <button
                  className="bg-theme-main hover:bg-theme-hover rounded-md border-2 border-black px-4 py-2 text-sm font-semibold text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] focus:outline-hidden"
                  onClick={confirmAction}
                >
                  {t("actions.leave")}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    )
  );
};

export { LeaveGroupDialog };
