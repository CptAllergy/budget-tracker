import {
  ButtonType,
  getRoundedButtonStyles,
} from "@/utils/styles/buttonStyles";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { LoadingRoundedButton } from "@/components/loading/buttons/LoadingRoundedButton";

interface Props {
  type: ButtonType;
  loading?: boolean;
  href: Url;
  className?: string;
}

export const RoundedButtonLink = ({
  type,
  loading = false,
  href,
  children,
  className,
}: PropsWithChildren<Props>) => {
  return !loading ? (
    <Link
      className={`${getRoundedButtonStyles(type)} ${className}`}
      href={href}
    >
      {children}
    </Link>
  ) : (
    <LoadingRoundedButton size="md" className={className} />
  );
};
