import { Appearance as SupabaseAppearance } from "@supabase/auth-ui-react/dist/types";
import { ThemeVariables as SupabaseThemeVariables } from "@supabase/auth-ui-shared";

type ThemeVariables = SupabaseThemeVariables & {
  colors?: {
    dialogContentBackground?: string;
    dialogContentText?: string;
    dialogOverlayBackground?: string;
    dropdownItemHoverBackground?: string;
    dropdownItemHoverText?: string;
    dropdownSearchPlaceholder?: string;
    tabsUnselectedText?: string;
    tabsSelectedText?: string;
    tabsSelectedBorder?: string;
    tabsUnselectedBorder?: string;
  };
  sizes?: {
    userButtonAvatarSize?: string;
  };
  radii?: {
    dialogContentRadius?: string;
    dropdownContentRadius?: string;
  };
  space?: {
    dropdownItemPadding?: string;
    dropdownLabelPadding?: string;
  };
  fontSizes?: {
    header1?: string;
    header2?: string;
    header3?: string;
  };
  media?: {
    bp1?: string;
    bp2?: string;
    bp3?: string;
  };
};

export type Appearance = SupabaseAppearance & {
  variables?: {
    default: ThemeVariables;
    [key: string]: ThemeVariables;
  };
  className?: {
    dialogPortal?: string;
    dialogOverlay?: string;
    dialogContent?: string;
    dropdownMenuContent?: string;
  };
};

export type Theme = {
  default: ThemeVariables;

  [key: string]: ThemeVariables;
};
