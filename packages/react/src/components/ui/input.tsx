import {css} from '@stitches/core'
import {BaseAppearance, generateClassNames} from '@supabase/auth-ui-shared'
import {Appearance} from "@supabase/auth-ui-react/dist/types";
import {FC, InputHTMLAttributes, ReactNode} from "react";

const inputDefaultStyles = css({
    fontFamily: '$inputFontFamily',
    background: '$inputBackground',
    borderRadius: '$inputBorderRadius',
    padding: '$inputPadding',
    cursor: 'text',
    borderWidth: '$inputBorderWidth',
    borderColor: '$inputBorder',
    borderStyle: 'solid',
    fontSize: '$baseInputSize',
    width: '100%',
    color: '$inputText',
    boxSizing: 'border-box',
    '&:hover': {
        borderColor: '$inputBorderHover',
        outline: 'none',
    },
    '&:focus': {
        borderColor: '$inputBorderFocus',
        outline: 'none',
    },
    '&::placeholder': {
        color: '$inputPlaceholder',
        letterSpacing: 'initial',
    },
    transitionPproperty: 'background-color, border',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '100ms',
    variants: {
        type: {
            default: {
                letterSpacing: '0px',
            },
            password: {
                letterSpacing: '6px',
            },
        },
    },
})

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    children?: ReactNode
    type: 'text' | 'password' | 'email'
    appearance?: Appearance
}

const Input: FC<InputProps> = ({children, appearance, ...props}) => {
    const classNames = generateClassNames(
        'input',
        inputDefaultStyles({
            type: props.type === 'password' ? 'password' : 'default',
        }),
        appearance as BaseAppearance
    )

    return (
        <input
            {...props}
            style={appearance?.style?.input}
            className={classNames.join(' ')}
        >
            {children}
        </input>
    )
}

export {Input}
