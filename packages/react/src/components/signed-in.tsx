'use client'

import {useBasejumpSession} from "./basejump-user-session";
import {ReactNode} from "react";

type Props = {
    children: ReactNode;
}

/**
 * This component will only render its children if the user is logged in.
 * @param children
 * @constructor
 */
export const SignedIn = ({children}: Props) => {
    const session = useBasejumpSession();

    return !!session ? <>{children}</> : null;
}
