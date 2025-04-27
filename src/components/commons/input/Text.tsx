import { FormState, UseFormRegister } from "react-hook-form";
import { CreateTransactionDTO } from "@/types/DTO/dataTypes";
import { FormInputError } from "@/components/commons/input/Form";

const FormInputText = ({
  register,
  formState,
}: {
  register: UseFormRegister<CreateTransactionDTO>;
  formState: FormState<CreateTransactionDTO>;
}) => {
  return (
    <FormInputError fieldName="label" formState={formState}>
      <input
        className="w-full rounded-md border-2 border-black bg-white py-2 pl-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
        type="text"
        placeholder="Description"
        {...register("label", { required: "Description is required" })}
      />
    </FormInputError>
  );
};

const FormInputNumber = ({
  register,
  formState,
}: {
  register: UseFormRegister<CreateTransactionDTO>;
  formState: FormState<CreateTransactionDTO>;
}) => {
  return (
    <FormInputError fieldName="amount" formState={formState}>
      <div className="">
        <input
          className="w-full rounded-md border-2 border-black bg-white py-2 pl-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          type="number"
          step="0.01"
          placeholder="Amount"
          onWheel={(e) => (e.target as HTMLElement).blur()}
          {...register("amount", {
            required: "Amount is required",
            min: { value: 0.01, message: "Amount must be positive" },
            max: { value: 5000, message: "Amount can't be higher than 5000" },
          })}
        />
      </div>
    </FormInputError>
  );
};

export { FormInputNumber, FormInputText };
