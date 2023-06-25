import {ReactNode} from "react";

export default function ensureChildComponent(children: ReactNode, defaultText?: string): ReactNode {
    if (!children) {
        children = defaultText;
    }

    if (typeof children === "string") {
        return <button style={{all: 'unset', cursor: 'pointer'}}>{children}</button>
    }

    return children;
}