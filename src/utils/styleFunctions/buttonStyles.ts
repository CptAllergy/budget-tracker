export type ButtonType = "primary" | "secondary";

function getRoundedButtonStylesByType(type: ButtonType): string {
  switch (type) {
    case "primary":
      return "px-6 bg-theme-orange text-white hover:text-theme-orange hover:bg-transparent hover:border-theme-orange";
    case "secondary":
      return "px-3 bg-transparent text-theme-blue hover:bg-transparent hover:border-theme-blue";
  }
}

export function getRoundedButtonStyles(type: ButtonType): string {
  return `${getRoundedButtonStylesByType(type)} py-1 rounded-full text-lg font-semibold border-2 border-transparent transition-colors`;
}
