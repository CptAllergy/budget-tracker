import { LoadingRoundedText } from "@/components/loading/text/LoadingRoundedText";

export const TotalsLoading = () => {
  return (
    <div className="mt-2">
      <LoadingRoundedText theme="dark" className="h-4 w-16" />
      <LoadingRoundedText theme="dark" className="mt-6 h-3 w-60" />
    </div>
  );
};

export const NewTransactionLoading = () => {
  return (
    <div className="mt-2">
      <LoadingRoundedText theme="dark" className="h-4 w-64" />
      <LoadingRoundedText theme="dark" className="mt-6 h-10 w-40" />
      <LoadingRoundedText theme="dark" className="mt-3 h-5 w-20" />
    </div>
  );
};

export const TransactionListLoading = () => {
  return (
    <div className="mt-10">
      <LoadingRoundedText theme="dark" className="h-4 w-36" />
      <LoadingRoundedText theme="dark" className="mt-6 h-3 w-60" />
      <LoadingRoundedText theme="dark" className="mt-6 h-3 w-60" />
      <LoadingRoundedText theme="dark" className="mt-6 h-3 w-60" />
      <LoadingRoundedText theme="dark" className="mt-6 h-3 w-44" />
    </div>
  );
};

export const TransactionListNewPageLoading = () => {
  return (
    <>
      {[...Array(Number(process.env.NEXT_PUBLIC_PAGE_SIZE))].map((_, index) => (
        <LoadingRoundedText key={index} theme="dark" className="h-4 w-full" />
      ))}
    </>
  );
};
