import React from 'react';
import { SubmitModal } from '../../Shared/CalculationReports/SubmitModal/SubmitModal';

interface ConfirmationModalProps {
  handleClose: () => void;
  handleConfirm: () => void;
  deadlineDate?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  handleClose,
  handleConfirm,
  deadlineDate,
}) => {
  return (
    <SubmitModal
      formTitle="Salary Calculation Form"
      handleClose={handleClose}
      handleConfirm={handleConfirm}
      overrideTitle="Are you ready to submit your Salary Calculation Form?"
      deadlineDate={deadlineDate}
    />
  );
};
