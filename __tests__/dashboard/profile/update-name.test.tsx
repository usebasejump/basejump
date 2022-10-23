import { act, fireEvent, render, screen, waitFor } from "@tests/test-utils";
import UpdateProfileName from "@/components/dashboard/profile/update-profile-name";
import { toast } from "react-toastify";

jest.spyOn(toast, "success");

jest.mock("@/utils/api/use-user-profile", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      name: "John Doe",
    },
  })),
}));

jest.mock("@supabase/auth-helpers-react", () => {
  const original = jest.requireActual("@supabase/auth-helpers-react");
  return {
    ...original,
    useUser: jest.fn(() => ({
      id: "1234-5678",
    })),
  };
});

describe("Update profile name", () => {
  beforeEach(async () => {
    await act(async () => {
      render(<UpdateProfileName />);
    });
  });
  it.skip("let's you update your profile name", async () => {
    const nameInput = await screen.getByTestId<HTMLInputElement>("name");
    const name = "Fred Flinstone";
    await act(async () => {
      fireEvent.input(nameInput, {
        target: {
          value: name,
        },
      });

      fireEvent.submit(screen.getByRole("button"));
    });

    expect(nameInput.value).toEqual(name);
    await waitFor(
      () =>
        expect(fetch).toBeCalledWith(
          expect.stringContaining("profiles?id=eq.1234-5678"),
          expect.objectContaining({
            method: "PATCH",
            body: JSON.stringify({ name }),
          })
        ),
      { timeout: 1000 }
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it("Should error if the name is empty", async () => {
    const nameInput = await screen.getByTestId<HTMLInputElement>("name");
    await act(async () => {
      fireEvent.input(nameInput, {
        target: {
          value: "",
        },
      });
      fireEvent.submit(screen.getByRole("button"));
    });

    await waitFor(() =>
      expect(screen.getByTestId("name")).toHaveClass("input-error")
    );
  });
});
