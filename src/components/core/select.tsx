import { SelectProps } from "react-daisyui";
import { ForwardedRef, forwardRef, SelectHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import cx from "classnames";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  helpText?: string;
  errorMessage?: string;
  color?: SelectProps<any>["color"];
  size?: SelectProps<any>["size"];
  bordered?: boolean;
};
const Select = forwardRef(
  (
    {
      label,
      helpText,
      errorMessage,
      color,
      value,
      children,
      className,
      bordered = true,
      size,
      ...props
    }: Props,
    ref: ForwardedRef<HTMLSelectElement>
  ) => {
    return (
      <div className="form-control">
        <label className="label">
          <span
            className={cx("label-text", {
              "text-error": !!errorMessage,
            })}
          >
            {label}
          </span>
        </label>
        <select
          ref={ref}
          className={twMerge(
            "select",
            size ? `select-${size}` : "",
            color ? `select-${color}` : "",
            bordered ? "select-bordered" : "",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {(!!helpText || !!errorMessage) && (
          <label className="label">
            <span
              className={cx("label-text-alt", {
                "text-error": !!errorMessage,
              })}
            >
              {errorMessage || helpText}
            </span>
          </label>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
