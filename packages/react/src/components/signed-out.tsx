import {useBasejumpSession} from "./basejump-user-session";
import {ReactNode} from "react";

type Props = {
    children: ReactNode;
}
/**
 * This component will only render its children if the user is logged out.
 * @param children
 * @constructor
 */
export const SignedOut = ({children}: Props) => {
    const session = useBasejumpSession();

    return !!session ? null : <>{children}</>;
}
