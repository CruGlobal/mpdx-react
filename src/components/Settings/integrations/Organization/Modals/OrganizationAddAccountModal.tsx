import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'src/components/common/Modal/Modal';
import { ConnectOrganization } from '../ConnectOrganization';

interface OrganizationAddAccountModalProps {
  handleClose: () => void;
  accountListId: string | undefined;
}

export const OrganizationAddAccountModal: React.FC<
  OrganizationAddAccountModalProps
> = ({ handleClose, accountListId }) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen
      title={t('Add Organization Account')}
      handleClose={handleClose}
      size="sm"
    >
      <ConnectOrganization onDone={handleClose} accountListId={accountListId} />
    </Modal>
  );
};
