import {ReactNode, useEffect} from "react";
import {merge} from "@supabase/auth-ui-shared";
import {createStitches, createTheme} from "@stitches/core";
import {Appearance} from "../../types/appearance";
import BasejumpTheme from "../../themes/default-theme";

type Props = {
    children: ReactNode
    appearance?: Appearance
    theme?: string
}

const ThemeContainer = ({children, appearance = {theme: BasejumpTheme}, theme = "default"}: Props) => {
    useEffect(() => {
        createStitches({
            theme: merge(
                appearance?.theme?.default ?? {},
                appearance?.variables?.default ?? {}
            ),
        })
    }, [appearance]);

    return (
        <div
            className={
                theme !== 'default'
                    ? createTheme(
                        merge(
                            appearance?.theme?.[theme] ?? {},
                            appearance?.variables?.[theme] ?? {}
                        )
                    )
                    : ''
            }
        >
            {children}
        </div>
    )
}

export default ThemeContainer