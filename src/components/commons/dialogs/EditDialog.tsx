import { Dispatch, SetStateAction, useContext, useEffect, useRef } from "react";
import {
  CreateEarningDTO,
  CreateExpenseDTO,
  EarningDTO,
  ExpenseDTO,
} from "@/types/DTO/dataTypes";
import { AlertContext, AlertContextType } from "@/contexts/AlertContext";
import { SubmitHandler, useForm } from "react-hook-form";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import { isValidAmount, isValidDate } from "@/utils/validations";
import {
  EARNING_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "@/types/transactionFilterTypes";
import { Timestamp } from "firebase/firestore";
import {
  FormInputEarningNumber,
  FormInputEarningText,
  FormInputExpenseNumber,
  FormInputExpenseText,
} from "@/components/commons/input/Text";
import {
  FormInputEarningSelect,
  FormInputExpenseSelect,
  FormInputMultiSelect,
} from "@/components/commons/input/Select";
import {
  FormInputEarningCalendar,
  FormInputExpenseCalendar,
} from "@/components/commons/input/Calendar";
import { DialogComponent } from "@/components/commons/dialogs/ActionDialog";

type EditDialogProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  updateExpenseData?: {
    updateExpense: (expense: ExpenseDTO) => void;
    expense: ExpenseDTO | undefined;
  };
  updateEarningData?: {
    updateEarning: (earning: EarningDTO) => void;
    earning: EarningDTO | undefined;
  };
};

const EditDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  updateExpenseData,
  updateEarningData,
}: EditDialogProps) => {
  // Validate component usage
  if (
    (updateExpenseData && updateEarningData) ||
    (!updateExpenseData && !updateEarningData)
  ) {
    throw new Error(
      "Only one of updateExpenseData or updateEarningData should be provided"
    );
  }

  const alertContext = useRef(useContext(AlertContext));

  return (
    <>
      {updateExpenseData && (
        <EditExpenseForm
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          updateExpenseData={updateExpenseData}
          alertContext={alertContext.current}
        />
      )}
      {updateEarningData && (
        <EditEarningForm
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          updateEarningData={updateEarningData}
          alertContext={alertContext.current}
        />
      )}
    </>
  );
};

const EditExpenseForm = ({
  isDialogOpen,
  setIsDialogOpen,
  updateExpenseData,
  alertContext,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  updateExpenseData: {
    updateExpense: (expense: ExpenseDTO) => void;
    expense: ExpenseDTO | undefined;
  };
  alertContext: AlertContextType;
}) => {
  const { handleSubmit, onSubmit, register, formState, control } =
    useExpenseForm(
      isDialogOpen,
      setIsDialogOpen,
      updateExpenseData.updateExpense,
      updateExpenseData?.expense,
      alertContext
    );

  return (
    <DialogComponent
      dialogTitle="Update Expense"
      confirmText="Update"
      confirmAction={handleSubmit(onSubmit)}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
    >
      <form className="mt-5 flex flex-col space-y-3">
        <div className="space-y-3">
          <label className="ml-0.5 font-semibold">Description</label>
          <FormInputExpenseText register={register} formState={formState} />
          <label className="ml-0.5 font-semibold">Amount</label>
          <FormInputExpenseNumber register={register} formState={formState} />
          <label className="ml-0.5 font-semibold">Category</label>
          <FormInputExpenseSelect control={control} />
          <label className="ml-0.5 font-semibold">Tags</label>
          <FormInputMultiSelect control={control} />
          <label className="ml-0.5 font-semibold">Date</label>
          <FormInputExpenseCalendar control={control} formState={formState} />
        </div>
      </form>
    </DialogComponent>
  );
};

const EditEarningForm = ({
  isDialogOpen,
  setIsDialogOpen,
  updateEarningData,
  alertContext,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  updateEarningData: {
    updateEarning: (earning: EarningDTO) => void;
    earning: EarningDTO | undefined;
  };
  alertContext: AlertContextType;
}) => {
  const { handleSubmit, onSubmit, register, formState, control } =
    useEarningForm(
      isDialogOpen,
      setIsDialogOpen,
      updateEarningData?.updateEarning,
      updateEarningData?.earning,
      alertContext
    );
  return (
    <DialogComponent
      dialogTitle="Update Earning"
      confirmText="Update"
      confirmAction={handleSubmit(onSubmit)}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
    >
      <form className="mt-5 flex flex-col space-y-3">
        <div className="space-y-3">
          <label className="ml-0.5 font-semibold">Description</label>
          <FormInputEarningText register={register} formState={formState} />
          <label className="ml-0.5 font-semibold">Amount</label>
          <FormInputEarningNumber register={register} formState={formState} />
          <label className="ml-0.5 font-semibold">Category</label>
          <FormInputEarningSelect control={control} />
          <label className="ml-0.5 font-semibold">Date</label>
          <FormInputEarningCalendar control={control} formState={formState} />
        </div>
      </form>
    </DialogComponent>
  );
};

