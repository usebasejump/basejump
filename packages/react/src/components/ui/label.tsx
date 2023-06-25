import {css} from '@stitches/core'
import {generateClassNames} from '@supabase/auth-ui-shared'
import {Appearance} from "@supabase/auth-ui-react/dist/types";
import {FC, LabelHTMLAttributes, ReactNode} from "react";

const labelDefaultStyles = css({
    fontFamily: '$labelFontFamily',
    fontSize: '$baseLabelSize',
    marginBottom: '$labelBottomMargin',
    color: '$inputLabelText',
    display: 'block',
})

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    children: ReactNode
    appearance?: Appearance
}

const Label: FC<LabelProps> = ({children, appearance, ...props}) => {
    const classNames = generateClassNames(
        'label',
        labelDefaultStyles(),
        appearance
    )

    return (
        <label
            {...props}
            style={appearance?.style?.label}
            className={classNames.join(' ')}
        >
            {children}
        </label>
    )
}

export {Label}