import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import {
  MpdSupervisorReportQuickFilterEnum,
  quickFilterDescription,
  quickFilterLabel,
} from '../Filters/mpdSupervisorReportFilters';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
import { QuarterChip } from '../StaffMemberRow/QuarterChip';
import { YearMonth, getQuarterMonthRange } from '../helpers';
import {
  healthStatusLabel,
  healthStatusOrder,
  newStaffSalaryCopy,
} from './legendCopy';

// Same shell as the goal calculators' right "Details" panel
const PanelHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 1, 1, 2),
  borderBottom: `1px solid ${theme.palette.mpdxGrayLight.main}`,
}));

const PanelContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowY: 'auto',
}));

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <>
    <Divider sx={{ my: 2 }} />
    <Typography variant="subtitle1" component="h3" fontWeight={600} mb={1}>
      {title}
    </Typography>
    {children}
  </>
);

interface TermProps {
  term: string;
  children: React.ReactNode;
}

const Term: React.FC<TermProps> = ({ term, children }) => (
  <>
    <Typography variant="body2" component="dt" fontWeight="bold">
      {term}
    </Typography>
    <Typography variant="body2" component="dd" sx={{ ml: 0, mb: 1 }}>
      {children}
    </Typography>
  </>
);

// Illustrative amounts for the sample chips, one per status
const sampleAmounts: Record<MpdHealthStatusEnum, number | null> = {
  [MpdHealthStatusEnum.Green]: 4250,
  [MpdHealthStatusEnum.Yellow]: 3100,
  [MpdHealthStatusEnum.Red]: 1900,
  [MpdHealthStatusEnum.Gray]: null,
};

/** The "How this report works" legend, shown in the report's right panel. */
export const ReportLegendPanel: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();
  const locale = useLocale();
  const { closeLegend } = useMpdSupervisorReport();

  const colorExplanations: Record<MpdHealthStatusEnum, string> = {
    [MpdHealthStatusEnum.Green]: t(
      'Payroll was at or above their Monthly Gross Salary (within $5).',
    ),
    [MpdHealthStatusEnum.Yellow]: t(
      'Payroll was below their Monthly Gross Salary but at or above their New Staff Monthly Salary.',
    ),
    [MpdHealthStatusEnum.Red]: t('Payroll was below both benchmarks.'),
    [MpdHealthStatusEnum.Gray]: t(
      "The quarter can't be graded: a benchmark is missing, or the quarter is before or includes their first payroll (shown as Partial).",
    ),
  };

  // Derived from the same helper as the column-header tooltips, so the legend
  // and the headers can't disagree about the fiscal calendar. The year only
  // picks month names, so any year will do.
  const monthName = ({ year, month }: YearMonth) =>
    new Intl.DateTimeFormat(locale, { month: 'long' }).format(
      new Date(year, month - 1, 1),
    );
  const fiscalQuarters = [1, 2, 3, 4].map((quarter) => {
    const { start, end } = getQuarterMonthRange(2026, quarter);
    return {
      quarter,
      months: t('{{startMonth}} – {{endMonth}}', {
        startMonth: monthName(start),
        endMonth: monthName(end),
      }),
    };
  });

  const filters = [
    MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
    MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative,
  ];

  const newStaff = newStaffSalaryCopy(t);

  return (
    <Box
      component="section"
      aria-labelledby="report-legend-title"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <PanelHeader>
        <Typography variant="h6" id="report-legend-title">
          {t('How this report works')}
        </Typography>
        <IconButton
          size="small"
          onClick={closeLegend}
          aria-label={t('Close Panel')}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </PanelHeader>
      <PanelContent>
        <Typography variant="body2" color="text.secondary">
          {t(
            "Each chip is a staff member's average monthly payroll for a fiscal quarter, graded against two benchmarks: their Monthly Gross Salary and their New Staff Monthly Salary.",
          )}
        </Typography>

        <Section title={t('Colors')}>
          {healthStatusOrder.map((status) => {
            const amount = sampleAmounts[status];
            return (
              <Box
                key={status}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  mb: 1,
                }}
              >
                <QuarterChip
                  aria-hidden
                  health={status}
                  size="small"
                  label={amount === null ? '-' : formatCurrency(amount)}
                  sx={{ flexShrink: 0 }}
                />
                <Typography variant="body2">
                  <Box component="strong">{healthStatusLabel(t, status)}</Box>
                  {': '}
                  {colorExplanations[status]}
                </Typography>
              </Box>
            );
          })}
          <Typography variant="body2" color="text.secondary">
            {t(
              'A staff member whose Monthly Gross Salary is below their New Staff Monthly Salary can show green quarters yet still have negative months. Their Monthly Gross Salary is marked red in their details.',
            )}
          </Typography>
        </Section>

        <Section title={t('Numbers')}>
          <Box component="dl" sx={{ m: 0 }}>
            <Term term={t('Quarter amount')}>
              {t(
                "Average monthly payroll across the quarter's three months. A month with no payroll counts as $0.",
              )}
            </Term>
            <Term term={t('Partial')}>
              {t(
                'The quarter in which payroll started. Open the staff member to see each of its months graded on its own.',
              )}
            </Term>
            <Term term={t('- (dash)')}>
              {t("No payroll in a quarter that can't be graded.")}
            </Term>
            <Term term={t('Geographic location')}>
              {t(
                "Sets the cost-of-living multiplier in the New Staff Monthly Salary. It is stored on the staff member's own MPDX account list, so it can only be set for staff who have one; until then the report shows no location.",
              )}
            </Term>
            <Term term={t('Monthly Gross Salary')}>
              {t(
                "The staff member's annual gross salary plus their spouse's (from HR records), divided by 12.",
              )}
            </Term>
            <Term term={t('Sort order')}>
              {t(
                'Staff with the highest share of red quarters come first, then the highest share of yellow, then those furthest below their benchmarks. Staff with no data are listed last, sorted alphabetically by last name.',
              )}
            </Term>
          </Box>
        </Section>

        <Section title={t('Filters')}>
          <Box component="dl" sx={{ m: 0 }}>
            {filters.map((filterId) => (
              <Term key={filterId} term={quickFilterLabel(t, filterId)}>
                {quickFilterDescription(t, filterId)}
              </Term>
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t('The current month is never counted.')}
          </Typography>
        </Section>

        <Section title={t('New Staff Monthly Salary (the goal)')}>
          <Typography variant="body2">{newStaff.body}</Typography>
          <Box component="ol" sx={{ my: 1, pl: 3 }}>
            {newStaff.steps.map((step) => (
              <Typography key={step} variant="body2" component="li">
                {step}
              </Typography>
            ))}
          </Box>
          <Typography variant="body2">{newStaff.footer}</Typography>
        </Section>

        <Section title={t('Fiscal quarters')}>
          <Typography variant="body2">
            {t(
              "Cru's fiscal year runs September – August and is named for the calendar year in which it ends, so FQ1 26 is September–November 2025.",
            )}
          </Typography>
          <Table size="small" sx={{ my: 1, width: 'auto' }}>
            <TableBody>
              {fiscalQuarters.map(({ quarter, months }) => (
                <TableRow key={quarter}>
                  <TableCell sx={{ fontWeight: 'bold', pl: 0 }}>
                    {t('FQ{{quarter}}', { quarter })}
                  </TableCell>
                  <TableCell>{months}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="body2">
            {t(
              'The report shows the last four completed quarters, newest first; the current quarter appears once it ends.',
            )}
          </Typography>
        </Section>
      </PanelContent>
    </Box>
  );
};
