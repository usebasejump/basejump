"use client"

import {ComponentPropsWithoutRef, ElementRef, forwardRef} from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

import {Appearance} from "../../types/appearance";
import generateClassNames from "../../utils/generate-class-names";
import {css} from "@stitches/core";

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const dropdownMenuContentDefaultStyles = css({
    zIndex: 50,
    overflow: "hidden",
    borderRadius: "0.375rem",
    borderWidth: "1px",
    padding: "0.25rem",
    maxWidth: "20rem",
});

type DropdownMenuProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    appearance?: Appearance;
}

const DropdownMenuContent = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Content>,DropdownMenuProps>
(({ appearance, sideOffset = 4, ...props }, ref) => {
        const contentClasses = generateClassNames(
            'dropdownMenuContent',
            dropdownMenuContentDefaultStyles(),
            appearance
        );
        return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                ref={ref}
                sideOffset={sideOffset}
                className={contentClasses.join(' ')}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    )
})
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const dropdownMenuItemDefaultStyles = css({
        position: "relative",
        display: "flex",
        cursor: "pointer",
        "-webkitUserSelect": "none",
        userSelect: "none",
        alignItems: "center",
        borderRadius: "0.125rem",
        padding: "$dropdownItemPadding",
        fontSize: "1rem",
        lineHeight: "1.25rem",
        outline: "2px solid transparent",
        outlineOffset: "2px",
       "&:focus": {
            backgroundColor: "$dropdownItemHoverBackground",
            color: "$dropdownItemHoverText"
       }
});

const DropdownMenuItem = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Item>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
}
    >(({ className, inset, ...props }, ref) => (
        <div className={dropdownMenuItemDefaultStyles()}>
            <DropdownMenuPrimitive.Item
                ref={ref}
                {...props}
            />
        </div>
));

DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName


const dropdenMenuLabelDefaultStyles = css({
    padding: "$dropdownLabelPadding",
    fontSize: "0.8rem",
    lineHeight: "1rem",
    fontWeight: "500"
});

const DropdownMenuLabel = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Label>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
}
    >(({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
        ref={ref}
        className={dropdenMenuLabelDefaultStyles()}
        {...props}
    />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const dropdownMenuSeparatorDefaultStyles = css({
    marginLeft: "-0.25rem",
    marginRight: "-0.25rem",
    marginTop: "0.25rem",
    marginBottom: "0.25rem",
    height: "1px",
    background: "$dividerBackground"
});

const DropdownMenuSeparator = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Separator>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
    >(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
        ref={ref}
        className={dropdownMenuSeparatorDefaultStyles()}
        {...props}
    />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuPortal
}
