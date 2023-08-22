import { merge, ThemeSupa } from "@supabase/auth-ui-shared";
import { Theme } from "../types/appearance";

const themeOverrides: Theme = {
  default: {
    colors: {
      headerText: "black",
      dialogContentBackground: "white",
      dialogContentText: "black",
      dialogOverlayBackground: "rgba(0, 0, 0, 0.5)",
      dropdownItemBackground: "white",
      dropdownItemHoverBackground: "$defaultButtonBackgroundHover",
      dropdownItemHoverText: "$defaultButtonText",
      dropdownSearchPlaceholder: "$inputPlaceholder",
      tabsUnselectedText: "$inputPlaceholder",
      tabsSelectedText: "$defaultButtonText",
      tabsSelectedBorder: "$brand",
      tabsUnselectedBorder: "$inputBorder",
      avatarBackgrounds: [
        "#92A1C6",
        "#146A7C",
        "#F0AB3D",
        "#C271B4",
        "#C20D90",
      ],
    },
    radii: {
      dialogContentRadius: "0.5rem",
      dropdownContentRadius: "0.5rem",
    },
    space: {
      dropdownItemPadding: "0.75rem 1.25rem",
      dropdownLabelPadding: "0.5rem 0.75rem",
      tableCellPadding: "0.5rem 0.75rem",
      tableHeaderCellPadding: "0.5rem 0.75rem",
    },
    fontSizes: {
      header1: "1.5rem",
      header2: "1.25rem",
      header3: "1rem",
      baseBodySize: "1rem",
    },
    media: {
      bp1: "(min-width: 640px)",
      bp2: "(min-width: 768px)",
      bp3: "(min-width: 1024px)",
    },
  },
};

const BasejumpTheme = merge(ThemeSupa, themeOverrides);

export default BasejumpTheme;
