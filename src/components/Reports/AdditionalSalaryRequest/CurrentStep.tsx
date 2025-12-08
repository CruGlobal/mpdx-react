import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { Receipt } from '../Shared/CalculationReports/ReceiptStep/Receipt';
import { AboutForm } from './AboutForm/AboutForm';
import { AdditionalSalaryRequestSectionEnum } from './AdditionalSalaryRequestHelper';
import { CompleteForm } from './CompleteForm/CompleteForm';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';
import { AdditionalSalaryRequestSection } from './SharedComponents/AdditionalSalaryRequestSection';

export const CurrentStep: React.FC = () => {
  const { currentStep } = useAdditionalSalaryRequest();
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const pageLink = `/accountLists/${accountListId}/reports/additionalSalaryRequest`;

  switch (currentStep) {
    case AdditionalSalaryRequestSectionEnum.AboutForm:
      return <AboutForm />;
    case AdditionalSalaryRequestSectionEnum.CompleteForm:
      return <CompleteForm />;
    case AdditionalSalaryRequestSectionEnum.Receipt:
      return (
        <AdditionalSalaryRequestSection>
          <Receipt
            formTitle={t('Additional Salary Request')}
            buttonText={t('View Your Additional Salary Request')}
            viewLink={pageLink}
            isEdit={false}
          />
        </AdditionalSalaryRequestSection>
      );
  }
};
