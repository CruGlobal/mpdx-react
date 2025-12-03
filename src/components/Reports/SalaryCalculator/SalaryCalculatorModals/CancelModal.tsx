import React from 'react';
import { SubmitModal } from '../../Shared/CalculationReports/SubmitModal/SubmitModal';

interface CancelModalProps {
  handleClose: () => void;
  handleConfirm: () => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  handleClose,
  handleConfirm,
}) => {
  return (
    <SubmitModal
      formTitle="Salary Calculation Form"
      handleClose={handleClose}
      handleConfirm={handleConfirm}
      overrideTitle="Do you want to cancel?"
      isCancel={true}
    />
  );
};
