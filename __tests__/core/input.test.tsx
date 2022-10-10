import { act, render, screen } from "@tests/test-utils";
import Input from "@/components/core/input";

describe("Input component", () => {
  it("renders labels and help text", async () => {
    await act(async () => {
      await render(<Input label="label-here" helpText="help-text-here" />);
    });

    expect(screen.getByText("label-here")).toBeInTheDocument();
    expect(screen.getByText("help-text-here")).toBeInTheDocument();
  });

  it("renders errors", async () => {
    await act(async () => {
      await render(
        <Input
          label="label-here"
          helpText="help-text-here"
          errorMessage="error-message-here"
        />
      );
    });

    expect(screen.getByText("error-message-here")).toBeInTheDocument();
    expect(screen.getByText("error-message-here")).toHaveClass("text-error");
  });
});
