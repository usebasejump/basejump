import { Input as InnerInput, InputProps } from "react-daisyui";
import { ForwardedRef, forwardRef } from "react";
import cx from "classnames";

type Props = InputProps & {
  label?: string;
  helpText?: string;
  errorMessage?: string;
};
const Input = forwardRef(
  (
    { label, helpText, errorMessage, color, ...props }: Props,
    ref: ForwardedRef<HTMLInputElement>
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
        <InnerInput
          {...props}
          ref={ref}
          color={!!errorMessage ? "error" : color}
        />
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

Input.displayName = "Input";

export default Input;
