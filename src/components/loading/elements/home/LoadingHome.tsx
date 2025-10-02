import { LoadingRoundedText } from "@/components/loading/text/LoadingRoundedText";

export const TransactionListLoading = () => {
  return (
    <div className="mx-3 mt-2 flex items-center justify-center">
      <LoadingRoundedText
        theme="dark"
        className="h-[35rem] w-full max-w-[70.5rem]"
      />
    </div>
  );
};

export const TotalsLoading = () => {
  return (
    <div className="flex w-full justify-center">
      <LoadingRoundedText theme="dark" className="h-12 w-full max-w-4xl" />
    </div>
  );
};

export const SummaryLoading = () => {
  return (
    <div className="flex w-full justify-center">
      <LoadingRoundedText theme="dark" className="h-28 w-full max-w-4xl" />
    </div>
  );
};
