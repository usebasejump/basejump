import { act, fireEvent, render, screen, waitFor } from "@tests/test-utils";
import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import UpdateEmailAddress from "@/components/dashboard/profile/update-email-address";
import { toast } from "react-toastify";

// @ts-ignore
jest.spyOn(supabaseClient.auth, "update").mockImplementation(async () => {
  return {
    data: {
      new_email: "asdf@asdf.com",
    },
  };
});
jest.spyOn(toast, "success");

jest.mock("@supabase/auth-helpers-react", () => {
  const original = jest.requireActual("@supabase/auth-helpers-react");
  return {
    ...original,
    useUser: jest.fn(() => ({
      user: {
        id: "1234-5678",
        email: "test@test.com",
      },
    })),
  };
});

describe("Update user email", () => {
  beforeEach(async () => {
    await act(async () => {
      render(<UpdateEmailAddress />);
    });
  });
  it("let's you update your email", async () => {
    const emailInput = await screen.getByTestId<HTMLInputElement>("email");
    const email = "test2@test.com";
    await act(async () => {
      fireEvent.input(emailInput, {
        target: {
          value: email,
        },
      });

      fireEvent.submit(screen.getByRole("button"));
    });

    expect(emailInput.value).toEqual(email);
    expect(supabaseClient.auth.update).toHaveBeenCalledWith({ email });
    expect(toast.success).toHaveBeenCalled();
  });

  it("Should error if the email is empty", async () => {
    const emailInput = await screen.getByTestId<HTMLInputElement>("email");
    await act(async () => {
      fireEvent.input(emailInput, {
        target: {
          value: "",
        },
      });
      fireEvent.submit(screen.getByRole("button"));
    });

    await waitFor(() =>
      expect(screen.getByTestId("email")).toHaveClass("input-error")
    );
  });
});
