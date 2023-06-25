import {css} from '@stitches/core'
import {generateClassNames} from '@supabase/auth-ui-shared'
import {Appearance} from "@supabase/auth-ui-react/dist/types";
import {ButtonHTMLAttributes, FC, ReactNode} from "react";

const buttonDefaultStyles = css({
    fontFamily: '$buttonFontFamily',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '$borderRadiusButton',
    fontSize: '$baseButtonSize',
    padding: '$buttonPadding',
    cursor: 'pointer',
    borderWidth: '$buttonBorderWidth',
    borderStyle: 'solid',
    transitionPproperty: 'background-color',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '100ms',
    '&:disabled': {
        opacity: 0.7,
        cursor: 'unset',
    },
    variants: {
        width: {
            full: {
                width: '100%',
            },
            auto: {
                width: 'auto',
            }
        },
        color: {
            default: {
                backgroundColor: '$defaultButtonBackground',
                color: '$defaultButtonText',
                borderColor: '$defaultButtonBorder',
                '&:hover:not(:disabled)': {
                    backgroundColor: '$defaultButtonBackgroundHover',
                },
            },
            primary: {
                backgroundColor: '$brand',
                color: '$brandButtonText',
                borderColor: '$brandAccent',
                '&:hover:not(:disabled)': {
                    backgroundColor: '$brandAccent',
                },
            },
            textOnly: {
                backgroundColor: '$defaultButtonBackground',
                color: '$defaultButtonText',
                borderColor: 'transparent',
                '&:hover:not(:disabled)': {
                    backgroundColor: '$defaultButtonBackgroundHover',
                },
            }
        },
    },
    defaultVariants: {
        width: 'full',
        color: 'default',
    }
})

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    icon?: ReactNode
    color?: 'default' | 'primary' | 'textOnly'
    width?: 'full' | 'auto'
    loading?: boolean
    appearance?: Appearance
}

const Button: FC<ButtonProps> = ({
                                     children,
                                     color = 'default',
                                     appearance,
                                     icon,
                                     width = 'full',
                                     loading = false,
                                     ...props
                                 }) => {
    const classNames = generateClassNames(
        'button',
        buttonDefaultStyles({color, width}),
        appearance
    )

    return (
        <button
            {...props}
            style={appearance?.style?.button}
            className={classNames.join(' ')}
            disabled={loading}
        >
            {icon}
            {children}
        </button>
    )
}

export {Button}