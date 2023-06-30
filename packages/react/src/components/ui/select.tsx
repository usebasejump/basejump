"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { css } from "@stitches/core";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const selectTriggerDefaultStyles = css({
  display: "flex",
  height: "2.5rem",
  width: "100%",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: "$inputBorderRadius",
  borderWidth: "1px",
  borderColor: "$inputBorder",
  backgroundColor: "transparent",
  padding: "$inputPadding",
  fontSize: "$baseInputSize",
  // lineHeight: "1.25rem",
  color: "$inputText",
  "&::placeholder": {
    color: "$inputPlaceholder",
  },
  "&:focus": {
    outline: "2px solid transparent",
    outlineOffset: "2px",
    borderColor: "$inputBorderFocus",
  },
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.5,
  },
});

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={selectTriggerDefaultStyles()}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown style={{ width: "1rem", height: "1rem", opacity: 0.5 }} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const selectContentDefaultStyles = css({
  position: "relative",
  zIndex: 50,
  minWidth: "8rem",
  overflow: "hidden",
  borderRadius: "0.375rem",
  borderWidth: "1px",
  backgroundColor: "$dropdownItemBackground",
  color: "$inputText",
});

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={selectContentDefaultStyles()}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        style={{
          height: "var(--radix-select-trigger-height)",
          width: "100%",
          minWidth: "var(--radix-select-trigger-width)",
          padding: "0.25rem",
        }}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const selectLabelDefaultStyles = css({
  paddingTop: "0.375rem",
  paddingBottom: "0.375rem",
  paddingLeft: "2rem",
  paddingRight: "0.5rem",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  fontWeight: 600,
});

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={selectLabelDefaultStyles()}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const selectItemDefaultStyles = css({
  position: "relative",
  display: "flex",
  width: "100%",
  cursor: "default",
  WebkitUserSelect: "none",
  userSelect: "none",
  alignItems: "center",
  borderRadius: "0.125rem",
  padding: "$dropdownItemPadding",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  columnGap: "0.5rem",
  outline: "2px solid transparent",
  outlineOffset: "2px",
  "&:focus": {
    backgroundColor: "$dropdownItemHoverBackground",
    color: "$dropdownItemHoverText",
    cursor: "pointer",
  },
  "&:disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={selectItemDefaultStyles()}
    {...props}
  >
    <span
      style={{
        display: "flex",
        height: "0.875rem",
        width: "0.875rem",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SelectPrimitive.ItemIndicator>
        <Check style={{ width: "1rem", height: "1rem" }} />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    styles={{
      marginLeft: "-0.25rem",
      marginRight: "-0.25rem",
      marginTop: "0.25rem",
      marginBottom: "0.25rem",
      height: "1px",
      backgroundColor: "$dividerBackground",
    }}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
