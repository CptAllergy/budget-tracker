import { FormState, UseFormRegister } from "react-hook-form";
import { FormInputError } from "@/components/commons/input/Form";
import { CreateEarningDTO, CreateExpenseDTO } from "@/types/DTO/dataTypes";
import { useTranslate } from "@/utils/hooks/useTranslation";

const FormInputExpenseText = ({
  register,
  formState,
}: {
  register: UseFormRegister<CreateExpenseDTO>;
  formState: FormState<CreateExpenseDTO>;
}) => {
  const { t } = useTranslate();
  return (
    <FormInputError fieldName="label" formState={formState}>
      <input
        className="w-full rounded-md border-2 border-black bg-white py-2 pl-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
        type="text"
        placeholder={t("form.description")}
        {...register("label", {
          required: t("form.descriptionRequired"),
        })}
      />
    </FormInputError>
  );
};

const FormInputExpenseNumber = ({
  register,
  formState,
}: {
  register: UseFormRegister<CreateExpenseDTO>;
  formState: FormState<CreateExpenseDTO>;
}) => {
  const { t } = useTranslate();
  return (
    <FormInputError fieldName="amount" formState={formState}>
      <div className="">
        <input
          className="w-full rounded-md border-2 border-black bg-white py-2 pl-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          type="number"
          step="0.01"
          placeholder={t("form.amount")}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          {...register("amount", {
            required: t("form.amountRequired"),
            min: { value: 0.01, message: t("form.amountMin") },
            max: { value: 5000, message: t("form.amountMax") },
          })}
        />
      </div>
    </FormInputError>
  );
};

const FormInputEarningText = ({
  register,
  formState,
}: {
  register: UseFormRegister<CreateEarningDTO>;
  formState: FormState<CreateEarningDTO>;
}) => {
  const { t } = useTranslate();
  return (
    <FormInputError fieldName="label" formState={formState}>
      <input
        className="w-full rounded-md border-2 border-black bg-white py-2 pl-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
        type="text"
        placeholder={t("form.description")}
        {...register("label", {
          required: t("form.descriptionRequired"),
        })}
      />
    </FormInputError>
  );
};

const FormInputEarningNumber = ({
  register,
  formState,
}: {
  register: UseFormRegister<CreateEarningDTO>;
  formState: FormState<CreateEarningDTO>;
}) => {
  const { t } = useTranslate();
  return (
    <FormInputError fieldName="amount" formState={formState}>
      <div className="">
        <input
          className="w-full rounded-md border-2 border-black bg-white py-2 pl-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          type="number"
          step="0.01"
          placeholder={t("form.amount")}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          {...register("amount", {
            required: t("form.amountRequired"),
            min: { value: 0.01, message: t("form.amountMin") },
            max: { value: 5000, message: t("form.amountMax") },
          })}
        />
      </div>
    </FormInputError>
  );
};

export {
  FormInputExpenseNumber,
  FormInputExpenseText,
  FormInputEarningText,
  FormInputEarningNumber,
};
