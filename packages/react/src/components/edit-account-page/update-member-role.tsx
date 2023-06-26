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

type Props = BasePropsWithClient & {
  member: GET_ACCOUNT_MEMBERS_RESPONSE[0];
  onUpdate: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
export const UpdateMemberRole = ({
  member,
  onUpdate,
  open,
  onOpenChange,
  supabaseClient,
  appearance,
  localization = { variables: {} },
}: Props) => {
  const i18n: I18nVariables = merge(en, localization?.variables ?? {});
  const labels = i18n?.update_member_role;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Container direction="vertical" gap="large" appearance={appearance}>
          <Header1>{labels?.header_text}</Header1>
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
