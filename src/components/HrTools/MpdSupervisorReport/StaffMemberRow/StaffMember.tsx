import React, { useMemo } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Grid,
  Stack,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import theme from 'src/theme';
import { RowDensityEnum } from '../MpdSupervisorReportContext';
import {
  ManagedStaffMember,
  QuarterChipData,
  buildQuarterChips,
  getInitials,
  getLocalizedAssignmentCategoryGroup,
  getQuarterLabel,
  grossSalaryWarning,
  healthLabel,
  pendingField,
  quarterAmountLabel,
} from '../helpers';
import { GrossSalaryMarker } from './GrossSalaryMarker';
import { QuarterChip } from './QuarterChip';

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact: boolean }>(({ theme, compact }) => ({
  marginBottom: theme.spacing(compact ? 0.5 : 1),
  boxShadow: theme.shadows[1],
  border: '1px solid',
  borderColor: theme.palette.divider,
  cursor: 'pointer',
  width: '100%',
}));

const GridItem = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const GridQuarter = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
}));

interface StaffMemberProps {
  data: ManagedStaffMember;
  /** Compact drops the avatar and puts the name and details on one line */
  density?: RowDensityEnum;
  onClick?: () => void;
}

export const StaffMember: React.FC<StaffMemberProps> = ({
  data,
  density = RowDensityEnum.Comfortable,
  onClick,
}) => {
  const { t } = useTranslation();
  const compact = density === RowDensityEnum.Compact;
  const { formatCurrency } = useFormatters();
  const {
    firstName: name,
    lastName,
    staffAccountId,
    teams,
    assignmentCategoryGroup,
  } = data;
  const grossWarning = grossSalaryWarning(t, formatCurrency, data);

  const names = useMemo(() => {
    if (!name || !lastName) {
      return '';
    }
    return `${name} ${lastName}`;
  }, [name, lastName]);

  const quarters = useMemo(
    () => buildQuarterChips(data.quarterlyHealth),
    [data.quarterlyHealth],
  );

  // A member can be on several teams; the API has no employment type at all.
  const team = useMemo(
    () => teams.employee.map(({ name }) => name).join(', ') || pendingField,
    [teams],
  );

  return (
    <StyledCard compact={compact}>
      <CardActionArea
        // The marker inside is not focusable, so the row's own name carries
        // the gross salary warning for keyboard and screen-reader users.
        aria-label={
          grossWarning
            ? t('View details for {{name}}. {{warning}}', {
                name: names,
                warning: grossWarning,
              })
            : t('View details for {{name}}', { name: names })
        }
        onClick={onClick}
        sx={{
          paddingInline: theme.spacing(4),
          paddingTop: theme.spacing(compact ? 0.5 : 1),
          paddingBottom: theme.spacing(compact ? 0.5 : 1),
        }}
      >
        <Grid container>
          <GridItem size={6}>
            {!compact && (
              <Avatar
                sx={{ bgcolor: 'mpdxGrayLight.main', color: 'text.primary' }}
              >
                {getInitials(name, lastName)}
              </Avatar>
            )}
            <Box sx={{ flexGrow: 1, minWidth: 200, ml: compact ? 0 : 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}
              >
                <StaffInfo
                  names={names}
                  staffAccountID={staffAccountId}
                  userPersonType={getLocalizedAssignmentCategoryGroup(
                    t,
                    assignmentCategoryGroup,
                  )}
                  team={team}
                  grossWarning={grossWarning}
                  compact={compact}
                />
              </Box>
            </Box>
          </GridItem>
          <GridQuarter size={6}>
            <FiscalYearQuarters quarters={quarters} />
          </GridQuarter>
        </Grid>
      </CardActionArea>
    </StyledCard>
  );
};

interface FiscalYearQuartersProps {
  quarters: QuarterChipData[];
}
const FiscalYearQuartersBase: React.FC<FiscalYearQuartersProps> = ({
  quarters,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();

  return (
    <Stack direction="row" spacing={2}>
      {quarters.map(({ fiscalYear, quarter, status, averagePayroll }) => {
        const label = getQuarterLabel(fiscalYear, quarter);
        const amount = quarterAmountLabel({
          t,
          status,
          averagePayroll,
          formatCurrency,
        });

        return (
          <QuarterChip
            key={label}
            // Health is also conveyed by color, so name it for screen-reader
            // users (WCAG 1.4.1 — not color alone).
            label={
              <>
                <Box component="span" sx={visuallyHidden as SxProps<Theme>}>
                  {t('{{label}}, {{status}}', {
                    label,
                    status: healthLabel(t, status),
                  })}
                </Box>
                {amount}
              </>
            }
            health={status}
            size="small"
          />
        );
      })}
    </Stack>
  );
};
/** The four quarter chips; also shown in the drawer header, which covers the row. */
export const FiscalYearQuarters = React.memo(FiscalYearQuartersBase);

interface StaffInfoProps {
  names: string;
  staffAccountID: string;
  userPersonType: string;
  team: string;
  /** Set when Monthly Gross Salary is below New Staff Monthly Salary */
  grossWarning: string | null;
  /** Puts the details on the same line as the name */
  compact?: boolean;
}
const StaffInfoBase: React.FC<StaffInfoProps> = ({
  names,
  staffAccountID,
  userPersonType,
  team,
  grossWarning,
  compact = false,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: compact ? 'row' : 'column',
          alignItems: compact ? 'baseline' : 'stretch',
          flexWrap: 'wrap',
          columnGap: compact ? 1.5 : 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant={compact ? 'body1' : 'h6'}
            fontWeight={compact ? 600 : undefined}
          >
            {names}
          </Typography>
          {grossWarning && (
            <GrossSalaryMarker warning={grossWarning} focusable={false} />
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
          data-testid="person-numbers"
        >
          {staffAccountID}
          {' · '}
          {userPersonType}
          {' · '}
          {team}
        </Typography>
      </Box>
    </Box>
  );
};
const StaffInfo = React.memo(StaffInfoBase);
