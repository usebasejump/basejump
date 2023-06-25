import {ReactNode} from "react";
import {css} from "@stitches/core";

const headerDefaultStyles = css({
    color: '$messageText',
    fontFamily: '$bodyFontFamily',
    variants: {
        tag: {
            h1: {
                fontSize: "$header1",
            },
            h2: {
                fontSize: "$header2"
            },
            h3: {
                fontSize: "$header3"
            },
            p: {
                fontSize: "$baseBodySize"
            }
        }
    },
    defaultVariants: {
        tag: "h1"
    }
});

type Props = {
    children: ReactNode
    tag?: 'h1' | 'h2' | 'h3' | 'p'
}

const Typography = ({children, tag = "h1"}: Props) => {
    const Tag = tag || 'h1';
    return (
        <Tag className={headerDefaultStyles({tag})}>{children}</Tag>
    )
}

export const Header1 = ({children}: Props) => (
    <Typography tag="h1">{children}</Typography>
)

export const Header2 = ({children}: Props) => (
    <Typography tag="h2">{children}</Typography>
);

export const Header3 = ({children}: Props) => (
    <Typography tag="h3">{children}</Typography>
);

export const Text = ({children}: Props) => (
    <Typography tag="p">{children}</Typography>
);