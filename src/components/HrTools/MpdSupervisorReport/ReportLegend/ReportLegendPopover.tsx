import React, { useId, useState } from 'react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { Box, IconButton, Popover, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import { healthColor } from '../helpers';
import { newStaffSalaryCopy } from './legendCopy';

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Typography variant="subtitle2" component="h3" sx={{ mt: 2, mb: 0.5 }}>
    {children}
  </Typography>
);

export const ReportLegendPopover: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const titleId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const colors = [
    {
      status: MpdHealthStatusEnum.Green,
      label: t('On track'),
      explanation: t(
        'Average monthly payroll was at or above their Monthly Gross Salary (a $5 grace amount is allowed).',
      ),
    },
    {
      status: MpdHealthStatusEnum.Yellow,
      label: t('Needs attention'),
      explanation: t(
        'Average monthly payroll was below their Monthly Gross Salary but at or above their New Staff Monthly Salary.',
      ),
    },
    {
      status: MpdHealthStatusEnum.Red,
      label: t('At risk'),
      explanation: t(
        'Average monthly payroll was below both their Monthly Gross Salary and their New Staff Monthly Salary.',
      ),
    },
    {
      status: MpdHealthStatusEnum.Gray,
      label: t('No data'),
      explanation: t(
        "The quarter can't be graded: one of the benchmarks is missing, or part of the quarter is before their first payroll. The quarter in which payroll started is also shown in gray as Partial.",
      ),
    },
  ];

  const numbers = [
    {
      term: t('Quarter amount'),
      definition: t(
        'The average monthly payroll for the three months in the quarter. A month with no payroll counts as $0.',
      ),
    },
    {
      term: t('Partial'),
      definition: t(
        'The quarter in which payroll started. Open the staff member to see each month in that quarter graded separately.',
      ),
    },
    {
      term: '-',
      definition: t("No payroll was paid in a quarter that can't be graded."),
    },
    {
      term: t('Monthly Gross Salary'),
      definition: t(
        "The staff member's annual gross salary plus their spouse's annual gross salary (from HR records), divided by 12.",
      ),
    },
    {
      term: t('Negative month'),
      definition: t(
        'A complete month in which payroll was below the New Staff Monthly Salary. The current month is not counted.',
      ),
    },
    {
      term: t('Sort order'),
      definition: t(
        'Staff are listed with the highest share of red quarters first, then the highest share of yellow quarters, then by how far payroll is from the benchmarks. Staff with no data are listed last.',
      ),
    },
  ];

  const newStaff = newStaffSalaryCopy(t);

  return (
    <>
      <IconButton
        size="small"
        aria-label={t('How this report works')}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <InfoOutlined fontSize="small" />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        aria-labelledby={titleId}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              maxWidth: 'min(480px, calc(100vw - 32px))',
              maxHeight: '70vh',
              overflowY: 'auto',
            },
          },
        }}
      >
        <Typography variant="h6" id={titleId}>
          {t('How this report works')}
        </Typography>

        <SectionHeading>{t('Colors')}</SectionHeading>
        <Typography variant="body2">
          {t(
            "Each quarter is graded by comparing the staff member's average monthly payroll for that quarter with two benchmarks: their Monthly Gross Salary and their New Staff Monthly Salary.",
          )}
        </Typography>
        {colors.map(({ status, label, explanation }) => {
          const { bg, color } = healthColor(theme, status);
          return (
            <Box
              key={status}
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}
            >
              <Box
                aria-hidden
                sx={{
                  flexShrink: 0,
                  width: 12,
                  height: 12,
                  mt: 0.5,
                  borderRadius: 0.5,
                  bgcolor: bg,
                  border: `1px solid ${color}`,
                }}
              />
              <Typography variant="body2">
                <Box component="strong">{label}</Box>
                {': '}
                {explanation}
              </Typography>
            </Box>
          );
        })}
        <Typography variant="body2" sx={{ mt: 1 }}>
          {t(
            "Green is checked first. If a staff member's Monthly Gross Salary is below their New Staff Monthly Salary, a quarter paid at their Monthly Gross Salary can be green even though its months are counted as negative months.",
          )}
        </Typography>

        <SectionHeading>{t('Numbers')}</SectionHeading>
        <Box component="dl" sx={{ m: 0 }}>
          {numbers.map(({ term, definition }) => (
            <React.Fragment key={term}>
              <Typography variant="body2" component="dt" fontWeight="bold">
                {term}
              </Typography>
              <Typography variant="body2" component="dd" sx={{ ml: 0, mb: 1 }}>
                {definition}
              </Typography>
            </React.Fragment>
          ))}
        </Box>

        <SectionHeading>{t('New Staff goal')}</SectionHeading>
        <Typography variant="body2" fontWeight="bold">
          {newStaff.title}
        </Typography>
        <Typography variant="body2">{newStaff.body}</Typography>
        <Box component="ol" sx={{ my: 1, pl: 3 }}>
          {newStaff.steps.map((step) => (
            <Typography key={step} variant="body2" component="li">
              {step}
            </Typography>
          ))}
        </Box>
        <Typography variant="body2">{newStaff.footer}</Typography>

        <SectionHeading>{t('Fiscal quarters')}</SectionHeading>
        <Typography variant="body2">
          {t(
            "Cru's fiscal year runs from September to August and is named for the calendar year in which it ends. FQ1 is September–November, FQ2 is December–February, FQ3 is March–May and FQ4 is June–August. For example, FQ1 26 is September–November 2025. The report shows the last four completed quarters; the current quarter appears once it ends.",
          )}
        </Typography>
      </Popover>
    </>
  );
};
