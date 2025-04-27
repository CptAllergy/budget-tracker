interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const LoadingRoundedButton = ({ size = "md", className }: Props) => {
  const getWidth = () => {
    switch (size) {
      case "sm":
        return "px-5";
      case "md":
        return "px-12";
      case "lg":
        return "px-32";
      case "xl":
        return "px-64";
    }
  };

  return (
    <div
      className={`bg-theme-loading-dark animate-pulse py-5 ${getWidth()} rounded-full ${className}`}
    ></div>
  );
};
