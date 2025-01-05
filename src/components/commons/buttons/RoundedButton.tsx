import {
  ButtonType,
  getRoundedButtonStyles,
} from "@/utils/styleFunctions/buttonStyles";
import { PropsWithChildren } from "react";
import { LoadingRoundedButton } from "@/components/loading/buttons/LoadingRoundedButton";

interface Props {
  type: ButtonType;
  loading?: boolean;
  onClick: () => void;
  className?: string;
}

export const RoundedButton = ({
  type,
  loading = false,
  onClick,
  children,
  className,
}: PropsWithChildren<Props>) => {
  return !loading ? (
    <button
      className={`${getRoundedButtonStyles(type)} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  ) : (
    <LoadingRoundedButton size="md" className={className} />
  );
};
