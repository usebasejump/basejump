"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import {css} from "@stitches/core";

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const popoverContentDefaultStyles = css({
    background: "$dialogContentBackground",
    color: "$dialogContentText",
    zIndex: 50,
    width: "18rem",
    borderRadius: "$dropdownContentRadius",
    borderWidth: "1px",
    padding: "0",
    outline: "2px solid transparent",
    outlineOffset: "2px"
})

const PopoverContent = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
    >(({ style, align = "center", sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            className={popoverContentDefaultStyles(style)}
            {...props}
        />
    </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }