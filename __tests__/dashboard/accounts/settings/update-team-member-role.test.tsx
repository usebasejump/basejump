import { act, render } from "@tests/test-utils";
import { toast } from "react-toastify";
import { ACCOUNT_ROLES } from "@/types/auth";
import UpdateTeamMemberRole from "@/components/dashboard/accounts/settings/update-team-member-role";
import { UseTeamMembersResponse } from "@/utils/api/use-team-members";

jest.spyOn(toast, "success");

describe("Update team member role", () => {
  beforeEach(async () => {
    await act(async () => {
      const member = {} as UseTeamMembersResponse;
      render(<UpdateTeamMemberRole member={member} />);
    });
  });

  test.skip("primary owners can change the primary owner", async () => {
    jest.mock("@/utils/api/use-team-role", () => ({
      __esModule: true,
      default: jest.fn(() => ({
        data: {
          accountRole: ACCOUNT_ROLES.owner,
          isPrimaryOwner: true,
        },
      })),
    }));
    expect(false).toBeTruthy();
    // const nameInput = await screen.getByTestId<HTMLInputElement>("name");
    // const name = "Fred Flinstone";
    // await act(async () => {
    //   fireEvent.input(nameInput, {
    //     target: {
    //       value: name,
    //     },
    //   });
    //
    //   fireEvent.submit(screen.getByRole("button"));
    // });
    //
    // expect(nameInput.value).toEqual(name);
    // await waitFor(
    //   () =>
    //     expect(fetch).toBeCalledWith(
    //       expect.stringContaining("profiles?id=eq.1234-5678"),
    //       expect.objectContaining({
    //         method: "PATCH",
    //         body: JSON.stringify({ name }),
    //       })
    //     ),
    //   { timeout: 1000 }
    // );
    // expect(toast.success).toHaveBeenCalled();
  });

  test.skip("Regular owners cannot change the primary owner", async () => {
    // const nameInput = await screen.getByTestId<HTMLInputElement>("name");
    // await act(async () => {
    //   fireEvent.input(nameInput, {
    //     target: {
    //       value: "",
    //     },
    //   });
    //   fireEvent.submit(screen.getByRole("button"));
    // });
    //
    // await waitFor(() =>
    //   expect(screen.getByTestId("name")).toHaveClass("input-error")
    // );
    expect(false).toBeTruthy();
  });

  test.skip("Primary owners only see the primary owner option on other owners", async () => {
    expect(false).toBeTruthy();
  });
});
