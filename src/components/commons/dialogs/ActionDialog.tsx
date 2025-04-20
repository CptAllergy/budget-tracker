import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
} from "react";
import { CreateTransactionDTO, TransactionDTO } from "@/types/DTO/dataTypes";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { isValidAmount, timestampToDate } from "@/utils/helpers/parsers";
import { SubmitHandler, useForm } from "react-hook-form";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";
import { Timestamp } from "firebase/firestore";

type DialogProps = {
  dialogTitle: string;
  confirmText: string;
  confirmAction: () => void;
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
};

const DialogComponent = ({
  dialogTitle,
  confirmText,
  confirmAction,
  isDialogOpen,
  setIsDialogOpen,
  children,
}: PropsWithChildren<DialogProps>) => {
  return (
    <Dialog
      open={isDialogOpen}
      as="div"
      className="z-30 focus:outline-none"
      onClose={() => setIsDialogOpen(false)}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 z-10 bg-black/80 duration-300 data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-md border-2 border-black bg-theme-secondary p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] duration-200 data-[closed]:opacity-0"
          >
            <DialogTitle as="h3" className="text-lg font-bold">
              {dialogTitle}
            </DialogTitle>
            {children}
            <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                className="rounded-md border-2 border-black bg-white px-4 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,1)] transition hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] focus:outline-none"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-md border-2 border-black bg-theme-main px-4 py-2 text-sm font-semibold text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition hover:bg-theme-hover hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] focus:outline-none"
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

const DeleteDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  removeTransaction,
  transaction,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  removeTransaction: (transaction: TransactionDTO) => void;
  transaction: TransactionDTO | undefined;
}) => {
  const deleteTransaction = () => {
    if (transaction) {
      removeTransaction(transaction);
      setIsDialogOpen(false);
    }
  };

  return (
    <DialogComponent
      dialogTitle={"Delete Transaction"}
      confirmText={"Delete"}
      confirmAction={deleteTransaction}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
    >
      {transaction && (
        <p className="mt-4 text-sm font-medium">
          {transaction.label} | {Number(transaction.amount).toFixed(2)}€ |{" "}
          {timestampToDate(transaction.timestamp)}
        </p>
      )}
      <p className="mt-2 text-sm font-medium">
        Are you sure you want to delete this transaction?
      </p>
    </DialogComponent>
  );
};

// TODO finish edit dialog component
const EditDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  updateTransaction,
  transaction,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  updateTransaction: (transaction: TransactionDTO) => void;
  transaction: TransactionDTO;
}) => {
  const alertContext = useRef(useContext(AlertContext));

  const { register, handleSubmit } = useForm<TransactionDTO>();

  // TODO check if transaction is undefined or not
  const onSubmit: SubmitHandler<CreateTransactionDTO> = async (updatedData) => {
    // Replace comma with period
    const amountString = updatedData.amount.toString().replace(",", ".");

    if (!isValidAmount(amountString)) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
      return;
    }

    const updatedTransaction: TransactionDTO = {
      id: transaction?.id,
      label: updatedData.label,
      amount: Number(amountString),
      // TODO set this time
      timestamp: updatedData.timestamp,
      userId: transaction?.userId,
      username: transaction?.username,
    };

    updateTransaction(updatedTransaction);
    setIsDialogOpen(false);
  };

  return (
    <DialogComponent
      dialogTitle={"Delete Transaction"}
      confirmText={"Delete"}
      confirmAction={handleSubmit(onSubmit)}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
    >
      {transaction && (
        <p className="mt-4 text-sm font-medium">
          {transaction.label} | {Number(transaction.amount).toFixed(2)}€ |{" "}
          {timestampToDate(transaction.timestamp)}
        </p>
      )}
      <input
        type="text"
        placeholder="Description"
        {...register("label", { required: "Description is required" })}
      />
    </DialogComponent>
  );
};

export { DeleteDialog };
