import React, { useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import {
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
import theme from 'src/theme';
import { ALL_TEAMS, ALL_TYPES } from './Filters/mpdSupervisorReportFilters';
import { Panel, useMpdSupervisorReport } from './MpdSupervisorReportContext';
import { StaffMember } from './StaffMemberRow/StaffMember';
import { EmployeeData, mockStaffMembers } from './mockData';
import { useMockInfiniteStaff } from './useMockInfiniteStaff';

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
  const { openMember, search, setSearch, team, employmentType } =
    useMpdSupervisorReport();

  // TODO(MPDX): Replace this client-side filtering with server-side filtering.
  // Note: `activeQuickFilter` (Negative last month / 3+ months negative) is
  // tracked in context and highlights the chip, but is not yet applied here —
  // it needs MPD-health history that the mock data lacks.
  const staffMembers = useMemo(
    () =>
      mockStaffMembers.filter((data) => {
        const { user } = data;
        const fullName = `${user.preferredName} ${user.lastName}`;
        const matchesSearch = fullName
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        const matchesTeam = team === ALL_TEAMS || user.team === team;
        const matchesType =
          employmentType === ALL_TYPES ||
          user.userPersonType === employmentType;
        return matchesSearch && matchesTeam && matchesType;
      }),
    [search, team, employmentType],
  );

  const { data, loading, fetchMore } = useMockInfiniteStaff(staffMembers);

  const { quarters } = data.nodes[0] || {};

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
                total: mockStaffMembers.length,
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
          {quarters?.map((quarter) => (
            <Quarter key={quarter.label}>
              <Typography
                variant="body2"
                fontWeight={'bold'}
                sx={{
                  width: '80px',
                }}
                textAlign={'center'}
              >
                {quarter.label}
              </Typography>
            </Quarter>
          ))}
        </QuartersContainer>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <InfiniteList
            loading={loading}
            data={data.nodes}
            disableHover
            style={{ height: '100%' }}
            itemContent={(_index, item: EmployeeData) => (
              <StaffMember
                key={item.user.id}
                data={item}
                onClick={() => openMember(item)}
              />
            )}
            endReached={() => {
              if (data.pageInfo.hasNextPage) {
                fetchMore();
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
        </Box>
      </StyledContainer>
    </>
  );
};
