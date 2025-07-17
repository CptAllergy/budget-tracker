import { LoadingRoundedText } from "@/components/loading/text/LoadingRoundedText";

export const TransactionListLoading = () => {
  return (
    <div className="mt-2 flex w-full flex-col items-center">
      <LoadingRoundedText theme="dark" className="h-[35rem] w-full max-w-6xl" />
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
