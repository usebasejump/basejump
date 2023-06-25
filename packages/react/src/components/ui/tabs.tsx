"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import {css} from "@stitches/core";

const Tabs = TabsPrimitive.Root

const tabsListDefaultStyles = css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "start",
    width: "100%",
    background: "$inputBackground",
    color: "$tabsUnselectedText",
    borderBottomWidth: "1px",
    borderColor: "$tabsUnselectedBorder",
});

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
    >(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={tabsListDefaultStyles()}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

const tabsTriggerDefaultStyles = css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    borderRadius: "0.125rem",
    paddingLeft: "0.75rem",
    paddingRight: "0.75rem",
    paddingTop: "0.375rem",
    paddingBottom: "0.375rem",
    marginBottom: "-1px",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    transitionProperty: "all",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
    "&:focus-visible": {
        outline: "2px solid transparent",
        outlineOffset: "2px"
    },
    "&:disabled": {
        pointerEvents: "none",
        opacity: 0.5
    },
    "&[data-state=active]": {
        backgroundColor: "$defaultButtonBackground",
        color: "$tabsSelectedText",
        borderBottomWidth: "3px",
        borderColor: "$tabsSelectedBorder"
    }
});

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
    >(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={tabsTriggerDefaultStyles()}
        {...props}
    />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const tabsContentDefaultStyles = css({
    marginTop: "0.5rem",
    padding: "0.5rem 0.75rem",
    "&:focus-visible": {
        outline: "2px solid transparent",
        outlineOffset: "2px",
    }
});

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
    >(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={tabsContentDefaultStyles()}
        {...props}
    />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
