import { Button } from "./button.tsx";
import { css } from "@stitches/core";
import { useCopyToClipboard } from "react-use";

const copyButtonDefaultStyles = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  overflow: "hidden",
  borderRadius: "$inputRadius",
  borderWidth: "1px",
  padding: "$inputPadding",
  columnGap: "0.5rem",
});

export const CopyButton = ({ text }) => {
  const [state, copyToClipboard] = useCopyToClipboard();

  return (
    <div className={copyButtonDefaultStyles()}>
      <div
        style={{
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {text}
      </div>
      <Button
        width="auto"
        onClick={() => copyToClipboard(text)}
        color="default"
      >
        {state.value ? "Copied" : "Copy"}
      </Button>
    </div>
  );
};
