import { LuCheck, LuX } from "react-icons/lu";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDownIcon } from "lucide-react";
import { clsx } from "clsx";
import {
  EARNING_CATEGORIES,
  EXPENSE_CATEGORIES,
  EXPENSE_TAGS,
} from "@/types/transactionFilterTypes";
import { Control, Controller } from "react-hook-form";
import { CreateEarningDTO, CreateExpenseDTO } from "@/types/DTO/dataTypes";
import { SelectOptionType } from "@/types/componentTypes";
import { translate } from "@/services/translationService";

// TODO Instead of hiding the overflowing chip, don't render the final element and show how many more there are, or some other solution
const MultiSelectChip = ({
  option,
  removeChip,
}: {
  option: SelectOptionType;
  removeChip: (label: string) => void;
}) => {
  return (
    <div className="bg-theme-main flex cursor-default items-center space-x-2 rounded-sm p-1 text-sm font-semibold">
      <span className="">{translate(option.label)}</span>
      <div
        onMouseDown={(e) => e.stopPropagation()} // Prevents closing the Listbox
        onClick={() => removeChip(option.value)}
        className="mt-0.5 cursor-pointer transition-colors hover:text-blue-200"
      >
        <LuX size="15" className="[stroke-width:3]" />
      </div>
    </div>
  );
};

// TODO display icon for the categories, maybe the tags as well
const SelectOptions = ({ options }: { options: SelectOptionType[] }) => {
  return (
    <ListboxOptions
      className={clsx(
        "bg-theme-main z-10 w-(--button-width) rounded-md border-2 border-black p-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] [--anchor-gap:--spacing(1)]",
        "scrollbar-transparent overflow-hidden transition duration-100 ease-in focus:outline-none data-leave:data-closed:opacity-0"
      )}
      transition
      anchor="bottom start"
    >
      <div className="max-h-52 overflow-y-auto sm:max-h-[16rem] md:max-h-[20rem]">
        {options.map((option) => (
          <ListboxOption
            key={option.value}
            value={option.value}
            className="group m-0.5 flex cursor-default items-center gap-2 rounded-sm px-3 py-1.5 select-none data-focus:bg-white/15"
          >
            <LuCheck className="text-theme-secondary size-4 [stroke-width:3] opacity-0 transition-all group-data-selected:opacity-100" />
            <div className="text-sm/6 font-semibold text-black group-data-focus:text-white">
              {translate(option.label)}
            </div>
          </ListboxOption>
        ))}
      </div>
    </ListboxOptions>
  );
};

const MultiSelect = ({
  selectedTags,
  onChange,
}: {
  selectedTags: string[];
  onChange: (value: string[]) => void;
}) => {
  const removeChip = (tag: string) => {
    const updated = selectedTags.filter((chip) => chip !== tag);
    onChange(updated);
  };

  const values = [...EXPENSE_TAGS];
  const options: SelectOptionType[] = values.map((tag) => {
    return { label: `expenses.tags.${tag}`, value: tag };
  });

  const selectedOptions = options.filter((opt) =>
    selectedTags.includes(opt.value)
  );

  return (
    <Listbox value={selectedTags} onChange={onChange} multiple>
      <ListboxButton
        className={`${selectedTags.length > 0 ? "py-1.5" : "py-2"} relative z-10 block w-full rounded-md border-2 border-black bg-white pl-3 text-left shadow-[2px_2px_0px_rgba(0,0,0,1)]`}
      >
        <div className="mr-8 flex flex-nowrap gap-1.5 overflow-hidden">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <div key={option.value} className="flex-shrink-0">
                <MultiSelectChip option={option} removeChip={removeChip} />
              </div>
            ))
          ) : (
            <span className="flex-shrink-0 text-gray-400">Pick Tags</span>
          )}
        </div>
        <ChevronDownIcon
          className="group pointer-events-none absolute top-2.5 right-2.5 size-4"
          aria-hidden="true"
        />
      </ListboxButton>
      <SelectOptions options={options} />
    </Listbox>
  );
};

const Select = ({
  selectedCategory,
  onChange,
  options,
}: {
  selectedCategory: string;
  onChange: (value: string) => void;
  options: SelectOptionType[];
}) => {
  const label = options.find((opt) => opt.value === selectedCategory)?.label;

  return (
    <Listbox value={selectedCategory} onChange={onChange}>
      <ListboxButton
        className={`relative z-10 block w-full rounded-md border-2 border-black bg-white py-2 pl-3 text-left shadow-[2px_2px_0px_rgba(0,0,0,1)]`}
      >
        <div className="mr-8 flex flex-nowrap gap-1.5 overflow-hidden">
          <span className="flex-shrink-0">{translate(label)}</span>
        </div>
        <ChevronDownIcon className="group pointer-events-none absolute top-2.5 right-2.5 size-4" />
      </ListboxButton>
      <SelectOptions options={options} />
    </Listbox>
  );
};

const FormInputMultiSelect = ({
  control,
}: {
  control: Control<CreateExpenseDTO>;
}) => {
  return (
    <Controller
      control={control}
      name="tags"
      render={({ field: { value, onChange } }) => (
        <MultiSelect selectedTags={value} onChange={onChange} />
      )}
    />
  );
};

const FormInputExpenseSelect = ({
  control,
}: {
  control: Control<CreateExpenseDTO>;
}) => {
  const values = [...EXPENSE_CATEGORIES];
  const options: SelectOptionType[] = values.map((cat) => {
    return { label: `expenses.categories.${cat}`, value: cat };
  });

  return (
    <Controller
      control={control}
      name="category"
      render={({ field: { value, onChange } }) => (
        <Select
          selectedCategory={value}
          onChange={onChange}
          options={options}
        />
      )}
    />
  );
};

const FormInputEarningSelect = ({
  control,
}: {
  control: Control<CreateEarningDTO>;
}) => {
  const values = [...EARNING_CATEGORIES];
  const options: SelectOptionType[] = values.map((cat) => {
    return { label: `earnings.categories.${cat}`, value: cat };
  });

  return (
    <Controller
      control={control}
      name="category"
      render={({ field: { value, onChange } }) => (
        <Select
          selectedCategory={value}
          onChange={onChange}
          options={options}
        />
      )}
    />
  );
};

export {
  FormInputExpenseSelect,
  FormInputEarningSelect,
  FormInputMultiSelect,
  Select,
};
