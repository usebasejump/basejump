import { css } from "@stitches/core";

const tableStyles = css({
  width: "100%",
  "& th": {
    textAlign: "left",
    borderBottomWidth: "1px",
    padding: "$tableHeaderCellPadding",
    fontWeight: "300",
    textTransform: "uppercase",
    fontSize: ".65rem",
  },
  "& td": {
    padding: "$tableCellPadding",
  },
});

export const Table = ({ children }) => (
  <table className={tableStyles()}>{children}</table>
);
