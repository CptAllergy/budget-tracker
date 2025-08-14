import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CreateEarningDTO,
  CreateExpenseDTO,
  NO_EXPENSE_GROUP,
  UserDTO,
} from "@/types/DTO/dataTypes";
import { AlertContext, AlertContextType } from "@/contexts/AlertContext";
import { ExpenseGroupsContext } from "@/contexts/ExpenseGroupsContext";
import {
  Control,
  FormState,
  SubmitHandler,
  useForm,
  UseFormRegister,
} from "react-hook-form";
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
import { ExpenseListType } from "@/types/componentTypes";
import { isValidAmount } from "@/utils/validations";
import { toggleStatusErrorAlert } from "@/utils/toggleAlerts";
import {
  EARNING_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "@/types/transactionFilterTypes";
import { Timestamp } from "firebase/firestore";
import { DialogComponent } from "@/components/commons/dialogs/ActionDialog";

const AddDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  user,
  createExpense,
  createEarning,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  user: UserDTO;
  createExpense: (expense: CreateExpenseDTO) => void;
  createEarning: (earning: CreateEarningDTO) => void;
}) => {
  const [isExpense, setIsExpense] = useState<boolean>(true);

  const alertContext = useRef(useContext(AlertContext));
  const expenseGroupsContext = useContext(ExpenseGroupsContext);
  const filterId = expenseGroupsContext.filterId;

  const groupName = filterId?.groupName ? filterId.groupName : NO_EXPENSE_GROUP;

  const {
    handleSubmit: handleSubmitExpense,
    onSubmit: onSubmitExpense,
    register: registerExpense,
    formState: formStateExpense,
    control: controlExpense,
  } = useExpenseForm(
    isDialogOpen,
    setIsDialogOpen,
    user,
    createExpense,
    alertContext.current,
    filterId
  );

  const {
    handleSubmit: handleSubmitEarning,
    onSubmit: onSubmitEarning,
    register: registerEarning,
    formState: formStateEarning,
    control: controlEarning,
  } = useEarningForm(
    isDialogOpen,
    setIsDialogOpen,
    user,
    createEarning,
    alertContext.current
  );

  useEffect(() => {
    // Reset the isExpense state when the dialog is closed
    if (!isDialogOpen) {
      setTimeout(() => {
        setIsExpense(true);
      }, 400);
    }
  }, [isDialogOpen]);

  return (
    <DialogComponent
      dialogTitle={
        <AddDialogTitle isExpense={isExpense} setIsExpense={setIsExpense} />
      }
      groupName={isExpense ? groupName : undefined}
      confirmText="Create"
      confirmAction={
        isExpense
          ? handleSubmitExpense(onSubmitExpense)
          : handleSubmitEarning(onSubmitEarning)
      }
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
    >
      {isExpense ? (
        <AddExpenseForm
          register={registerExpense}
          formState={formStateExpense}
          control={controlExpense}
        />
      ) : (
        <AddEarningForm
          register={registerEarning}
          formState={formStateEarning}
          control={controlEarning}
        />
      )}
    </DialogComponent>
  );
};

const AddDialogTitle = ({
  isExpense,
  setIsExpense,
}: {
  isExpense: boolean;
  setIsExpense: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <h1>
      <div className="grid grid-cols-2 gap-1 text-base font-semibold">
        <div
          onClick={() => setIsExpense(true)}
          className={`${isExpense ? "bg-theme-main hover:bg-theme-hover border-2 border-black" : "hover:bg-theme-highlight-hover"} rounded-md p-1 text-center transition-colors hover:cursor-pointer`}
        >
          📉 Expense
        </div>
        <div
          onClick={() => setIsExpense(false)}
          className={`${!isExpense ? "bg-theme-main hover:bg-theme-hover border-2 border-black" : "hover:bg-theme-highlight-hover"} rounded-md p-1 text-center transition-colors hover:cursor-pointer`}
        >
          📈 Earning
        </div>
      </div>
      <div className="mt-3 text-base font-semibold">
        Creating {isExpense ? "Expense" : "Earning"}
      </div>
    </h1>
  );
};

const AddExpenseForm = ({
  register,
  formState,
  control,
}: {
  register: UseFormRegister<CreateExpenseDTO>;
  formState: FormState<CreateExpenseDTO>;
  control: Control<CreateExpenseDTO>;
}) => {
  return (
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
      </div>
    </form>
  );
};

