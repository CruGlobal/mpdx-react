import React, { useMemo } from 'react';
import { Box, Grid, styled, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  PersonalInfoRow,
  PersonalInfoTable,
} from 'src/components/HrTools/Shared/GoalPresentation/PersonalInfoTable';
import { PresentationSectionCard } from 'src/components/HrTools/Shared/GoalPresentation/PresentationSectionCard';
import {
  SupportNeedsRow,
  SupportNeedsTable,
} from 'src/components/HrTools/Shared/GoalPresentation/SupportNeedsTable';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { hasStaffSpouse } from '../../../Shared/calculateTotals';

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

  const presentationData = useMemo(
    () => [
      { name: 'Salary', value: goalTotals.netMonthlySalary },
      {
        name: 'Ministry Expenses',
        value: goalTotals.ministryExpensesTotal + goalTotals.attrition,
      },
      { name: 'Benefits', value: goalTotals.benefitsCharge },
      { name: 'Social Security and Taxes', value: goalTotals.taxes },
      {
        name: 'Voluntary 403b Retirement Plan',
        value: goalTotals.traditionalContribution + goalTotals.rothContribution,
      },
      {
        name: 'Administrative Charge',
        value: goalTotals.overallSubtotalWithAdmin - goalTotals.overallSubtotal,
      },
    ],
    [goalTotals],
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

  const personalInfoRows: PersonalInfoRow[] = useMemo(() => {
    const firstName = goalCalculation?.firstName ?? '';
    const spouseFirstName = hasStaffSpouse(goalCalculation?.familySize)
      ? goalCalculation?.spouseFirstName
      : null;
    const lastName = goalCalculation?.lastName ?? '';
    const fullName = spouseFirstName
      ? `${firstName} ${t('and')} ${spouseFirstName ?? ''} ${lastName}`
      : `${firstName} ${lastName}`;

    return [
      { label: t('Name'), value: fullName },
      {
        label: t('Mission Agency'),
        value: t('Campus Crusade for Christ, Inc.'),
      },
      {
        label: t('Ministry Team / Location'),
        value: goalCalculation?.ministryLocation ?? undefined,
      },
    ];
  }, [goalCalculation, t]);

  const rows: SupportNeedsRow[] = useMemo(
    () => [
      {
        title: hasStaffSpouse(goalCalculation?.familySize)
          ? t('Salary (Combined)')
          : t('Salary'),
        description: t(
          'Salaries are based upon marital status, number of children, tenure with Cru, and adjustments for certain geographic locations.',
        ),
        amount: presentationData[0].value,
      },
      {
        title: t('Ministry Expenses'),
        description: t(
          'Training, conferences, supplies, evangelism & discipleship materials, communication with ministry partners, ministry travel expenses, etc.',
        ),
        amount: presentationData[1].value,
      },
      {
        title: t('Benefits'),
        description: t(
          "Includes group medical and dental coverage, life insurance, disability insurance, worker's compensation, and employer contribution to a 403(b) retirement plan.",
        ),
        amount: presentationData[2].value,
      },
      {
        title: t('Social Security and Taxes'),
        description: t(
          'Since Campus Crusade is a non-profit organization, staff members are responsible for paying the entire amount of Social Security.',
        ),
        amount: presentationData[3].value,
      },
      {
        title: t('Voluntary 403b Retirement Plan'),
        description: t(
          'Staff members are eligible to contribute to a voluntary retirement program each month.',
        ),
        amount: presentationData[4].value,
      },
      {
        title: t('Administrative Charge'),
        amount: presentationData[5].value,
      },
      { title: t('Total Support Goal'), amount: total, bold: true },
      { title: t('Total Solid Support'), amount: supportRaised },
    ],
    [presentationData, total, supportRaised, t, goalTotals],
  );

  return (
    <Grid container spacing={theme.spacing(6)}>
      <Grid item xs={12}>
        <PresentationSectionCard title={t('Personal Information')}>
          <PersonalInfoTable rows={personalInfoRows} />
        </PresentationSectionCard>

        <PresentationSectionCard title={t('Monthly Support Needs')}>
          <SupportNeedsTable rows={rows} />
        </PresentationSectionCard>

        <PresentationSectionCard
          title={t('Monthly Support Breakdown')}
          sx={{
            '@media print': {
              pageBreakInside: 'avoid',
            },
          }}
        >
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
      </Grid>
    </Grid>
  );
};
