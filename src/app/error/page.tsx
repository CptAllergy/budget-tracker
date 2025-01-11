import { Navbar } from "@/components/elements/navbar/Navbar";

const UnexpectedError = () => {
  return (
    <div className="flex flex-col items-center">
      <Navbar />
      <p className="mx-3 mt-10 text-xl font-bold">Error</p>
      <p className="mx-3 mt-5 w-80">
        An unexpected error occurred, if the error persists please contact the
        administrator.
      </p>
    </div>
  );
};

export default UnexpectedError;
