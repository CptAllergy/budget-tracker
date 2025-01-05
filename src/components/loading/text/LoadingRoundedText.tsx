interface Props {
  theme: "light" | "dark";
  className: string;
}

/**
 * LoadingRoundedText component
 * @param theme - light or dark
 * @param className - should include the height and width "h-y w-x" and any other additional classes
 * @constructor
 */
export const LoadingRoundedText = ({ theme, className }: Props) => {
  const color =
    theme === "light" ? "bg-theme-loading-light" : "bg-theme-loading-dark";

  return <div className={`animate-pulse ${color} rounded-full ${className}`} />;
};
