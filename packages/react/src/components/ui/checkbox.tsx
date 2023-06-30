"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { css } from "@stitches/core";

const checkboxDefaultStyles = css({
  height: "1.25rem",
  width: "1.25rem",
  flexShrink: 0,
  borderRadius: "0.125rem",
  borderWidth: "1px",
  borderColor: "$inputBorder",
  "&:focus-visible": {
    outline: "2px solid transparent",
    outlineOffset: "2px",
  },
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  "&[data-state=checked]": {
    backgroundColor: "$brand",
    color: "$brandButtonText",
  },
});

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={checkboxDefaultStyles()}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      styles={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        color: "currentColor",
      }}
    >
      <Check style={{ height: "1rem", width: "1rem" }} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
