export type ButtonType = "primary" | "secondary";

function getRoundedButtonStylesByType(type: ButtonType): string {
  switch (type) {
    case "primary":
      return "mx-4 px-4 text-white hover:text-gray-300 border-white";
    case "secondary":
      return "px-3 bg-transparent text-theme-blue hover:bg-transparent hover:border-theme-blue";
  }
}

export function getRoundedButtonStyles(type: ButtonType): string {
  return `${getRoundedButtonStylesByType(type)} py-1 rounded-lg text-lg font-semibold border-2 border-transparent transition-colors`;
}
