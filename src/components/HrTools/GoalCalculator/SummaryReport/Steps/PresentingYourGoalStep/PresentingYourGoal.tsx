import React, { useMemo } from 'react';
import { Box, styled, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PersonalInfoTable } from 'src/components/HrTools/Shared/GoalPresentation/PersonalInfoTable';
import { PresentationSectionCard } from 'src/components/HrTools/Shared/GoalPresentation/PresentationSectionCard';
import { MonthlyNeedsTable } from 'src/components/HrTools/Shared/GoalPresentation/SupportNeedsTable/MonthlyNeedsTable';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { hasStaffSpouse } from '../../../Shared/calculateTotals';

const PrintableContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),

  // Scale down the page to fit on one page
  '@media print': {
    zoom: 0.4,
  },
}));

const ChartContainer = styled(Box)({
  '@media print': {
    width: '100% !important',
    height: '350px !important',
    '.recharts-wrapper': {
      height: '100px !important',
      width: '100% !important',
    },
    '.recharts-surface': {
      height: '350px !important',
      width: '100% !important',
    },
    '.recharts-legend-wrapper': {
      fontSize: '16px !important',
      paddingRight: '20px !important',
      textAlign: 'center !important',
      top: '100px !important',
    },
  },

  '.recharts-legend-item .recharts-surface': {
    width: '16px !important',
    height: '16px !important',
    top: '2px',
  },

  '.recharts-legend-item text': {
    dominantBaseline: 'middle',
  },
});

interface PresentingYourGoalProps {
  supportRaised: number;
}

export const PresentingYourGoal: React.FC<PresentingYourGoalProps> = ({
  supportRaised,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const {
    goalCalculationResult: { data },
    goalTotals,
  } = useGoalCalculator();
  const goalCalculation = data?.goalCalculation;

  const supportNeeds = useMemo(
    () => ({
      salary: goalTotals.netMonthlySalary,
      ministryExpenses: goalTotals.ministryExpensesTotal + goalTotals.attrition,
      benefits: goalTotals.benefitsCharge,
      socialSecurityAndTaxes: goalTotals.taxes,
      voluntaryRetirement:
        goalTotals.traditionalContribution + goalTotals.rothContribution,
      administrativeCharge:
        goalTotals.overallSubtotalWithAdmin - goalTotals.overallSubtotal,
    }),
    [goalTotals],
  );

  const presentationData = useMemo(
    () => [
      { name: 'Salary', value: supportNeeds.salary },
      { name: 'Ministry Expenses', value: supportNeeds.ministryExpenses },
      { name: 'Benefits', value: supportNeeds.benefits },
      {
        name: 'Social Security and Taxes',
        value: supportNeeds.socialSecurityAndTaxes,
      },
      {
        name: 'Voluntary 403b Retirement Plan',
        value: supportNeeds.voluntaryRetirement,
      },
      {
        name: 'Administrative Charge',
        value: supportNeeds.administrativeCharge,
      },
    ],
    [supportNeeds],
  );

  const total = useMemo(
    () => presentationData.reduce((sum, entry) => sum + entry.value, 0),
    [presentationData],
  );

  // Consider adding more brand colors to theme.
  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  return (
    <PrintableContent>
      <PresentationSectionCard title={t('Personal Information')}>
        <PersonalInfoTable
          firstName={goalCalculation?.firstName ?? ''}
          spouseFirstName={
            hasStaffSpouse(goalCalculation?.familySize)
              ? goalCalculation?.spouseFirstName
              : null
          }
          lastName={goalCalculation?.lastName ?? ''}
          ministryLocation={goalCalculation?.ministryLocation ?? undefined}
        />
      </PresentationSectionCard>

      <PresentationSectionCard title={t('Monthly Support Needs')}>
        <MonthlyNeedsTable
          {...supportNeeds}
          married={hasStaffSpouse(goalCalculation?.familySize)}
          supportRaised={supportRaised}
        />
      </PresentationSectionCard>

      <PresentationSectionCard title={t('Monthly Support Breakdown')}>
        <ChartContainer height={500}>
          <ResponsiveContainer width="100%">
            <PieChart>
              <Pie
                data={presentationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 130 : 180}
                cornerRadius={theme.shape.borderRadius}
              >
                {presentationData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  return `${currencyFormat(
                    Number(value),
                    'USD',
                    locale,
                  )} (${percentageFormat(Number(value) / total, locale)})`;
                }}
              />
              <Legend
                layout="vertical"
                align={isMobile ? 'center' : 'right'}
                verticalAlign={isMobile ? 'bottom' : 'middle'}
                wrapperStyle={{
                  fontSize: isMobile
                    ? theme.typography.subtitle1.fontSize
                    : theme.typography.h5.fontSize,
                  maxWidth: isMobile ? 600 : 300,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </PresentationSectionCard>
    </PrintableContent>
  );
};
