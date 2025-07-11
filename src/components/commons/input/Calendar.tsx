import { DayPicker } from "react-day-picker";
import { cn } from "@/utils/utils";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ComponentProps, PropsWithChildren } from "react";
import { Control, Controller, FormState, useWatch } from "react-hook-form";
import { CreateEarningDTO, CreateExpenseDTO } from "@/types/DTO/dataTypes";
import { FormInputError } from "@/components/commons/input/Form";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { IoCalendarClearSharp } from "react-icons/io5";
import { format } from "date-fns";
import { isValidDate } from "@/utils/validations";

const Calendar = ({
  className,
  showOutsideDays = true,
  ...props
}: ComponentProps<typeof DayPicker>) => {
  // TODO improve this calendar, maybe use a different component, this one is not updated and it gives some issues (shadcn has been updated, check it out)
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-theme-main rounded-md border-2 border-black p-3",
        className
      )}
      classNames={{
        month: "space-y-4",
        months: "flex flex-col sm:flex-row space-y-4 sm:space-y-0 relative",
        month_caption: "flex justify-center pt-1 relative items-center",
        month_grid: "w-full border-collapse space-y-1",
        caption_label: "text-sm font-medium",
        nav: "flex items-center justify-between absolute inset-x-0",
        button_previous: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10"
        ),
        button_next: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10"
        ),
        weeks: "w-full border-collapse space-y-",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day_button:
          "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn("h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ className, ...props }) => {
          if (props.orientation === "left") {
            return <FaChevronLeft className={cn("size-4")} {...props} />;
          }
          return <FaChevronRight className={cn("size-4")} {...props} />;
        },
      }}
      {...props}
    />
  );
};

const FormCalendarWrapper = ({
  formState,
  currentDate,
  children,
}: PropsWithChildren<{
  formState: FormState<CreateExpenseDTO | CreateEarningDTO>;
  currentDate: Date | undefined;
}>) => {
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
          {children}
        </PopoverPanel>
      </Popover>
    </FormInputError>
  );
};

const FormInputExpenseCalendar = ({
  control,
  formState,
}: {
  control: Control<CreateExpenseDTO>;
  formState: FormState<CreateExpenseDTO>;
}) => {
  const currentDate = useWatch({ control, name: "newDate" });

  return (
    <FormCalendarWrapper formState={formState} currentDate={currentDate}>
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
    </FormCalendarWrapper>
  );
};

const FormInputEarningCalendar = ({
  control,
  formState,
}: {
  control: Control<CreateEarningDTO>;
  formState: FormState<CreateEarningDTO>;
}) => {
  const currentDate = useWatch({ control, name: "newDate" });

  return (
    <FormCalendarWrapper formState={formState} currentDate={currentDate}>
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
    </FormCalendarWrapper>
  );
};

export { FormInputExpenseCalendar, FormInputEarningCalendar };
