import React from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { Receipt } from '../../Shared/CalculationReports/ReceiptStep/Receipt';
import { PageEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { AboutForm } from '../AboutForm/AboutForm';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { useSalaryCalculations } from '../Shared/useSalaryCalculations';
import { AdditionalSalaryRequestSection } from './AdditionalSalaryRequestSection';
import { EditAlertText, ExceedsCapAlertText } from './ReceiptAlertText';

//TODO: Update date in alert text
//TODO: Check if button link is what we want
interface StepListProps {
  FormComponent: React.ComponentType;
}

export const StepList: React.FC<StepListProps> = ({ FormComponent }) => {
  const { currentIndex, pageType, spouse, isSpouse } =
    useAdditionalSalaryRequest();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const isEdit = pageType === PageEnum.Edit;

  const { values } = useFormikContext<CompleteFormValues>();
  const { exceedsCap } = useSalaryCalculations({
    values,
  });

  const alertText = exceedsCap ? (
    <ExceedsCapAlertText />
  ) : isEdit ? (
    <EditAlertText />
  ) : (
    t(
      'Your request has been sent to payroll and you will receive your additional salary separately from your regular paycheck by 9/25/2025.',
    )
  );

  const pageLink = `/accountLists/${accountListId}/reports/additionalSalaryRequest`;
  const spouseLink = `${pageLink}${isSpouse ? '' : '?isSpouse=true'}`;
  const showSpouseLink = !!spouse;

  const name = spouse?.staffInfo?.firstName ?? '';
  const spouseLinkText = isSpouse
    ? t('Switch back to {{name}}', { name })
    : t('Request additional salary for {{name}}', { name });

  const steps = [
    <AboutForm key="about-form" />,
    <FormComponent key="complete-form" />,
    <AdditionalSalaryRequestSection key="receipt-section">
      <Receipt
        formTitle={t('Additional Salary Request')}
        buttonText={t('Back to Dashboard')}
        buttonLink={`/accountLists/${accountListId}`}
        viewLink={pageLink}
        isEdit={isEdit}
        alertText={alertText}
        linkOne={showSpouseLink ? spouseLink : undefined}
        linkOneText={showSpouseLink ? spouseLinkText : undefined}
      />
    </AdditionalSalaryRequestSection>,
  ];

  return steps[currentIndex] ?? null;
};