const useExpenseForm = (
  isDialogOpen: boolean,
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>,
  updateExpense: ((expense: ExpenseDTO) => void) | undefined,
  expense: ExpenseDTO | undefined,
  alertContext: AlertContextType
) => {
  if (!updateExpense) {
    throw new Error("updateExpense function is required for expense update");
  }

  const { register, handleSubmit, reset, formState, control } =
    useForm<CreateExpenseDTO>({
      defaultValues: {
        amount: expense?.amount,
        label: expense?.label,
        newDate: expense?.timestamp.toDate(),
        tags: expense?.tags ? expense.tags : [],
        category: expense?.category ? expense.category : "Other",
      },
    });

  useEffect(() => {
    if (expense) {
      // Reset the form on a timeout to allow the dialog transition to finish
      const timeout = isDialogOpen ? 0 : 400;
      setTimeout(() => {
        reset({
          amount: expense.amount,
          label: expense.label,
          newDate: expense.timestamp.toDate(),
          tags: expense?.tags ? expense.tags : [],
          category: expense?.category ? expense.category : "Other",
        });
      }, timeout);
    }
  }, [expense, reset, isDialogOpen]);

  const onSubmit: SubmitHandler<CreateExpenseDTO> = async (updatedData) => {
    if (!expense || !updatedData.newDate) {
      toggleStatusErrorAlert(
        alertContext,
        "UPDATE_FAILED",
        "Invalid expense data"
      );
      throw "Invalid expense data";
    }

    // Replace comma with period
    const amountString = updatedData.amount.toString().replace(",", ".");

    if (!isValidAmount(amountString)) {
      toggleStatusErrorAlert(alertContext, "UPDATE_FAILED", "Invalid amount");
      throw "Invalid expense data: Invalid amount";
    }

    if (!isValidDate(updatedData.newDate)) {
      toggleStatusErrorAlert(alertContext, "UPDATE_FAILED", "Invalid date");
      throw "Invalid expense data: Invalid date";
    }

    if (!EXPENSE_CATEGORIES.includes(updatedData.category)) {
      toggleStatusErrorAlert(alertContext, "UPDATE_FAILED", "Invalid category");
      throw "Invalid expense data: Invalid category";
    }

    const updatedExpense: ExpenseDTO = {
      label: updatedData.label,
      amount: Number(amountString),
      timestamp: Timestamp.fromDate(updatedData.newDate),
      tags: updatedData.tags,
      category: updatedData.category,
      id: expense.id,
      userId: expense.userId,
      username: expense.username,
      groupId: expense.groupId,
    };

    updateExpense(updatedExpense);
    setIsDialogOpen(false);
  };

  return { handleSubmit, onSubmit, register, formState, control };
};

const useEarningForm = (
  isDialogOpen: boolean,
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>,
  updateEarning: ((earning: EarningDTO) => void) | undefined,
  earning: EarningDTO | undefined,
  alertContext: AlertContextType
) => {
  if (!updateEarning) {
    throw new Error("updateEarning function is required for earning update");
  }

  const { register, handleSubmit, reset, formState, control } =
    useForm<CreateEarningDTO>({
      defaultValues: {
        amount: earning?.amount,
        label: earning?.label,
        newDate: earning?.timestamp.toDate(),
        category: earning?.category ? earning.category : "Other",
      },
    });

  useEffect(() => {
    if (earning) {
      // Reset the form on a timeout to allow the dialog transition to finish
      const timeout = isDialogOpen ? 0 : 400;
      setTimeout(() => {
        reset({
          amount: earning.amount,
          label: earning.label,
          newDate: earning.timestamp.toDate(),
          category: earning?.category ? earning.category : "Other",
        });
      }, timeout);
    }
  }, [earning, reset, isDialogOpen]);

  const onSubmit: SubmitHandler<CreateEarningDTO> = async (updatedData) => {
    if (!earning || !updatedData.newDate) {
      toggleStatusErrorAlert(
        alertContext,
        "UPDATE_FAILED",
        "Invalid earning data"
      );
      throw "Invalid earning data";
    }

    // Replace comma with period
    const amountString = updatedData.amount.toString().replace(",", ".");

    if (!isValidAmount(amountString)) {
      toggleStatusErrorAlert(alertContext, "UPDATE_FAILED", "Invalid amount");
      throw "Invalid earning data: Invalid amount";
    }

    if (!isValidDate(updatedData.newDate)) {
      toggleStatusErrorAlert(alertContext, "UPDATE_FAILED", "Invalid date");
      throw "Invalid earning data: Invalid date";
    }

    if (!EARNING_CATEGORIES.includes(updatedData.category)) {
      toggleStatusErrorAlert(alertContext, "UPDATE_FAILED", "Invalid category");
      throw "Invalid earning data: Invalid category";
    }

    const updatedEarning: EarningDTO = {
      label: updatedData.label,
      amount: Number(amountString),
      timestamp: Timestamp.fromDate(updatedData.newDate),
      category: updatedData.category,
      id: earning.id,
      userId: earning.userId,
    };

    updateEarning(updatedEarning);
    setIsDialogOpen(false);
  };

  return { handleSubmit, onSubmit, register, formState, control };
};

export { EditDialog };
