import React, { useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Container,
  InputAdornment,
  TextField,
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
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { getHeaderTitleAccess } from 'src/components/Shared/MultiPageLayout/helpers';
import { NavFilterIcon } from 'src/components/Shared/styledComponents/NavFilterIcon';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import theme from 'src/theme';
import {
  ALL_TEAMS,
  MpdSupervisorReportQuickFilterEnum,
} from './Filters/mpdSupervisorReportFilters';
import { useManagedStaffQuery } from './ManagedStaff.generated';
import { Panel, useMpdSupervisorReport } from './MpdSupervisorReportContext';
import { StaffMember } from './StaffMemberRow/StaffMember';
import {
  ManagedStaffMember,
  buildQuarterChips,
  getQuarterLabel,
} from './helpers';

const searchDebounceMs = 500;
const pageSize = 25;

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(2),
  height: `calc(100vh - ${navBarHeight} - ${multiPageHeaderHeight})`,
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
}));

const QuartersContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  width: '100%',
  paddingInline: theme.spacing(4),
  paddingBottom: theme.spacing(1),
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const Quarter = styled(Box)(() => ({
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
  const { openMember, search, setSearch, team, activeQuickFilter } =
    useMpdSupervisorReport();

  const debouncedSearch = useDebouncedValue(search, searchDebounceMs);

  // TODO(MPDX-9987): Add employment type filter once the API supports it
  const { data, loading, error, fetchMore } = useManagedStaffQuery({
    variables: {
      first: pageSize,
      name: debouncedSearch.trim() || null,
      teamIds: team === ALL_TEAMS ? null : [team],
      // Send the flag only when its chip is active; false would filter on it.
      negativeLastMonth:
        activeQuickFilter ===
          MpdSupervisorReportQuickFilterEnum.NegativeLastMonth || null,
      negativeThreeMonths:
        activeQuickFilter ===
          MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative || null,
    },
  });

  const staffMembers = data?.managedStaff.nodes ?? [];
  const totalCount = data?.managedStaff.totalCount ?? 0;
  const pageInfo = data?.managedStaff.pageInfo;

  // Every row covers the same four quarters, so the first one labels the header.
  const quarterLabels = useMemo(
    () =>
      staffMembers.length
        ? buildQuarterChips(staffMembers[0].quarterlyHealth).map(
            ({ fiscalYear, quarter }) => getQuarterLabel(fiscalYear, quarter),
          )
        : [],
    [staffMembers],
  );

  return (
    <>
      <StickyHeader p={2} data-testid="MultiPageHeader">
        <StickyHeaderInner>
          <NavListButton
            panelOpen={panelOpen === Panel.Navigation}
            onClick={onNavListToggle}
          >
            <NavMenuIcon
              titleAccess={getHeaderTitleAccess(HeaderTypeEnum.HrTools, t)}
              data-testid="HrToolsMenuIcon"
            />
          </NavListButton>

          <NavListButton
            panelOpen={panelOpen === Panel.Filters}
            onClick={onFilterListToggle}
          >
            <NavFilterIcon
              titleAccess={getHeaderTitleAccess(HeaderTypeEnum.Filters, t)}
              data-testid="FilterIcon"
            />
          </NavListButton>
          <TitleBox>
            <Typography variant="h5">{title}</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {t('Showing {{count}} of {{total}} · sorted by MPD health', {
                count: staffMembers.length,
                total: totalCount,
              })}
            </Typography>
          </TitleBox>
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
        <QuartersContainer>
          {quarterLabels.map((label) => (
            <Quarter key={label}>
              <Typography
                variant="body2"
                fontWeight={'bold'}
                sx={{
                  width: '80px',
                }}
                textAlign={'center'}
              >
                {label}
              </Typography>
            </Quarter>
          ))}
        </QuartersContainer>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {error && !staffMembers.length ? (
            <Alert severity="error">{error.message}</Alert>
          ) : (
            <InfiniteList
              loading={loading}
              data={staffMembers}
              disableHover
              style={{ height: '100%' }}
              itemContent={(_index, item: ManagedStaffMember) => (
                <StaffMember
                  key={item.personNumber}
                  data={item}
                  onClick={() => openMember(item)}
                />
              )}
              endReached={() => {
                if (pageInfo?.hasNextPage) {
                  fetchMore({ variables: { after: pageInfo.endCursor } });
                }
              }}
              EmptyPlaceholder={
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography color="text.secondary">
                    {t('No staff members found')}
                  </Typography>
                </Box>
              }
            />
          )}
        </Box>
      </StyledContainer>
    </>
  );
};
