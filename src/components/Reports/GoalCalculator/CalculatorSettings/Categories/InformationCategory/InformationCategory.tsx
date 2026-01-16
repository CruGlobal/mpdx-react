import React, { useMemo, useState } from 'react';
import RightArrowIcon from '@mui/icons-material/ArrowForward';
import { Avatar, Box, Button, Card, Typography } from '@mui/material';
import { styled } from '@mui/system';
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
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { hasStaffSpouse } from '../../../Shared/calculateTotals';
import { InformationCategoryFinancialForm } from './InformationCategoryForm/InformationCategoryFinancialForm';
import { InformationCategoryPersonalForm } from './InformationCategoryForm/InformationCategoryPersonalForm';

const StyledCard = styled(Card)({
  width: '100%',
});

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

  return (
    <StyledCard>
      <Box
        display="flex"
        gap={2}
        m={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <Avatar
            data-testid="info-avatar"
            src={viewingSpouse ? undefined : userData?.user.avatar}
            alt={(viewingSpouse ? spouseFirstName : firstName) ?? t('User')}
            variant="rounded"
            sx={{ width: 36, height: 36, marginRight: 1 }}
          />
          <Typography data-testid="info-name-typography" sx={{ fontSize: 18 }}>
            {(viewingSpouse ? spouseFirstName : firstName) ?? t('User')}
          </Typography>
        </Box>
        {hasSpouse && (
          <Button
            endIcon={<RightArrowIcon />}
            onClick={onClickSpouseInformation}
            sx={{ fontWeight: 'bold', fontSize: '15px' }}
          >
            {viewingSpouse
              ? t('View {{name}}', {
                  name: firstName ?? t('Your Information'),
                })
              : t('View {{name}}', {
                  name: spouseFirstName ?? t('Spouse Information'),
                })}
          </Button>
        )}
      </Box>

      {!viewingSpouse && (
        <StyledCard>
          <Box sx={{ p: 3 }} data-testid="user-information-form">
            <InformationCategoryPersonalForm schema={validationSchema} />
            <Box sx={{ mt: 3 }}>
              <InformationCategoryFinancialForm schema={validationSchema} />
            </Box>
          </Box>
        </StyledCard>
      )}

      {viewingSpouse && (
        <StyledCard>
          <Box sx={{ p: 3 }} data-testid="spouse-information-form">
            <InformationCategoryPersonalForm
              schema={validationSchema}
              isSpouse
            />
            <Box sx={{ mt: 3 }}>
              <InformationCategoryFinancialForm
                schema={validationSchema}
                isSpouse
              />
            </Box>
          </Box>
        </StyledCard>
      )}
    </StyledCard>
  );
};
