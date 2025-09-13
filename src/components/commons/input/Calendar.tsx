"use client";

import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";
import { cn } from "@/utils/utils";
import * as React from "react";
import { PropsWithChildren } from "react";
import { Control, Controller, FormState, useWatch } from "react-hook-form";
import { CreateEarningDTO, CreateExpenseDTO } from "@/types/DTO/dataTypes";
import { FormInputError } from "@/components/commons/input/Form";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { IoCalendarClearSharp } from "react-icons/io5";
import { format } from "date-fns";
import { isValidDate } from "@/utils/validations";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { useTranslate } from "@/utils/hooks/useTranslation";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "brutalist",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof CalendarButton>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();
  const { locale } = useTranslate();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative border-2 border-input has-focus:border-white rounded-md border-black bg-white",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-gray-800/50 rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        selected: cn("", defaultClassNames.selected),
        outside: cn(
          "text-gray-800/50 aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <CalendarButton
      ref={ref}
      variant="brutalist"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        brutalist:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function CalendarButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

const FormCalendarWrapper = ({
  formState,
  currentDate,
  children,
}: PropsWithChildren<{
  formState: FormState<CreateExpenseDTO | CreateEarningDTO>;
  currentDate: Date | undefined;
}>) => {
  const { t, getFnsLocale } = useTranslate();
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
                ? format(currentDate, "do MMM, yyyy", {
                    locale: getFnsLocale(),
                  })
                : t("form.pickDate")}
            </p>
          </span>
        </PopoverButton>
        <PopoverPanel
          transition
          unmount={false}
          anchor="top start"
          className="z-10 rounded-md shadow-[2px_2px_0px_rgba(0,0,0,1)] transition duration-200 ease-in-out [--anchor-gap:--spacing(2)] data-closed:-translate-y-1 data-closed:opacity-0"
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
  const { t } = useTranslate();
  const currentDate = useWatch({ control, name: "newDate" });
  const startMonth = new Date(2020, 0); // January 2020

  return (
    <FormCalendarWrapper formState={formState} currentDate={currentDate}>
      <Controller
        control={control}
        name="newDate"
        rules={{
          required: t("form.dateRequired"),
          validate: (value) => isValidDate(value) || t("form.dateFuture"),
        }}
        render={({ field: { onChange, onBlur } }) => (
          <Calendar
            defaultMonth={currentDate}
            startMonth={startMonth}
            mode="single"
            onDayBlur={onBlur}
            selected={currentDate}
            onSelect={onChange}
            captionLayout={"dropdown-years"}
            className="bg-theme-main rounded-md border-2 border-black"
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
  const { t } = useTranslate();
  const currentDate = useWatch({ control, name: "newDate" });
  const startMonth = new Date(2020, 0); // January 2020

  return (
    <FormCalendarWrapper formState={formState} currentDate={currentDate}>
      <Controller
        control={control}
        name="newDate"
        rules={{
          required: t("form.dateRequired"),
          validate: (value) => isValidDate(value) || t("form.dateFuture"),
        }}
        render={({ field: { onChange, onBlur } }) => (
          <Calendar
            defaultMonth={currentDate}
            startMonth={startMonth}
            mode="single"
            onDayBlur={onBlur}
            selected={currentDate}
            onSelect={onChange}
            captionLayout={"dropdown-years"}
            className="bg-theme-main rounded-md border-2 border-black"
          />
        )}
      />
    </FormCalendarWrapper>
  );
};

export { FormInputExpenseCalendar, FormInputEarningCalendar };
