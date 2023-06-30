import { Dialog, DialogContent } from "../ui/dialog";
import {
  en,
  GET_ACCOUNT_MEMBERS_RESPONSE,
  I18nVariables,
} from "@usebasejump/shared";
import { BasePropsWithClient } from "../../types/base-props.ts";
import { Header1 } from "../ui/typography";
import { merge } from "@supabase/auth-ui-shared";
import { Container } from "../ui/container.tsx";
import { Button } from "../ui/button.tsx";
import { Checkbox } from "../ui/checkbox.tsx";
import { Label } from "../ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select.tsx";
import { useState } from "react";
import { ACCOUNT_ROLES } from "../../types/accounts.ts";

type Props = BasePropsWithClient & {
  member: GET_ACCOUNT_MEMBERS_RESPONSE[0];
  onUpdate: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FORM_DATA = {
  role: string;
  primaryOwner: boolean;
};

export const EditMemberRole = ({
  member,
  onUpdate,
  open,
  onOpenChange,
  supabaseClient,
  appearance,
  localization = { variables: {} },
}: Props) => {
  const [formData, setFormData] = useState<FORM_DATA>({
    role: member.account_role,
    primaryOwner: false,
  });
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.update_member_role;

  const roleOptions = [
    { label: i18n?.account_roles?.owner, value: ACCOUNT_ROLES.owner },
    { label: i18n?.account_roles?.member, value: ACCOUNT_ROLES.member },
  ];

  console.log("boop", formData);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Container direction="vertical" gap="large" appearance={appearance}>
          <Header1>{labels?.header_text}</Header1>
          <Select
            defaultValue={formData.role}
            onValueChange={(role) => setFormData({ ...formData, role })}
          >
            <SelectTrigger>
              <SelectValue placeholder={labels?.new_role_label} />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.role === ACCOUNT_ROLES.owner && (
            <Label
              htmlFor="primaryOwner"
              appearance={appearance}
              style={{
                display: "flex",
                alignItems: "center",
                alignContent: "center",
                columnGap: "0.5rem",
              }}
            >
              <Checkbox
                id="primaryOwner"
                defaultChecked={formData.primaryOwner}
                onChange={(e) =>
                  setFormData({ ...formData, primaryOwner: e.target.value })
                }
              />
              {labels?.change_primary_owner_label}
            </Label>
          )}
          <Container direction="inline" gap="small" appearance={appearance}>
            <Button color="primary" onClick={() => onUpdate()} width="auto">
              {labels?.button_label}
            </Button>
            <Button
              color="textOnly"
              width="auto"
              onClick={() => onOpenChange(false)}
            >
              {labels?.cancel_button_label}
            </Button>
          </Container>
        </Container>
      </DialogContent>
    </Dialog>
  );
};
