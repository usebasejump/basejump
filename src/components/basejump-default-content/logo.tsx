/* istanbul ignore file */
import Image from "next/image";
import cx from "classnames";

type Props = {
  size: "sm" | "lg";
  className?: string;
};

const Logo = ({ size = "lg", className }: Props) => {
  const height = size === "sm" ? 40 : 150;
  const width = size === "sm" ? 40 : 150;
  return (
    <div
      className={cx(
        "flex items-center justify-center",
        {
          "gap-x-4": size === "lg",
          "gap-x-2": size === "sm",
        },
        className
      )}
    >
      <Image src={"/images/basejump-logo.png"} height={height} width={width} />
      <h1
        className={cx("text-8xl font-black", {
          "text-8xl": size === "lg",
          "text-2xl": size === "sm",
        })}
      >
        Basejump
      </h1>
    </div>
  );
};

export default Logo;
