import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  CreateTransactionDTO,
  TransactionDTO,
  UserDTO,
} from "@/types/DTO/dataTypes";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { isValidAmount, isValidDate } from "@/utils/validations";
import { SubmitHandler, useForm } from "react-hook-form";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { AlertContext } from "@/contexts/AlertContext";
import {
  FormInputNumber,
  FormInputText,
} from "@/components/commons/input/Text";
import { format } from "date-fns";
import { FormInputCalendar } from "@/components/commons/input/Calendar";
import { Timestamp } from "firebase/firestore";
import { TRANSACTION_CATEGORIES } from "@/types/transactionFilterTypes";
import {
  FormInputMultiSelect,
  FormInputSelect,
} from "@/components/commons/input/Select";
import { TransactionGroupsContext } from "@/contexts/TransactionGroupsContext";

type DialogProps = {
  dialogTitle: string;
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
                <div className="py-2 text-right text-sm font-semibold">
                  {groupName}
                </div>
              )}
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
      dialogTitle="Delete Transaction"
      confirmText="Delete"
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
        tags: transaction?.tags ? transaction.tags : [],
        category: transaction?.category ? transaction.category : "Other",
      },
    });

  useEffect(() => {
    if (transaction) {
      // Reset the form on a timeout to allow the dialog transition to finish
      const timeout = isDialogOpen ? 0 : 400;
      setTimeout(() => {
        reset({
          amount: transaction.amount,
          label: transaction.label,
          newDate: transaction.timestamp.toDate(),
          tags: transaction?.tags ? transaction.tags : [],
          category: transaction?.category ? transaction.category : "Other",
        });
      }, timeout);
    }
  }, [transaction, reset, isDialogOpen]);

  const onSubmit: SubmitHandler<CreateTransactionDTO> = async (updatedData) => {
    if (!transaction || !updatedData.newDate) {
      toggleStatusErrorAlert(alertContext.current, "UPDATE_FAILED");
      throw "Invalid transaction data";
    }

    // Replace comma with period
    const amountString = updatedData.amount.toString().replace(",", ".");

    if (!isValidAmount(amountString)) {
      toggleStatusErrorAlert(alertContext.current, "UPDATE_FAILED");
      throw "Invalid transaction data: Invalid amount";
    }

    if (!isValidDate(updatedData.newDate)) {
      toggleStatusErrorAlert(alertContext.current, "UPDATE_FAILED");
      throw "Invalid transaction data: Invalid date";
    }

    if (!TRANSACTION_CATEGORIES.includes(updatedData.category)) {
      toggleStatusErrorAlert(alertContext.current, "UPDATE_FAILED");
      throw "Invalid transaction data: Invalid category";
    }

    const updatedTransaction: TransactionDTO = {
      label: updatedData.label,
      amount: Number(amountString),
      timestamp: Timestamp.fromDate(updatedData.newDate),
      tags: updatedData.tags,
      category: updatedData.category,
      id: transaction.id,
      userId: transaction.userId,
      username: transaction.username,
      groupId: transaction.groupId,
    };

    updateTransaction(updatedTransaction);
    setIsDialogOpen(false);
  };

  return (
    <DialogComponent
      dialogTitle="Update Transaction"
      confirmText="Update"
      confirmAction={handleSubmit(onSubmit)}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
    >
      {transaction && (
        <form className="mt-5 flex flex-col space-y-3">
          <div className="space-y-3">
            <label className="ml-0.5 font-semibold">Description</label>
            <FormInputText register={register} formState={formState} />
            <label className="ml-0.5 font-semibold">Amount</label>
            <FormInputNumber register={register} formState={formState} />
            <label className="ml-0.5 font-semibold">Category</label>
            <FormInputSelect control={control} />
            <label className="ml-0.5 font-semibold">Tags</label>
            <FormInputMultiSelect control={control} />
            <label className="ml-0.5 font-semibold">Date</label>
            <FormInputCalendar control={control} formState={formState} />
          </div>
        </form>
      )}
    </DialogComponent>
  );
};

const AddDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  user,
  createTransaction,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  user: UserDTO;
  createTransaction: (transaction: CreateTransactionDTO) => void;
}) => {
  const alertContext = useRef(useContext(AlertContext));
  const transactionGroupsContext = useContext(TransactionGroupsContext);
  const filterId = transactionGroupsContext.filterId;

  const groupName = filterId?.groupName ? filterId.groupName : "Personal";

  const { register, handleSubmit, reset, formState, control } =
    useForm<CreateTransactionDTO>({
      defaultValues: {
        tags: [],
        category: "Other",
      },
    });

  useEffect(() => {
    // Reset the form on a timeout to allow the dialog transition to finish
    setTimeout(() => {
      reset({
        tags: [],
        category: "Other",
      });
    }, 400);
  }, [reset, isDialogOpen]);

  const onSubmit: SubmitHandler<CreateTransactionDTO> = async (newData) => {
    // Replace comma with period
    const amountString = newData.amount.toString().replace(",", ".");

    if (!isValidAmount(amountString)) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
      throw "Invalid transaction data: Invalid amount";
    }

    if (!TRANSACTION_CATEGORIES.includes(newData.category)) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
      throw "Invalid transaction data: Invalid category";
    }

    if (!filterId?.groupId && !filterId?.userId) {
      toggleStatusErrorAlert(alertContext.current, "ADD_FAILED");
      throw "Invalid transaction data: Invalid group";
    }

    const groupId = filterId.groupId ? filterId.groupId : null;

    const newTransaction: CreateTransactionDTO = {
      label: newData.label,
      amount: Number(amountString),
      userId: user.id,
      groupId: groupId,
      username: user.name,
      timestamp: Timestamp.fromDate(new Date()),
      tags: newData.tags,
      category: newData.category,
    };

    createTransaction(newTransaction);
    setIsDialogOpen(false);
  };

  return (
    <DialogComponent
      dialogTitle="Create Transaction"
      groupName={groupName}
      confirmText="Create"
      confirmAction={handleSubmit(onSubmit)}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
    >
      <form className="mt-5 flex flex-col space-y-3">
        <div className="space-y-3">
          <label className="ml-0.5 font-semibold">Description</label>
          <FormInputText register={register} formState={formState} />
          <label className="ml-0.5 font-semibold">Amount</label>
          <FormInputNumber register={register} formState={formState} />
          <label className="ml-0.5 font-semibold">Category</label>
          <FormInputSelect control={control} />
          <label className="ml-0.5 font-semibold">Tags</label>
          <FormInputMultiSelect control={control} />
        </div>
      </form>
    </DialogComponent>
  );
};

export { DeleteDialog, EditDialog, AddDialog };
