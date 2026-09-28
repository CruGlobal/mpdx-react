import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getLocalizedTaxStatus } from 'src/components/HrTools/Shared/getLocalizedTaxStatus';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import {
  ManagedStaffMember,
  StaffRow,
  getLocalizedSupportType,
  getQuarterLabel,
  getRowSpouseName,
  grossSalaryWarning,
  pendingField,
} from '../helpers';
import { GrossSalaryMarker } from './GrossSalaryMarker';

interface DetailProps {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}

const Detail: React.FC<DetailProps> = ({ label, value, valueColor }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 140 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="body2"
      color={valueColor}
      component="div"
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
    >
      {value}
    </Typography>
  </Box>
);

interface QuickGlanceProps {
  row: StaffRow;
}

/**
 * The extra details a row shows when expanded, without opening the drawer.
 * A merged couple shares every health figure (both rows come from one staff
 * account), but the HR fields are per person, so those name each spouse.
 */
export const QuickGlance: React.FC<QuickGlanceProps> = ({ row }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();
  const { partner, quarterlyHealth, newStaffMonthlySalary } = row;
  const grossSalary = quarterlyHealth?.monthlyGrossSalary ?? null;
  const grossWarning = grossSalaryWarning(t, formatCurrency, row);
  const departments = [
    ...new Set(
      [...row.teams.employee, ...(partner?.teams.employee ?? [])]
        .map(({ department }) => department)
        .filter((department): department is string => !!department),
    ),
  ];
  const startingQuarter = quarterlyHealth?.startingQuarter;
  const spouseName = getRowSpouseName(row);

  // Per-person HR fields: one value, or one line per spouse for a merged row
  const perPerson = (
    format: (member: ManagedStaffMember) => string | number | null | undefined,
  ): React.ReactNode => {
    const show = (member: ManagedStaffMember) => format(member) ?? pendingField;
    if (!partner) {
      return String(show(row));
    }
    return (
      <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          {row.firstName}: {show(row)}
        </span>
        <span>
          {partner.firstName}: {show(partner)}
        </span>
      </Box>
    );
  };
  const years = ({ tenure }: ManagedStaffMember) =>
    tenure !== null && tenure !== undefined
      ? t('{{count}} years', { count: tenure })
      : null;

  return (
    <Box
      data-testid="quick-glance"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        px: 4,
        py: 1.5,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      <Detail
        label={partner ? t('Person numbers') : t('Person number')}
        value={
          partner
            ? `${row.personNumber} & ${partner.personNumber}`
            : row.personNumber
        }
      />
      <Detail label={t('Staff account')} value={row.staffAccountId} />
      <Detail
        label={t('Department')}
        value={departments.join(', ') || pendingField}
      />
      <Detail
        label={t('Geographic location')}
        value={row.geographicLocation ?? pendingField}
      />
      <Detail
        label={t('New Staff Monthly Salary')}
        value={
          newStaffMonthlySalary !== null && newStaffMonthlySalary !== undefined
            ? formatCurrency(newStaffMonthlySalary)
            : pendingField
        }
      />
      <Detail
        label={t('Monthly Gross Salary')}
        // Same treatment as the drawer: red value plus the warning marker
        valueColor={grossWarning ? 'error.main' : undefined}
        value={
          <>
            {grossSalary !== null ? formatCurrency(grossSalary) : pendingField}
            {grossWarning && <GrossSalaryMarker warning={grossWarning} />}
          </>
        }
      />
      <Detail label={t('Tenure')} value={perPerson(years)} />
      <Detail
        label={t('Healthcare dependents')}
        value={perPerson(
          ({ healthcareDependentsCount }) => healthcareDependentsCount,
        )}
      />
      <Detail
        label={t('Support type')}
        value={perPerson(({ peopleGroupSupportType }) =>
          peopleGroupSupportType
            ? getLocalizedSupportType(t, peopleGroupSupportType)
            : null,
        )}
      />
      <Detail
        label={t('SECA')}
        value={perPerson(({ secaStatus }) =>
          getLocalizedTaxStatus(secaStatus, t),
        )}
      />
      {spouseName && <Detail label={t('Spouse')} value={spouseName} />}
      {startingQuarter && (
        <Detail
          label={t('Payroll started')}
          value={getQuarterLabel(
            startingQuarter.fiscalYear,
            startingQuarter.quarter,
          )}
        />
      )}
    </Box>
  );
};
