import React, { useRef } from 'react';
import { DialogActions, DialogContent } from '@mui/material';
import { FormikValues } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { FilterOption } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import AddAppealForm, {
  ContactExclusion,
} from '../../InitialPage/AddAppealForm/AddAppealForm';

interface AddAppealModalProps {
  appealName: string;
  appealGoal: number;
  appealStatuses: FilterOption[];
  appealExcludes: ContactExclusion[];
  handleClose: () => void;
}

export const AddAppealModal: React.FC<AddAppealModalProps> = ({
  appealName,
  appealGoal,
  appealStatuses,
  appealExcludes,
  handleClose,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const formRef = useRef<FormikValues>();

  const handleSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  return (
    <Modal isOpen={true} title={t('Add Appeal')} handleClose={handleClose}>
      <DialogContent dividers>
        <AddAppealForm
          accountListId={accountListId ?? ''}
          appealName={appealName}
          appealGoal={appealGoal}
          appealStatuses={appealStatuses}
          appealExcludes={appealExcludes}
          formRef={formRef}
        />
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose}>{t('No')}</CancelButton>
        <SubmitButton type="button" onClick={handleSubmit}>
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
