import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
} from 'src/graphql/types.generated';
import { amount, integer, percentage } from 'src/lib/yupHelpers';
import { StaffInfoCard } from '../../../../Shared/StaffInfoCard/StaffInfoCard';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { hasStaffSpouse } from '../../../Shared/calculateTotals';
import { InformationCategoryFinancialForm } from './InformationCategoryForm/InformationCategoryFinancialForm';
import { InformationCategoryPersonalForm } from './InformationCategoryForm/InformationCategoryPersonalForm';

export const InformationCategory: React.FC = () => {
  const { t } = useTranslation();
  const { data: userData } = useGetUserQuery();
  const {
    goalCalculationResult: { data },
  } = useGoalCalculator();

  const validationSchema = useMemo(
    () =>
      yup.object({
        // Personal validation
        firstName: yup.string(),
        spouseFirstName: yup.string(),
        lastName: yup.string(),
        geographicLocation: yup.string(),
        role: yup
          .string()
          .oneOf(
            Object.values(GoalCalculationRole),
            t('Role must be one of the options'),
          ),
        ministryLocation: yup.string(),
        familySize: yup
          .string()
          .oneOf(
            Object.values(MpdGoalBenefitsConstantSizeEnum),
            t('Family Size must be one of the options'),
          ),
        benefitsPlan: yup
          .string()
          .oneOf(
            Object.values(MpdGoalBenefitsConstantPlanEnum),
            t('Benefits Plan must be one of the options'),
          ),
        yearsOnStaff: integer(t('Years on Staff'), t),
        spouseYearsOnStaff: integer(t('Spouse Years on Staff'), t),
        age: yup
          .string()
          .oneOf(
            Object.values(GoalCalculationAge),
            t('Age must be one of the options'),
          ),
        spouseAge: yup
          .string()
          .oneOf(
            Object.values(GoalCalculationAge),
            t('Spouse Age must be one of the options'),
          ),
        childrenNamesAges: yup.string(),

        // Financial validation
        netPaycheckAmount: amount(t('Net Paycheck Amount'), t),
        spouseNetPaycheckAmount: amount(t('Spouse Net Paycheck Amount'), t),
        taxesPercentage: percentage(t('Taxes'), t),
        spouseTaxesPercentage: percentage(t('Spouse Taxes'), t),
        secaExempt: yup.boolean(),
        spouseSecaExempt: yup.boolean(),
        rothContributionPercentage: percentage(
          t('Roth 403(b) Contributions'),
          t,
        ),
        spouseRothContributionPercentage: percentage(
          t('Spouse Roth 403(b) Contributions'),
          t,
        ),
        traditionalContributionPercentage: percentage(
          t('Traditional 403(b) Contributions'),
          t,
        ),
        spouseTraditionalContributionPercentage: percentage(
          t('Spouse Traditional 403(b) Contributions'),
          t,
        ),
        mhaAmount: amount(t('MHA Amount Per Paycheck'), t),
        spouseMhaAmount: amount(t('Spouse MHA Amount Per Paycheck'), t),
      }),
    [t],
  );

  const hasSpouse = hasStaffSpouse(data?.goalCalculation.familySize);
  const firstName = data?.goalCalculation.firstName;
  const spouseFirstName = data?.goalCalculation.spouseFirstName;
  const [viewingSpouse, setViewingSpouse] = useState(false);

  const onClickSpouseInformation = () => {
    setViewingSpouse(!viewingSpouse);
  };

  const toggleName = viewingSpouse
    ? (firstName ?? t('Your Information'))
    : (spouseFirstName ?? t('Spouse Information'));

  return (
    <StaffInfoCard
      person={{
        name: (viewingSpouse ? spouseFirstName : firstName) ?? t('User'),
        avatarSrc: viewingSpouse ? undefined : userData?.user.avatar,
      }}
      toggle={
        hasSpouse
          ? { name: toggleName, onClick: onClickSpouseInformation }
          : undefined
      }
    >
      <Box
        data-testid={
          viewingSpouse ? 'spouse-information-form' : 'user-information-form'
        }
      >
        <InformationCategoryPersonalForm
          schema={validationSchema}
          isSpouse={viewingSpouse}
        />
        <Box sx={{ mt: 3 }}>
          <InformationCategoryFinancialForm
            schema={validationSchema}
            isSpouse={viewingSpouse}
          />
        </Box>
      </Box>
    </StaffInfoCard>
  );
};
