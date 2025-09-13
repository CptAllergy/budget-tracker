import { Dispatch, PropsWithChildren, ReactNode, SetStateAction } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useTranslate } from "@/utils/hooks/useTranslation";

type DialogProps = {
  dialogTitle: ReactNode;
  groupName?: string;
  confirmText: string;
  confirmAction: () => void;
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
};

const DialogComponent = ({
  dialogTitle,
  groupName,
  confirmText,
  confirmAction,
  isDialogOpen,
  setIsDialogOpen,
  children,
}: PropsWithChildren<DialogProps>) => {
  const { t } = useTranslate();

  return (
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
              <div>{dialogTitle}</div>
              {groupName && (
                <div className="space-x-1 py-2 text-right text-sm font-semibold">
                  <span>{t("form.group")}</span>
                  <span className="font-semibold underline">{groupName}</span>
                </div>
              )}
            </DialogTitle>
            {children}
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
                {confirmText}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export { DialogComponent };
