import { css } from "@stitches/core";
import { BaseAppearance, generateClassNames } from "@supabase/auth-ui-shared";
import { Appearance } from "@supabase/auth-ui-react/dist/types";
import { FC, HtmlHTMLAttributes, ReactNode } from "react";

const containerDefaultStyles = css({
  display: "flex",
  gap: "4px",
  variants: {
    position: {
      start: {
        justifyContent: "flex-start",
      },
      end: {
        justifyContent: "flex-end",
      },
      center: {
        justifyContent: "center",
      },
    },
    direction: {
      inline: {},
      horizontal: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(48px, 1fr))",
      },
      vertical: {
        flexDirection: "column",
        margin: "8px 0",
      },
    },
    gap: {
      small: {
        gap: "4px",
      },
      medium: {
        gap: "8px",
      },
      large: {
        gap: "16px",
      },
      xlarge: {
        gap: "32px",
      },
    },
  },
});

export interface ContainerProps extends HtmlHTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: "horizontal" | "vertical" | "inline";
  gap?: "small" | "medium" | "large" | "xlarge";
  position?: "start" | "end" | "center";
  appearance?: Appearance;
}

const Container: FC<ContainerProps> = ({ children, appearance, ...props }) => {
  const classNames = generateClassNames(
    "container",
    containerDefaultStyles({
      direction: props.direction,
      gap: props.gap,
      position: props.position,
    }),
    appearance as BaseAppearance
  );

  return (
    <div
      {...props}
      style={appearance?.style?.container}
      className={classNames.join(" ")}
    >
      {children}
    </div>
  );
};

export { Container };
