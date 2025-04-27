import { PropsWithChildren } from "react";
import { FormInputType } from "@/types/componentTypes";
import { MdErrorOutline } from "react-icons/md";

const FormInputError = ({
  fieldName,
  formState,
  children,
}: PropsWithChildren<FormInputType>) => {
  const { errors } = formState;
  return (
    <div className="flex flex-col">
      <div className="relative w-full">
        {children}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-red-700">
          {errors[fieldName] && <MdErrorOutline size="20" />}
        </div>
      </div>
      {errors[fieldName] && (
        <span className="mt-1 font-semibold text-red-700">
          {errors[fieldName]?.message}
        </span>
      )}
    </div>
  );
};

export { FormInputError };
