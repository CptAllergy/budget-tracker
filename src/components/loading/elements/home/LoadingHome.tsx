import { LoadingRoundedText } from "@/components/loading/text/LoadingRoundedText";

export const TotalsLoading = () => {
  return (
    <div className="mt-20 flex w-full justify-center">
      <LoadingRoundedText theme="dark" className="h-12 w-full max-w-4xl" />
    </div>
  );
};

export const NewTransactionLoading = () => {
  return (
    <div className="mx-1 mt-5 flex w-full flex-col items-center md:mt-10">
      <LoadingRoundedText theme="dark" className="h-44 w-full max-w-4xl" />
    </div>
  );
};

export const TransactionListLoading = () => {
  return (
    <div className="my-5 flex w-full flex-col items-center md:my-10">
      <LoadingRoundedText theme="dark" className="h-[35rem] w-full max-w-6xl" />
    </div>
  );
};
