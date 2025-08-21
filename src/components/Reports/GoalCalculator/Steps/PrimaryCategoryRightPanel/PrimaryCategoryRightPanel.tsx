import React from 'react';
import { Alert, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';

const MonthlySavingsTable = styled('table')({
  width: '100%',
});

interface PrimaryCategoryRightPanelProps {
  category: PrimaryBudgetCategoryEnum;
}

export const PrimaryCategoryRightPanel: React.FC<
  PrimaryCategoryRightPanelProps
> = ({ category }) => {
  const { t } = useTranslation();

  switch (category) {
    case PrimaryBudgetCategoryEnum.Saving:
      return (
        <>
          <Typography variant="h6" gutterBottom>
            {t('Emergency Savings Guide')}
          </Typography>
          <MonthlySavingsTable>
            <tbody>
              <tr>
                <td>{t('Individuals')}</td>
                <td>$50/{t('month')}</td>
              </tr>
              <tr>
                <td>{t('Couples')}</td>
                <td>$100/{t('month')}</td>
              </tr>
              <tr>
                <td>{t('With kids')}</td>
                <td>$150/{t('month')}</td>
              </tr>
            </tbody>
          </MonthlySavingsTable>
        </>
      );

    case PrimaryBudgetCategoryEnum.Utilities:
      return (
        <>
          <Typography variant="h6" gutterBottom>
            {t('Utilities')}
          </Typography>
          <Alert severity="warning">
            {t(
              'For mobile phone and internet expenses, only include the portion not reimbursed as a ministry expense.',
            )}
          </Alert>
        </>
      );

    case PrimaryBudgetCategoryEnum.Medical:
      return (
        <>
          <Typography variant="h6" gutterBottom>
            {t('Medical Expenses')}
          </Typography>
          <Alert severity="warning">
            {t(
              'Only include medical expenses that are not reimbursable through your staff account.',
            )}
          </Alert>
        </>
      );

    case PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage:
      return (
        <Typography variant="h6" gutterBottom>
          {t('Mileage Expenses')}
        </Typography>
      );

    default:
      return null;
  }
};
