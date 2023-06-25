"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { css } from "@stitches/core";
import { Search } from "lucide-react";

const commandDefaultStyles = css({
  display: "flex",
  height: "100%",
  width: "100%",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: "$dropdownContentRadius",
  backgroundColor: "$dropdownContentBackground",
  color: "$dropdownContentText",
});

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive ref={ref} className={commandDefaultStyles()} {...props} />
));
Command.displayName = CommandPrimitive.displayName;

const commandInputContainerDefaultStyles = css({
  display: "flex",
  alignItems: "center",
  borderBottomWidth: "1px",
  paddingLeft: "0.75rem",
  paddingRight: "0.75rem",
});

const commandInputDefaultStyles = css({
  display: "flex",
  height: "2.75rem",
  width: "100%",
  borderRadius: "$dropdownContentRadius",
  backgroundColor: "transparent",
  paddingTop: "0.75rem",
  paddingBottom: "0.75rem",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  outline: "2px solid transparent",
  outlineOffset: "2px",
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  "&::placeholder": {
    color: "$dropdownSearchPlaceholder",
  },
});

const commandInputSearchIconStyles = css({
  marginRight: "0.5rem",
  height: "1rem",
  width: "1rem",
  flexShrink: 0,
  opacity: 0.5,
});

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className={commandInputContainerDefaultStyles()} cmdk-input-wrapper="">
    <Search className={commandInputSearchIconStyles()} />
    <CommandPrimitive.Input
      ref={ref}
      className={commandInputDefaultStyles()}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const commandListDefaultStyles = css({
  maxHeight: "275px",
  overflowY: "auto",
  overflowX: "hidden",
});

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={commandListDefaultStyles()}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const commandEmptyDefaultStyles = css({
  paddingTop: "1.5rem",
  paddingBottom: "1.5rem",
  textAlign: "center",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
});

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={commandEmptyDefaultStyles()}
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const commandSeparatorDefaultStyles = css({
  marginLeft: "-0.25rem",
  marginRight: "-0.25rem",
  height: "1px",
  backgroundColor: "$dividerBackground",
});

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={commandSeparatorDefaultStyles()}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const commandItemDefaultStyles = css({
  position: "relative",
  display: "flex",
  cursor: "default",
  userSelect: "none",
  alignItems: "center",
  borderRadius: "0.125rem",
  // paddingLeft: "0.5rem",
  // paddingRight: "0.5rem",
  // paddingTop: "0.375rem",
  // paddingBottom: "0.375rem",
  // fontSize: "0.875rem",
  // lineHeight: "1.25rem",
  outline: "2px solid transparent",
  outlineOffset: "2px",
  "&[data-disabled]": {
    pointerEvents: "none",
    opacity: 0.5,
  },
  "&:focus": {
    backgroundColor: "$dropdownItemHoverBackground",
    color: "$dropdownItemHoverText",
    cursor: "pointer",
  },
});

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={commandItemDefaultStyles()}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const commandGroupDefaultStyles = css({
  overflow: "hidden",
  ">[cmdk-group-heading]": {
    padding: "$dropdownLabelPadding",
    fontSize: "0.8rem",
    lineHeight: "1rem",
    fontWeight: "500",
  },
  "&[aria-selected='true']": {
    backgroundColor: "transaprent",
  },
});

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={commandGroupDefaultStyles()}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

export {
  Command,
  CommandInput,
  CommandGroup,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandSeparator,
};
