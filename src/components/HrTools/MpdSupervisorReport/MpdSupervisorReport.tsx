import React, { useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Badge,
  Box,
  Button,
  Container,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import {
  HeaderTypeEnum,
  NavListButton,
  NavMenuIcon,
  StickyHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { getHeaderTitleAccess } from 'src/components/Shared/MultiPageLayout/helpers';
import { NavFilterIcon } from 'src/components/Shared/styledComponents/NavFilterIcon';
import { useLocale } from 'src/hooks/useLocale';
import theme from 'src/theme';
import { HeaderActions } from './HeaderActions/HeaderActions';
import { AppliedFilters } from './ListStates/AppliedFilters';
import { EmptyStaffState } from './ListStates/EmptyStaffState';
import { FilterRequiredState } from './ListStates/FilterRequiredState';
import { useManagedStaffTeamsQuery } from './ManagedStaffTeams.generated';
import { Panel, useMpdSupervisorReport } from './MpdSupervisorReportContext';
import { HealthColorKey } from './ReportLegend/HealthColorKey';
import { ReportLegendButton } from './ReportLegend/ReportLegendButton';
import { StaffMember } from './StaffMemberRow/StaffMember';
import { TeamSummary } from './TeamSummary/TeamSummary';
import { balanceMonthHeaders } from './balanceHelpers';
import { StaffRow, teamPickerNames } from './helpers';

const PageBox = styled(Box)(() => ({
  height: `calc(100vh - ${navBarHeight})`,
  display: 'flex',
  flexDirection: 'column',
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(2),
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const StickyHeaderInner = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  lineHeight: 1.1,
}));

const TitleBox = styled(Box)(() => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  // On phones the title and legend button wrap as separate header items
  [theme.breakpoints.down('sm')]: {
    display: 'contents',
  },
}));

// IconButton's own flex centering, so the badge-wrapped filter icon sits level
// with the menu icon on phones
const phoneNavButtonSx = {
  [theme.breakpoints.down('sm')]: { display: 'inline-flex' },
};

const MonthsContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  width: '100%',
  paddingInline: theme.spacing(4),
  paddingBottom: theme.spacing(1),
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  // Each row labels its own months below md (MonthEndBalances)
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const MonthHeader = styled(Box)(() => ({
  borderRight: `1px solid ${theme.palette.divider}`,
  '&:first-of-type': {
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
}));

interface MpdSupervisorReportProps {
  panelOpen: Panel | null;
  onNavListToggle: () => void;
  onFilterListToggle: () => void;
  title: string;
}

export const MpdSupervisorReport: React.FC<MpdSupervisorReportProps> = ({
  panelOpen,
  onNavListToggle,
  onFilterListToggle,
  title,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    openMember,
    search,
    setSearch,
    staffMembers,
    totalCount,
    staffLoading,
    staffError,
    filterRequired,
    loadMoreError,
    hasNextPage,
    loadMore,
    refetchStaff,
    activeFilterCount,
    rowDensity,
    loadedCount,
    expandedRows,
    toggleRow,
    department,
  } = useMpdSupervisorReport();
  // Shares TeamSummary's cache entry; says whether it is offering team cards
  const { data: teamsData } = useManagedStaffTeamsQuery();
  const teamPickerShown =
    teamPickerNames(teamsData?.managedStaffTeams, department).length > 0;
  const allPagesLoaded = !hasNextPage || !!loadMoreError;

  // Every row covers the same four months, so the first one labels the header.
  const monthHeaders = useMemo(
    () =>
      allPagesLoaded && staffMembers.length
        ? balanceMonthHeaders(t, staffMembers[0].monthEndBalances, locale)
        : [],
    [allPagesLoaded, staffMembers, t, locale],
  );

  return (
    <PageBox>
      <StickyHeader
        p={2}
        data-testid="MultiPageHeader"
        sx={{
          flexShrink: 0,
          // The fixed height only fits one row, so a wrapped header grows
          // instead of covering the list
          [theme.breakpoints.down('md')]: { height: 'auto' },
        }}
      >
        <StickyHeaderInner>
          <NavListButton
            panelOpen={panelOpen === Panel.Navigation}
            onClick={onNavListToggle}
            sx={phoneNavButtonSx}
          >
            <NavMenuIcon
              titleAccess={getHeaderTitleAccess(HeaderTypeEnum.HrTools, t)}
              data-testid="HrToolsMenuIcon"
            />
          </NavListButton>

          <NavListButton
            panelOpen={panelOpen === Panel.Filters}
            onClick={onFilterListToggle}
            // The badge count would otherwise join the icon's title in the name
            aria-label={getHeaderTitleAccess(HeaderTypeEnum.Filters, t)}
            sx={phoneNavButtonSx}
          >
            {/* Keeps the applied filters countable while the panel is closed */}
            <Badge badgeContent={activeFilterCount} color="primary">
              <NavFilterIcon data-testid="FilterIcon" />
            </Badge>
          </NavListButton>
          <TitleBox>
            <Box
              display={{ xs: 'contents', sm: 'flex' }}
              alignItems="center"
              gap={1.5}
            >
              <Typography
                variant="h5"
                sx={{
                  // Half the row keeps the title beside the menu buttons and
                  // pushes the legend button and density toggle onto the next
                  // row; the h6 size fits the title on one line there
                  [theme.breakpoints.down('sm')]: {
                    flexGrow: 1,
                    flexBasis: '50%',
                    fontSize: theme.typography.h6.fontSize,
                  },
                }}
              >
                {title}
              </Typography>
              <ReportLegendButton />
            </Box>
            {!filterRequired && allPagesLoaded && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                {loadedCount === staffMembers.length
                  ? t(
                      'Showing {{count}} of {{total}} · sorted by lowest balance',
                      {
                        count: loadedCount,
                        total: totalCount,
                      },
                    )
                  : // A couple shares a row, so say how many rows hold the people
                    staffMembers.length === 1
                    ? t(
                        'Showing {{count}} of {{total}} in one row · sorted by lowest balance',
                        { count: loadedCount, total: totalCount },
                      )
                    : t(
                        'Showing {{count}} of {{total}} in {{rows}} rows · sorted by lowest balance',
                        {
                          count: loadedCount,
                          total: totalCount,
                          rows: staffMembers.length,
                        },
                      )}
              </Typography>
            )}
          </TitleBox>
          <HeaderActions />
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            label={t('Search name')}
            size="small"
            sx={{
              minWidth: { xs: '100%', sm: 220 },
              width: { xs: '100%', sm: 'auto' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </StickyHeaderInner>
      </StickyHeader>

      <StyledContainer maxWidth={false}>
        <AppliedFilters />
        <TeamSummary />
        <MonthsContainer data-testid="month-headers">
          {monthHeaders.length > 0 && (
            <HealthColorKey
              sx={{ mr: 'auto', display: { xs: 'none', md: 'flex' } }}
            />
          )}
          {monthHeaders.map(({ label, tooltip }) => (
            <MonthHeader key={label}>
              <Tooltip title={tooltip} arrow describeChild>
                <Typography
                  variant="body2"
                  fontWeight={'bold'}
                  tabIndex={0}
                  sx={{
                    width: '80px',
                    // Signal that the header has a definition on hover
                    textDecoration: 'underline dotted',
                    textDecorationColor: 'text.disabled',
                    textUnderlineOffset: '3px',
                    cursor: 'help',
                  }}
                  textAlign={'center'}
                >
                  {label}
                </Typography>
              </Tooltip>
            </MonthHeader>
          ))}
        </MonthsContainer>

        {/* A page or refresh that failed after rows were shown; the rows stay */}
        {staffMembers.length > 0 && (loadMoreError || staffError) && (
          <Alert
            severity="error"
            sx={{ mb: 1 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={loadMoreError ? loadMore : refetchStaff}
              >
                {t('Retry')}
              </Button>
            }
          >
            {loadMoreError
              ? t('Could not load more staff: {{message}}', {
                  message: loadMoreError.message,
                })
              : t('Could not refresh the staff list: {{message}}', {
                  message: staffError?.message,
                })}
          </Alert>
        )}

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {filterRequired ? (
            <FilterRequiredState
              filterRequired={filterRequired}
              loading={staffLoading}
              teamPickerShown={teamPickerShown}
              // The toggle would close an already-open panel
              onOpenFilters={
                panelOpen === Panel.Filters ? undefined : onFilterListToggle
              }
            />
          ) : staffError && !staffMembers.length ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={refetchStaff}>
                  {t('Retry')}
                </Button>
              }
            >
              {staffError.message}
            </Alert>
          ) : (
            <InfiniteList
              loading={staffLoading || !allPagesLoaded}
              data={allPagesLoaded ? staffMembers : []}
              disableHover
              style={{ height: '100%' }}
              itemContent={(_index, item: StaffRow) => (
                <StaffMember
                  key={item.personNumber}
                  data={item}
                  density={rowDensity}
                  expanded={expandedRows.has(item.personNumber)}
                  onToggleExpand={() => toggleRow(item.personNumber)}
                  onClick={() => openMember(item)}
                />
              )}
              endReached={() => {
                if (hasNextPage) {
                  loadMore();
                }
              }}
              EmptyPlaceholder={<EmptyStaffState />}
            />
          )}
        </Box>
      </StyledContainer>
    </PageBox>
  );
};