const AddEarningForm = ({
  register,
  formState,
  control,
}: {
  register: UseFormRegister<CreateEarningDTO>;
  formState: FormState<CreateEarningDTO>;
  control: Control<CreateEarningDTO>;
}) => {
  return (
    <form className="mt-5 flex flex-col space-y-3">
      <div className="space-y-3">
        <label className="ml-0.5 font-semibold">Description</label>
        <FormInputEarningText register={register} formState={formState} />
        <label className="ml-0.5 font-semibold">Amount</label>
        <FormInputEarningNumber register={register} formState={formState} />
        <label className="ml-0.5 font-semibold">Category</label>
        <FormInputEarningSelect control={control} />
      </div>
    </form>
  );
};

const useExpenseForm = (
  isDialogOpen: boolean,
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>,
  user: UserDTO,
  createExpense: (expense: CreateExpenseDTO) => void,
  alertContext: AlertContextType,
  filterId: ExpenseListType | undefined
) => {
  const { register, handleSubmit, reset, formState, control } =
    useForm<CreateExpenseDTO>({
      defaultValues: {
        tags: [],
        category: "other",
      },
    });

  useEffect(() => {
    // Reset the form on a timeout to allow the dialog transition to finish
    setTimeout(() => {
      reset({
        tags: [],
        category: "other",
      });
    }, 400);
  }, [reset, isDialogOpen]);

  const onSubmit: SubmitHandler<CreateExpenseDTO> = async (newData) => {
    // Replace comma with period
    const amountString = newData.amount.toString().replace(",", ".");

    if (!isValidAmount(amountString)) {
      toggleStatusErrorAlert(alertContext, "ADD_FAILED", "Invalid amount");
      throw "Invalid expense data: Invalid amount";
    }

    if (!EXPENSE_CATEGORIES.includes(newData.category)) {
      toggleStatusErrorAlert(alertContext, "ADD_FAILED", "Invalid category");
      throw "Invalid expense data: Invalid category";
    }

    if (!filterId?.groupId && !filterId?.userId) {
      toggleStatusErrorAlert(alertContext, "ADD_FAILED", "Invalid group");
      throw "Invalid expense data: Invalid group";
    }

    const groupId = filterId.groupId ? filterId.groupId : null;

    const newExpense: CreateExpenseDTO = {
      label: newData.label,
      amount: Number(amountString),
      userId: user.id,
      groupId: groupId,
      username: user.name,
      timestamp: Timestamp.fromDate(new Date()),
      tags: newData.tags,
      category: newData.category,
    };

    createExpense(newExpense);
    setIsDialogOpen(false);
  };

  return { handleSubmit, onSubmit, register, formState, control };
};

const useEarningForm = (
  isDialogOpen: boolean,
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>,
  user: UserDTO,
  createEarning: (earning: CreateEarningDTO) => void,
  alertContext: AlertContextType
) => {
  const { register, handleSubmit, reset, formState, control } =
    useForm<CreateEarningDTO>({
      defaultValues: {
        category: "other",
      },
    });

  useEffect(() => {
    // Reset the form on a timeout to allow the dialog transition to finish
    setTimeout(() => {
      reset({
        category: "other",
      });
    }, 400);
  }, [reset, isDialogOpen]);

  const onSubmit: SubmitHandler<CreateEarningDTO> = async (newData) => {
    // Replace comma with period
    const amountString = newData.amount.toString().replace(",", ".");

    if (!isValidAmount(amountString)) {
      toggleStatusErrorAlert(alertContext, "ADD_FAILED", "Invalid amount");
      throw "Invalid earning data: Invalid amount";
    }

    if (!EARNING_CATEGORIES.includes(newData.category)) {
      toggleStatusErrorAlert(alertContext, "ADD_FAILED", "Invalid category");
      throw "Invalid earning data: Invalid category";
    }

    const newEarning: CreateEarningDTO = {
      label: newData.label,
      amount: Number(amountString),
      userId: user.id,
      timestamp: Timestamp.fromDate(new Date()),
      category: newData.category,
    };

    createEarning(newEarning);
    setIsDialogOpen(false);
  };

  return { handleSubmit, onSubmit, register, formState, control };
};

export { AddDialog };
