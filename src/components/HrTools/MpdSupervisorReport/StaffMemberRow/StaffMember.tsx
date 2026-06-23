import React, { useMemo } from 'react';
import {
  Avatar,
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { EmployeeData, QuarterHealthEnum } from '../mockData';

const healthLabel = (t: TFunction, health: QuarterHealthEnum): string => {
  switch (health) {
    case QuarterHealthEnum.Green:
      return t('on track');
    case QuarterHealthEnum.Red:
      return t('at risk');
    case QuarterHealthEnum.Yellow:
    default:
      return t('needs attention');
  }
};

const healthColor = (
  health: QuarterHealthEnum,
): { bg: string; color: string } => {
  switch (health) {
    case QuarterHealthEnum.Green:
      return {
        bg: theme.palette.chipGreenLight.main,
        color: theme.palette.chipGreenDark.main,
      };
    case QuarterHealthEnum.Red:
      return {
        bg: theme.palette.chipRedLight.main,
        color: theme.palette.chipRedDark.main,
      };
    case QuarterHealthEnum.Yellow:
    default:
      return {
        bg: theme.palette.chipYellowLight.main,
        color: theme.palette.chipYellowDark.main,
      };
  }
};

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  boxShadow: theme.shadows[1],
  cursor: 'pointer',
  width: '100%',
}));

const GridItem = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  width: '100%',
}));

const GridQuarter = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  width: '100%',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
}));

const QuarterChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'health',
})<{ health: QuarterHealthEnum }>(({ health }) => {
  const { bg, color } = healthColor(health);
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

const initials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

interface StaffMemberProps {
  data: EmployeeData;
  onClick?: () => void;
}

export const StaffMember: React.FC<StaffMemberProps> = ({ data, onClick }) => {
  const { t } = useTranslation();
  const { user, quarters } = data;
  const {
    preferredName: name,
    lastName,
    staffAccountID,
    userPersonType,
    team,
  } = user;

  const names = useMemo(() => {
    if (!name || !lastName) {
      return '';
    }
    return `${name} ${lastName}`;
  }, [name, lastName]);

  return (
    <StyledCard
      role="button"
      tabIndex={0}
      aria-label={t('View details for {{name}}', { name: names })}
      onClick={onClick}
    >
      <Box
        sx={{
          paddingInline: theme.spacing(4),
          paddingTop: theme.spacing(1),
          paddingBottom: theme.spacing(1),
        }}
      >
        <Grid container>
          <GridItem item xs={6}>
            <Avatar
              sx={{ bgcolor: 'mpdxGrayLight.main', color: 'text.primary' }}
            >
              {initials(`${name ?? ''} ${lastName ?? ''}`)}
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
                  staffAccountID={staffAccountID}
                  userPersonType={userPersonType}
                  team={team}
                />
              </Box>
            </Box>
          </GridItem>
          <GridQuarter item xs={6}>
            <FiscalYearQuarters quarters={quarters} />
          </GridQuarter>
        </Grid>
      </Box>
    </StyledCard>
  );
};

interface FiscalYearQuartersProps {
  quarters: EmployeeData['quarters'];
}
const FiscalYearQuartersBase: React.FC<FiscalYearQuartersProps> = ({
  quarters,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <Stack direction="row" spacing={2} sx={{ mr: 1 }}>
      {quarters.map((quarter) => {
        const amount = currencyFormat(quarter.payroll, 'USD', locale);
        return (
          <QuarterChip
            key={quarter.label}
            label={amount}
            // Health is also conveyed by color; include it in the label for
            // screen-reader users (WCAG 1.4.1 — not color alone).
            aria-label={t('{{label}}: {{amount}} ({{status}})', {
              label: quarter.label,
              amount,
              status: healthLabel(t, quarter.health),
            })}
            health={quarter.health}
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
