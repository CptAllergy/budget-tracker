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
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { isValidAmount, isValidDate } from "@/utils/helpers/parsers";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";
import {
  FormInputNumber,
  FormInputText,
} from "@/components/commons/input/Text";
import { IoCalendarClearSharp } from "react-icons/io5";
import { format } from "date-fns";
import { Calendar } from "@/components/commons/input/Calendar";
import { Timestamp } from "firebase/firestore";
import { FormInputError } from "@/components/commons/input/Form";

// TODO can the Dialog be a single component that will change the state of the content it currently contains?
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
              {dialogTitle}
            </DialogTitle>
            {children}
            <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                className="rounded-md border-2 border-black bg-white px-4 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,1)] transition hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] focus:outline-hidden"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
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
          {format(transaction.timestamp.toDate(), "do MMM, yyyy")}
        </p>
      )}
      <p className="mt-2 text-sm font-medium">
        Are you sure you want to delete this transaction?
      </p>
    </DialogComponent>
  );
};

const EditDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  updateTransaction,
  transaction,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  updateTransaction: (transaction: TransactionDTO) => void;
  transaction: TransactionDTO | undefined;
}) => {
  const alertContext = useRef(useContext(AlertContext));

  const { register, handleSubmit, reset, formState, control } =
    useForm<CreateTransactionDTO>({
      defaultValues: {
        amount: transaction?.amount,
        label: transaction?.label,
        newDate: transaction?.timestamp.toDate(),
      },
    });

  const currentDate = useWatch({ control, name: "newDate" });

  useEffect(() => {
    if (transaction) {
      // Reset the form on a timeout to allow the dialog transition to finish
      const timeout = isDialogOpen ? 0 : 400;
      setTimeout(() => {
        reset({
          amount: transaction.amount,
          label: transaction.label,
          newDate: transaction.timestamp.toDate(),
        });
      }, timeout);
    }
  }, [transaction, reset, isDialogOpen]);

  const onSubmit: SubmitHandler<CreateTransactionDTO> = async (updatedData) => {
    if (!transaction || !updatedData.newDate) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
      return;
    }

    // Replace comma with period
    const amountString = updatedData.amount.toString().replace(",", ".");

    if (!isValidAmount(amountString)) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
      return;
    }

    if (!isValidDate(updatedData.newDate)) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
      return;
    }

    const updatedTransaction: TransactionDTO = {
      label: updatedData.label,
      amount: Number(amountString),
      timestamp: Timestamp.fromDate(updatedData.newDate),
      id: transaction.id,
      userId: transaction.userId,
      username: transaction.username,
    };

    updateTransaction(updatedTransaction);
    setIsDialogOpen(false);
  };

  return (
    <DialogComponent
      dialogTitle={"Update Transaction"}
      confirmText={"Update"}
      confirmAction={handleSubmit(onSubmit)}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
    >
      {transaction && (
        <form className="mt-4 flex flex-col space-y-3">
          <div className="space-y-3">
            <FormInputText register={register} formState={formState} />
            <FormInputNumber register={register} formState={formState} />
          </div>
          <FormInputError fieldName="newDate" formState={formState}>
            <Popover>
              <PopoverButton className="w-full rounded-md border-2 border-black bg-white py-2 pl-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <span className="flex items-center gap-2">
                  <IoCalendarClearSharp
                    size={21}
                    className={`${currentDate ? "text-theme-hover" : "text-blue-300"} transition-colors duration-200`}
                  />
                  <p
                    className={`${currentDate ? "text-black" : "text-gray-400"} transition-colors duration-200`}
                  >
                    {currentDate
                      ? format(currentDate, "do MMM, yyyy")
                      : "Pick a date"}
                  </p>
                </span>
              </PopoverButton>
              <PopoverPanel
                transition
                unmount={false}
                anchor="bottom start"
                className="z-10 rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] transition duration-200 ease-in-out [--anchor-gap:--spacing(2)] data-closed:-translate-y-1 data-closed:opacity-0"
              >
                <Controller
                  control={control}
                  name="newDate"
                  rules={{
                    required: "Date is required",
                    validate: (value) =>
                      isValidDate(value) || "Date cannot be in the future",
                  }}
                  render={({ field: { onChange, onBlur } }) => (
                    <Calendar
                      mode="single"
                      onDayBlur={onBlur}
                      selected={currentDate}
                      onSelect={onChange}
                    />
                  )}
                />
              </PopoverPanel>
            </Popover>
          </FormInputError>
        </form>
      )}
    </DialogComponent>
  );
};

// TODO Add an AddDialog for new transactions

export { DeleteDialog, EditDialog };
