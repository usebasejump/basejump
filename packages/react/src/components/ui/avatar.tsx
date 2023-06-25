import {css} from "@stitches/core";

const avatarIconStyles = css({
    flexShrink: 0,
    borderRadius: '100%',
    variants: {
        size: {
            default: {
                height: "1.5rem",
                width: "1.5rem",
            },
            large: {
                height: "2rem",
                width: "2rem",
            }
        },
    },
    defaultVariants: {
        size: "default"
    }
});

type Props = {
    url?: string;
    uniqueId?: string;
    size?: "default" | "large";
}
export const Avatar = ({url, uniqueId, size = "default"}: Props) => (
    <img src={url ? url : `https://avatar.vercel.sh/${uniqueId}`} className={avatarIconStyles({size})}/>
);