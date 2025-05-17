import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ComponentProps } from "react";
import { Control, Controller, FormState, useWatch } from "react-hook-form";
import { CreateTransactionDTO } from "@/types/DTO/dataTypes";
import { FormInputError } from "@/components/commons/input/Form";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { IoCalendarClearSharp } from "react-icons/io5";
import { format } from "date-fns";
import { isValidDate } from "@/utils/helpers/parsers";

const Calendar = ({
  className,
  ...props
}: ComponentProps<typeof DayPicker>) => {
  // TODO fix styles to allow showOutsideDays to be false
  return (
    <DayPicker
      showOutsideDays={true}
      className={"bg-theme-main rounded-md border-2 border-black p-4"}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-md font-bold",
        nav: "flex items-center gap-1",
        nav_button:
          "inline-flex items-center justify-center transition-all size-7 opacity-50 hover:opacity-100",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell: "text-gray-600 rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: "rounded-md size-8 p-0 font-semibold hover:text-white",
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-theme-secondary border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]",
        day_today: "border-2 border-black",
        day_outside:
          "day-outside text-gray-600 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <FaChevronLeft className={cn("size-4")} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <FaChevronRight className={cn("size-4")} {...props} />
        ),
      }}
      {...props}
    />
  );
};

const FormInputCalendar = ({
  control,
  formState,
}: {
  control: Control<CreateTransactionDTO>;
  formState: FormState<CreateTransactionDTO>;
}) => {
  const currentDate = useWatch({ control, name: "newDate" });

  return (
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
                defaultMonth={currentDate}
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
  );
};

export { Calendar, FormInputCalendar };
