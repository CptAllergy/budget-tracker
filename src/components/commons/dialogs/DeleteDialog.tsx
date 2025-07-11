import { format } from "date-fns";
import { Dispatch, SetStateAction } from "react";
import { EarningDTO, ExpenseDTO } from "@/types/DTO/dataTypes";
import { DialogComponent } from "@/components/commons/dialogs/ActionDialog";

type DeleteDialogProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  removeExpenseData?: {
    removeExpense: (expense: ExpenseDTO) => void;
    expense: ExpenseDTO | undefined;
  };
  removeEarningData?: {
    removeEarning: (earning: EarningDTO) => void;
    earning: EarningDTO | undefined;
  };
};

const DeleteDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  removeExpenseData,
  removeEarningData,
}: DeleteDialogProps) => {
  // Validate usage
  if (
    (removeExpenseData && removeEarningData) ||
    (!removeExpenseData && !removeEarningData)
  ) {
    throw new Error(
      "Only one of removeExpenseData or removeEarningData should be provided"
    );
  }

  const transactionType = removeExpenseData ? "expense" : "earning";

  const deleteTransaction = () => {
    switch (transactionType) {
      case "expense":
        const { expense, removeExpense } = removeExpenseData!;
        if (expense) {
          removeExpense(expense);
        }
        break;
      case "earning":
        const { earning, removeEarning } = removeEarningData!;
        if (earning) {
          removeEarning(earning);
        }
        break;
    }
    setIsDialogOpen(false);
  };

  return (
    <DialogComponent
      dialogTitle={`Delete ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`}
      confirmText="Delete"
      confirmAction={deleteTransaction}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
    >
      {removeExpenseData?.expense && (
        <p className="mt-4 text-sm font-medium">
          {removeExpenseData.expense.label} |{" "}
          {Number(removeExpenseData.expense.amount).toFixed(2)}€ |{" "}
          {format(removeExpenseData.expense.timestamp.toDate(), "do MMM, yyyy")}
        </p>
      )}
      {removeEarningData?.earning && (
        <p className="mt-4 text-sm font-medium">
          {removeEarningData.earning.label} |{" "}
          {Number(removeEarningData.earning.amount).toFixed(2)}€ |{" "}
          {format(removeEarningData.earning.timestamp.toDate(), "do MMM, yyyy")}
        </p>
      )}
      <p className="mt-2 text-sm font-medium">
        Are you sure you want to delete this {transactionType}?
      </p>
    </DialogComponent>
  );
};
export { DeleteDialog };
