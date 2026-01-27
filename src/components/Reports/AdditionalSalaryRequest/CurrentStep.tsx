import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { Receipt } from '../Shared/CalculationReports/ReceiptStep/Receipt';
import { AboutForm } from './AboutForm/AboutForm';
import { CompleteForm } from './CompleteForm/CompleteForm';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';
import { AdditionalSalaryRequestSection } from './SharedComponents/AdditionalSalaryRequestSection';

export const CurrentStep: React.FC = () => {
  const { currentIndex } = useAdditionalSalaryRequest();
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const pageLink = `/accountLists/${accountListId}/reports/additionalSalaryRequest`;

  const steps = [
    <AboutForm key="about-form" />,
    <CompleteForm key="complete-form" />,
    <AdditionalSalaryRequestSection key="receipt-section">
      <Receipt
        formTitle={t('Additional Salary Request')}
        buttonText={t('View Your Additional Salary Request')}
        viewLink={pageLink}
        isEdit={false}
        buttonLink={''}
      />
    </AdditionalSalaryRequestSection>,
  ];

  return steps[currentIndex] ?? null;
};
