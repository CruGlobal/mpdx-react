import React, { useMemo } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Collapse,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { useLocale } from 'src/hooks/useLocale';
import theme from 'src/theme';
import { RowDensityEnum } from '../MpdSupervisorReportContext';
import { formatWholeDollars, householdTypeLabel } from '../balanceHelpers';
import {
  StaffRow,
  getLocalizedAssignmentCategoryGroup,
  getLocalizedUserPersonTypeName,
  getRowInitials,
  getRowName,
  getRowSpouseName,
  getRowTeamNames,
  grossSalaryWarning,
} from '../helpers';
import { GrossSalaryMarker } from './GrossSalaryMarker';
import { MonthEndBalances } from './MonthEndBalances';
import { QuickGlance } from './QuickGlance';

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

const GridBalances = styled(Grid, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact: boolean }>(({ theme, compact }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  // Stacked under the name below md
  [theme.breakpoints.down('md')]: {
    marginTop: theme.spacing(compact ? 0.5 : 1),
  },
}));

// The 200px floor only applies beside the balances; stacked, a long name wraps
const NameColumn = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  [theme.breakpoints.up('md')]: { minWidth: 200 },
}));

interface StaffMemberProps {
  data: StaffRow;
  /** Compact drops the avatar and puts the name and details on one line */
  density?: RowDensityEnum;
  /** Whether the quick-glance strip is open; the chevron only renders with onToggleExpand */
  expanded?: boolean;
  onToggleExpand?: () => void;
  onClick?: () => void;
}

export const StaffMember: React.FC<StaffMemberProps> = ({
  data,
  density = RowDensityEnum.Comfortable,
  expanded = false,
  onToggleExpand,
  onClick,
}) => {
  const { t } = useTranslation();
  const compact = density === RowDensityEnum.Compact;
  const { formatCurrency } = useFormatters();
  const locale = useLocale();
  const { staffAccountId, assignmentCategoryGroup, userPersonType, partner } =
    data;
  const grossWarning = grossSalaryWarning(t, formatCurrency, data);

  const names = getRowName(data);
  const { householdType, balanceBuffer } = data;
  const buffer =
    householdType && typeof balanceBuffer === 'number'
      ? t('{{household}} buffer {{amount}}', {
          household: householdTypeLabel(t, householdType),
          amount: formatWholeDollars(balanceBuffer, locale),
        })
      : null;

  // A member can be on several teams; a merged pair shows both spouses' teams.
  // No team means no segment at all rather than a placeholder.
  const team = useMemo(() => getRowTeamNames(data).join(', '), [data]);
  // A merged row already carries both names; any other spouse is named here
  const spouse = partner ? null : getRowSpouseName(data);

  return (
    <StyledCard compact={compact}>
      <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
        {onToggleExpand && (
          <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
            <IconButton
              size="small"
              onClick={onToggleExpand}
              aria-expanded={expanded}
              aria-label={
                expanded
                  ? t('Hide details for {{name}}', { name: names })
                  : t('Show details for {{name}}', { name: names })
              }
            >
              <ExpandMoreIcon
                fontSize="small"
                sx={{
                  transition: 'transform 150ms',
                  transform: expanded ? 'rotate(180deg)' : 'none',
                }}
              />
            </IconButton>
          </Box>
        )}
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
            flex: 1,
            paddingInline: theme.spacing(onToggleExpand ? 2 : 4),
            paddingRight: theme.spacing(4),
            paddingTop: theme.spacing(compact ? 0.5 : 1),
            paddingBottom: theme.spacing(compact ? 0.5 : 1),
          }}
        >
          <Grid container>
            <GridItem size={{ xs: 12, md: 6 }}>
              {!compact && (
                <Avatar
                  sx={{ bgcolor: 'mpdxGrayLight.main', color: 'text.primary' }}
                >
                  {getRowInitials(data)}
                </Avatar>
              )}
              <NameColumn sx={{ ml: compact ? 0 : 1 }}>
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
                    employmentType={getLocalizedAssignmentCategoryGroup(
                      t,
                      assignmentCategoryGroup,
                    )}
                    userPersonType={
                      userPersonType &&
                      getLocalizedUserPersonTypeName(t, userPersonType)
                    }
                    team={team}
                    spouse={spouse}
                    buffer={buffer}
                    grossWarning={grossWarning}
                    compact={compact}
                  />
                </Box>
              </NameColumn>
            </GridItem>
            <GridBalances size={{ xs: 12, md: 6 }} compact={compact}>
              <MonthEndBalances balances={data.monthEndBalances} />
            </GridBalances>
          </Grid>
        </CardActionArea>
      </Box>
      {onToggleExpand && (
        <Collapse in={expanded} unmountOnExit>
          <QuickGlance row={data} />
        </Collapse>
      )}
    </StyledCard>
  );
};

interface StaffInfoProps {
  names: string;
  staffAccountID: string;
  employmentType: string;
  userPersonType?: string | null;
  team: string;
  /** The spouse's name when they are not merged into this row */
  spouse?: string | null;
  /** The household's balance buffer, when the member is graded against one */
  buffer?: string | null;
  /** Set when Monthly Gross Salary is below New Staff Monthly Salary */
  grossWarning: string | null;
  /** Puts the details on the same line as the name */
  compact?: boolean;
}
const StaffInfoBase: React.FC<StaffInfoProps> = ({
  names,
  staffAccountID,
  employmentType,
  userPersonType,
  team,
  spouse,
  buffer,
  grossWarning,
  compact = false,
}) => {
  const { t } = useTranslation();
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
          {employmentType}
          {userPersonType && ` · ${userPersonType}`}
          {team && ` · ${team}`}
          {spouse && ` · ${t('Spouse: {{name}}', { name: spouse })}`}
          {buffer && ` · ${buffer}`}
        </Typography>
      </Box>
    </Box>
  );
};
const StaffInfo = React.memo(StaffInfoBase);
