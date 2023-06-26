"use client";

import * as React from "react";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { css } from "@stitches/core";
import { Appearance } from "../../types/appearance";
import generateClassNames from "../../utils/generate-class-names";

const dialogPortalDefaultStyles = css({
  display: "flex",
  position: "fixed",
  top: "0",
  right: "0",
  bottom: "0",
  left: "0",
  zIndex: "50",
  justifyContent: "center",
  variants: {
    size: {
      default: {
        alignItems: "flex-start",
        // handle breakpoints for mobile
        "@media (min-width: 640px)": {
          alignItems: "center",
        },
      },
      large: {
        alignItems: "flex-start",
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const dialogOverlayDefaultStyles = css({
  position: "fixed",
  display: "grid",
  placeItems: "center",
  overflowY: "auto",
  top: "0",
  right: "0",
  bottom: "0",
  left: "0",
  zIndex: "50",
  transitionProperty: "all",
  transitionDuration: "100ms",
  backgroundColor: "$dialogOverlayBackground",
  variants: {
    size: {
      default: {
        placeItems: "flex-start",
        // handle breakpoints for mobile
        "@media (min-width: 640px)": {
          placeItems: "center",
        },
      },
      large: {
        placeItems: "flex-start",
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const dialogContentDefaultStyles = css({
  background: "$dialogContentBackground",
  zIndex: "50",
  padding: "1.5rem",
  margin: "1rem auto",
  width: "100%",
  borderRadius: "$dialogContentRadius",
  borderWidth: "1px",
  gap: "1rem",
  boxShadow:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  // handle breakpoints for mobile
  "@media (min-width: 640px)": {
    maxWidth: "32rem",
  },
  variants: {
    size: {
      default: {
        "@media (min-width: 640px)": {
          maxWidth: "32rem",
        },
      },
      large: {
        "@media (min-width: 640px)": {
          maxWidth: "55rem",
          marginTop: "3rem",
        },
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

type DialogPortalProps = DialogPrimitive.DialogPortalProps & {
  appearance?: Appearance;
  size?: "default" | "large";
};

const DialogPortal = ({
  children,
  appearance,
  size = "default",
  ...props
}: DialogPortalProps) => {
  const portalClasses = generateClassNames(
    "dialogPortal",
    dialogPortalDefaultStyles({ size }),
    appearance
  );
  return (
    <DialogPrimitive.Portal {...props}>
      <div className={portalClasses.join(" ")}>{children}</div>
    </DialogPrimitive.Portal>
  );
};
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

type DialogOverlayProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Overlay
> & {
  appearance?: Appearance;
  size?: "default" | "large";
};

const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ appearance, children, size = "default", ...props }, ref) => {
  const overlayClasses = generateClassNames(
    "dialogOverlay",
    dialogOverlayDefaultStyles({ size }),
    appearance
  );
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={overlayClasses.join(" ")}
      {...props}
    >
      {children}
    </DialogPrimitive.Overlay>
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogContentProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  appearance?: Appearance;
  size?: "default" | "large";
};

const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ appearance, children, size = "default", ...props }, ref) => {
  const contentClasses = generateClassNames(
    "dialogContent",
    dialogContentDefaultStyles({ size }),
    appearance
  );

  return (
    <DialogPortal size={size}>
      <DialogOverlay size={size}>
        <DialogPrimitive.Content
          ref={ref}
          className={contentClasses.join(" ")}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogOverlay>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

export { Dialog, DialogTrigger, DialogContent };
