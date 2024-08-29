import React, { useMemo, useRef } from 'react';
import { DialogActions, DialogContent } from '@mui/material';
import { FormikValues } from 'formik';
import { DateTime } from 'luxon';
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
  contactExclusions,
} from '../../InitialPage/AddAppealForm/AddAppealForm';

interface AddAppealModalProps {
  appealName: string;
  appealGoal: number;
  appealStatuses: FilterOption[];
  appealExcludes: ContactExclusion[];
  appealIncludes: object;
  isEndOfYearAsk: boolean;
  handleClose: () => void;
}

export const AddAppealModal: React.FC<AddAppealModalProps> = ({
  appealName,
  appealGoal,
  appealStatuses,
  appealExcludes = [],
  appealIncludes = {},
  isEndOfYearAsk,
  handleClose,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const formRef = useRef<FormikValues>();

  const inclusionFilter = useMemo(() => {
    if (!isEndOfYearAsk) {
      return { ...appealIncludes };
    }
    const now = DateTime.local();
    const fiveYears = now.minus({ years: 5 }).toFormat('yyyy-MM-dd');
    const nowFormatted = now.toFormat('yyyy-MM-dd');

    const includes = {
      donation: 'one',
      donation_date: `${fiveYears}..${nowFormatted}`,
    };

    return {
      ...appealIncludes,
      ...includes,
    };
  }, [appealIncludes, isEndOfYearAsk]);

  const exclusionFilter = useMemo(() => {
    if (!isEndOfYearAsk) {
      return appealExcludes;
    }
    return contactExclusions;
  }, [appealExcludes, isEndOfYearAsk]);

  const handleSubmit = async () => {
    if (formRef.current) {
      await formRef.current.handleSubmit();
      handleClose();
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
          appealExcludes={exclusionFilter}
          appealIncludes={inclusionFilter}
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
