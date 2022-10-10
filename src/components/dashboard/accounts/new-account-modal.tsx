import { Modal } from "react-daisyui";
import NewAccountForm from "@/components/dashboard/accounts/new-account-form";
import useTranslation from "next-translate/useTranslation";
import Portal from "@/components/core/portal";

type Props = {
  open: boolean;
  onComplete: (accountId: string) => void;
  onClose: () => void;
};
const NewAccountModal = ({ open, onClose, onComplete }: Props) => {
  const { t } = useTranslation("dashboard");
  return (
    <Portal>
      <Modal open={open} onClickBackdrop={onClose}>
        <Modal.Header className="font-bold">
          {t("newAccountModal.title")}
        </Modal.Header>
        <Modal.Body>
          <NewAccountForm onComplete={onComplete} />
        </Modal.Body>
      </Modal>
    </Portal>
  );
};

export default NewAccountModal;
