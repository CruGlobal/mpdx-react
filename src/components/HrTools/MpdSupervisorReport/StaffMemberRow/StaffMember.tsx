import React, { useMemo } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Chip,
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
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import {
  ManagedStaffMember,
  QuarterChipData,
  buildQuarterChips,
  getInitials,
  getQuarterLabel,
  healthColor,
  healthLabel,
  pendingField,
  quarterAmountLabel,
} from '../helpers';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
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

const QuarterChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'health',
})<{ health: MpdHealthStatusEnum }>(({ health }) => {
  const { bg, color } = healthColor(theme, health);
  return {
    height: 22,
    fontWeight: 600,
    backgroundColor: bg,
    color: color,
    minWidth: '80px',
    '& .MuiChip-label': {
      paddingInline: theme.spacing(1),
    },
  };
});

interface StaffMemberProps {
  data: ManagedStaffMember;
  onClick?: () => void;
}

export const StaffMember: React.FC<StaffMemberProps> = ({ data, onClick }) => {
  const { t } = useTranslation();
  const { firstName: name, lastName, staffAccountId, teams } = data;

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
    <StyledCard>
      <CardActionArea
        aria-label={t('View details for {{name}}', { name: names })}
        onClick={onClick}
        sx={{
          paddingInline: theme.spacing(4),
          paddingTop: theme.spacing(1),
          paddingBottom: theme.spacing(1),
        }}
      >
        <Grid container>
          <GridItem size={6}>
            <Avatar
              sx={{ bgcolor: 'mpdxGrayLight.main', color: 'text.primary' }}
            >
              {getInitials(name, lastName)}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 200, ml: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}
              >
                <StaffInfo
                  names={names}
                  staffAccountID={staffAccountId ?? pendingField}
                  userPersonType={pendingField}
                  team={team}
                />
              </Box>
            </Box>
          </GridItem>
          <GridQuarter size={6}>
            <FiscalYearQuarters
              quarters={quarters}
              hasStaffAccount={!!staffAccountId}
            />
          </GridQuarter>
        </Grid>
      </CardActionArea>
    </StyledCard>
  );
};

interface FiscalYearQuartersProps {
  quarters: QuarterChipData[];
  hasStaffAccount: boolean;
}
const FiscalYearQuartersBase: React.FC<FiscalYearQuartersProps> = ({
  quarters,
  hasStaffAccount,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();

  return (
    <Stack direction="row" spacing={2}>
      {quarters.map(({ fiscalYear, quarter, status, averagePayroll }) => {
        const label = getQuarterLabel(fiscalYear, quarter);
        const amount = quarterAmountLabel({
          t,
          hasStaffAccount,
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
const FiscalYearQuarters = React.memo(FiscalYearQuartersBase);

interface StaffInfoProps {
  names: string;
  staffAccountID: string;
  userPersonType: string;
  team: string;
}
const StaffInfoBase: React.FC<StaffInfoProps> = ({
  names,
  staffAccountID,
  userPersonType,
  team,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6">{names}</Typography>
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
