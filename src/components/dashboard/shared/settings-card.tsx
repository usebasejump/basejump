import { ReactNode } from "react";
import cx from "classnames";

type Props = {
  className?: string;
  children: ReactNode;
  title?: string;
  description?: string;
  disabled?: boolean;
};
const SettingsCard = ({
  children,
  title,
  description,
  disabled,
  className,
}: Props) => (
  <div
    className={cx("rounded-xl relative border border-base-outline ", className)}
  >
    {!!title && (
      <div className="p-6">
        <h4 className="h4 font-bold">{title}</h4>
        {!!description && <p className="mt-2">{description}</p>}
      </div>
    )}
    {children}
    {disabled && (
      <div className="absolute top-0 left-0 w-full h-full cursor-not-allowed bg-white opacity-70 rounded" />
    )}
  </div>
);

const SettingsCardFooter = ({ children }) => (
  <div className="flex justify-between flex-row-reverse items-center p-4 border-t border-base-outline bg-base-200 rounded-b-xl">
    {children}
  </div>
);

const SettingsCardBody = ({ children }) => (
  <div className="pl-6 pb-6 pr-6">{children}</div>
);

SettingsCard.Body = SettingsCardBody;
SettingsCard.Footer = SettingsCardFooter;

export default SettingsCard;
