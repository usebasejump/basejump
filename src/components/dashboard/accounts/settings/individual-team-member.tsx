import { Badge, Button, Dropdown, Modal } from "react-daisyui";
import { DotsHorizontalIcon } from "@heroicons/react/outline";
import useTranslation from "next-translate/useTranslation";
import Portal from "@/components/core/portal";
import UpdateTeamMemberRole from "@/components/dashboard/accounts/settings/update-team-member-role";
import { useToggle } from "react-use";
import RemoveTeamMember from "@/components/dashboard/accounts/settings/remove-team-member";

const IndividualTeamMember = ({ member }) => {
  const [updateRole, toggleUpdateRole] = useToggle(false);
  const [removeMember, toggleRemoveMember] = useToggle(false);
  const { t } = useTranslation("dashboard");

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4">
        <div className="md:col-span-3 pl-6 py-3">
          <p className="font-bold px-1 mb-0.5">{member.name}</p>
          <div>
            {member.is_primary_owner ? (
              <Badge color="primary">{t("listTeamMembers.primaryOwner")}</Badge>
            ) : (
              <Badge>{member.account_role}</Badge>
            )}
          </div>
        </div>
        {!member.is_primary_owner && (
          <div className="col-span-1 px-6 py-3 flex gap-x-2 justify-end">
            <Dropdown horizontal="left" vertical="top">
              <Button shape="square" color="ghost">
                <DotsHorizontalIcon className="h-5 w-5" />
              </Button>
              <Dropdown.Menu className="w-52">
                <Dropdown.Item onClick={() => toggleUpdateRole(true)}>
                  {t("listTeamMembers.updateRole")}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => toggleRemoveMember(true)}>
                  {t("listTeamMembers.removeMember")}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </div>

      <Portal>
        {updateRole && (
          <Modal open={updateRole} onClickBackdrop={toggleUpdateRole}>
            <Modal.Header className="font-bold">
              {t("listTeamMembers.updateRoleTitle", { name: member.name })}
            </Modal.Header>
            <UpdateTeamMemberRole
              member={member}
              onComplete={() => toggleUpdateRole(false)}
            />
          </Modal>
        )}
        {removeMember && (
          <Modal open={removeMember} onClickBackdrop={toggleRemoveMember}>
            <Modal.Header className="font-bold">
              {t("listTeamMembers.removeMemberTitle", { name: member.name })}
            </Modal.Header>
            <RemoveTeamMember member={member} />
          </Modal>
        )}
      </Portal>
    </>
  );
};

export default IndividualTeamMember;
