import {Appearance} from "../types/appearance";

type classKeys =
    | 'button'
    | 'container'
    | 'anchor'
    | 'divider'
    | 'label'
    | 'input'
    | 'loader'
    | 'message'
    | 'dialogContent'
    | 'dialogPortal'
    | 'dialogOverlay'
    | 'dropdownMenuContent';

export default function generateClassNames(classNameKey: classKeys, defaultStyles: string, appearance?: Appearance) {
    const classNames = []

    if (appearance?.className?.[classNameKey]) {
        classNames.push(appearance?.className?.[classNameKey])
    }

    if (appearance?.extend === undefined || appearance?.extend === true) {
        classNames.push(defaultStyles)
    }

    return classNames
}