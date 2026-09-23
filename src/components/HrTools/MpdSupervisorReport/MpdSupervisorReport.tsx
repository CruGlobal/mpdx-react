import React, { useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
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
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { getHeaderTitleAccess } from 'src/components/Shared/MultiPageLayout/helpers';
import { NavFilterIcon } from 'src/components/Shared/styledComponents/NavFilterIcon';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { Panel, useMpdSupervisorReport } from './MpdSupervisorReportContext';
import { ReportLegendPopover } from './ReportLegend/ReportLegendPopover';
import { StaffMember } from './StaffMemberRow/StaffMember';
import {
  ManagedStaffMember,
  buildQuarterChips,
  getQuarterLabel,
  getQuarterMonthRange,
} from './helpers';

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
  const locale = useLocale();
  const {
    openMember,
    search,
    setSearch,
    staffMembers,
    totalCount,
    staffLoading,
    staffError,
    hasNextPage,
    loadMore,
  } = useMpdSupervisorReport();

  // Every row covers the same four quarters, so the first one labels the header.
  const quarterHeaders = useMemo(
    () =>
      staffMembers.length
        ? buildQuarterChips(staffMembers[0].quarterlyHealth).map(
            ({ fiscalYear, quarter, averagePayroll }) => {
              const { start, end } = getQuarterMonthRange(fiscalYear, quarter);
              const range = t(
                'Fiscal quarter {{quarter}}, FY{{year}}: {{start}} – {{end}}',
                {
                  quarter,
                  year: String(fiscalYear).slice(-2),
                  start: monthYearFormat(start.month, start.year, locale),
                  end: monthYearFormat(end.month, end.year, locale),
                },
              );
              // buildQuarterChips marks the starting quarter with a null average
              const partial = averagePayroll === null;
              return {
                label: getQuarterLabel(fiscalYear, quarter),
                tooltip: partial
                  ? t(
                      '{{range}} Partial quarter: payroll started during this quarter.',
                      { range },
                    )
                  : range,
              };
            },
          )
        : [],
    [staffMembers, t, locale],
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
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="h5">{title}</Typography>
              <ReportLegendPopover />
            </Box>
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
          {quarterHeaders.map(({ label, tooltip }) => (
            <Quarter key={label}>
              <Tooltip title={tooltip} arrow describeChild>
                <Typography
                  variant="body2"
                  fontWeight={'bold'}
                  tabIndex={0}
                  sx={{
                    width: '80px',
                  }}
                  textAlign={'center'}
                >
                  {label}
                </Typography>
              </Tooltip>
            </Quarter>
          ))}
        </QuartersContainer>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {staffError && !staffMembers.length ? (
            <Alert severity="error">{staffError.message}</Alert>
          ) : (
            <InfiniteList
              loading={staffLoading}
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
                if (hasNextPage) {
                  loadMore();
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
