import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Alert,
  Avatar,
  Box,
  IconButton,
  Tab,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { InfoTooltipIcon } from 'src/components/HrTools/Shared/InfoTooltipIcon';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import theme from 'src/theme';
import { GeographicLocationSelect } from '../GeographicLocationSelect/GeographicLocationSelect';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
import { newStaffSalaryTooltip } from '../ReportLegend/legendCopy';
import { DynamicMPGA, preloadMPGA } from '../StaffDetailsTabs/MPGA/DynamicMPGA';
import {
  DynamicMonthlySummary,
  preloadMonthlySummary,
} from '../StaffDetailsTabs/MonthlySummary/DynamicMonthlySummary';
import {
  DynamicPayroll,
  preloadPayroll,
} from '../StaffDetailsTabs/Payroll/DynamicPayroll';
import {
  DynamicQuarterly,
  preloadQuarterly,
} from '../StaffDetailsTabs/Quarterly/DynamicQuarterly';
import { StaffDetailTabEnum } from '../StaffDetailsTabs/StaffDetailTab';
import { preloadStaffExpenseReport } from '../StaffDetailsTabs/StaffExpenseReport/DynamicStaffExpenseReport';
import { StaffTabStaffExpenseReport } from '../StaffDetailsTabs/StaffExpenseReport/StaffExpenseReport';
import { GrossSalaryMarker } from '../StaffMemberRow/GrossSalaryMarker';
import {
  getInitials,
  getLocalizedAssignmentCategoryGroup,
  grossSalaryWarning,
  pendingField,
} from '../helpers';

interface DetailRowProps {
  label: string;
  value: string;
  /** Rendered inline after the label, e.g. an info tooltip icon */
  labelAdornment?: React.ReactNode;
  /** Rendered inline after the value, e.g. a warning marker */
  valueAdornment?: React.ReactNode;
  valueColor?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  labelAdornment,
  valueAdornment,
  valueColor,
}) => (
  <Box
    sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 140 }}
  >
    <Box display="flex" alignItems="center" gap={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {labelAdornment}
    </Box>
    <Box display="flex" alignItems="center" gap={0.5}>
      <Typography variant="body2" color={valueColor}>
        {value}
      </Typography>
      {valueAdornment}
    </Box>
  </Box>
);

const StaffInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

const ContactTabsWrapper = styled(Box)(({}) => ({
  width: '100%',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ContactTabs = styled(TabList)(({ theme }) => ({
  width: '100%',
  minHeight: 40,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.progressBarYellow.main,
  },
}));

const ContactTab = styled(Tab)(({}) => ({
  textTransform: 'none',
  minWidth: 64,
  minHeight: 40,
  marginRight: theme.spacing(1),
  color: theme.palette.text.primary,
  opacity: 0.75,
  '&:hover': { opacity: 1 },
}));

export const StaffMemberDrawer: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();
  const {
    selectedMember,
    updateSelectedMember,
    closePanel,
    selectedTabKey,
    handleTabChange: handleChange,
    refetchStaff,
  } = useMpdSupervisorReport();

  if (!selectedMember) {
    return null;
  }

  const {
    firstName,
    lastName,
    spouseFirstName,
    spouseLastName,
    personNumber,
    staffAccountId,
    geographicLocation,
    spousePersonNumber,
    spouseStaffAccountId,
    teams,
    newStaffMonthlySalary,
    quarterlyHealth,
    assignmentCategoryGroup,
  } = selectedMember;
  const initials = getInitials(firstName, lastName);
  const fullName = `${firstName} ${lastName}`;
  const team =
    teams.employee.map(({ name }) => name).join(', ') || pendingField;
  const monthlyGrossSalary = quarterlyHealth?.monthlyGrossSalary ?? null;
  const missingBenchmark =
    monthlyGrossSalary === null || newStaffMonthlySalary === null;
  const grossWarning = grossSalaryWarning(t, formatCurrency, selectedMember);

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        p: theme.spacing(3),
        height: '100%',
        width: '100%',
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'mpdxGrayLight.main', color: 'text.primary' }}>
          {initials}
        </Avatar>
        <Typography variant="h6" id="right-panel-header" sx={{ flex: 1 }}>
          {fullName}
        </Typography>
        <IconButton aria-label={t('Close')} onClick={closePanel} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <StaffInfo>
        <DetailRow label={t('Person Number')} value={personNumber} />
        <DetailRow label={t('Staff Account Number')} value={staffAccountId} />
        <DetailRow
          label={t('Employment Type')}
          value={getLocalizedAssignmentCategoryGroup(
            t,
            assignmentCategoryGroup,
          )}
        />
        <DetailRow label={t('Team')} value={team} />
      </StaffInfo>

      {spouseFirstName && (
        <StaffInfo>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            sx={{ width: '100%' }}
          >
            {t('Spouse')}: {`${spouseFirstName} ${spouseLastName ?? lastName}`}
          </Typography>
          <DetailRow
            label={t('Person Number')}
            value={spousePersonNumber ?? pendingField}
          />
          <DetailRow
            label={t('Staff Account Number')}
            value={spouseStaffAccountId ?? pendingField}
          />
        </StaffInfo>
      )}

      <StaffInfo>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('MPD Health Benchmark:')}
          </Typography>
          <StaffInfo>
            <DetailRow
              label={t('New Staff Monthly Salary')}
              labelAdornment={
                // describeChild announces the explanation as the icon's
                // description while titleAccess stays its accessible name
                <Tooltip title={newStaffSalaryTooltip(t)} describeChild>
                  <InfoTooltipIcon
                    tabIndex={0}
                    titleAccess={t(
                      'How New Staff Monthly Salary is calculated',
                    )}
                  />
                </Tooltip>
              }
              value={
                newStaffMonthlySalary !== null
                  ? formatCurrency(newStaffMonthlySalary)
                  : pendingField
              }
            />
            <DetailRow
              label={t('Monthly Gross Salary')}
              valueColor={grossWarning ? 'error.main' : undefined}
              valueAdornment={
                grossWarning && <GrossSalaryMarker warning={grossWarning} />
              }
              value={
                monthlyGrossSalary !== null
                  ? formatCurrency(monthlyGrossSalary)
                  : pendingField
              }
            />
          </StaffInfo>
          {missingBenchmark && (
            <Alert severity="error" sx={{ width: 0, minWidth: '100%' }}>
              {t('MPD health cannot be graded without both benchmarks.')}
            </Alert>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flex: 1,
            minWidth: 260,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {t('Geographic Multiplier:')}
          </Typography>
          <GeographicLocationSelect
            key={personNumber}
            firstName={firstName}
            personNumber={personNumber}
            geographicLocation={geographicLocation}
            onSaved={(geographicLocation, newStaffMonthlySalary) => {
              updateSelectedMember(personNumber, {
                geographicLocation,
                newStaffMonthlySalary,
              });
              refetchStaff();
            }}
          />
        </Box>
      </StaffInfo>

      <TabContext value={selectedTabKey}>
        <ContactTabsWrapper>
          <ContactTabs onChange={handleChange} aria-label={t('Staff details')}>
            <ContactTab
              value={StaffDetailTabEnum.MonthlySummary}
              label={t('Monthly Summary')}
              onMouseEnter={preloadMonthlySummary}
            />
            <ContactTab
              value={StaffDetailTabEnum.Quarterly}
              label={t('Quarterly')}
              onMouseEnter={preloadQuarterly}
            />
            <ContactTab
              value={StaffDetailTabEnum.Payroll}
              label={t('Payroll')}
              onMouseEnter={preloadPayroll}
            />
            <ContactTab
              value={StaffDetailTabEnum.MPGAReport}
              label={t('MPGA Report')}
              onMouseEnter={preloadMPGA}
            />
            <ContactTab
              value={StaffDetailTabEnum.StaffExpenseReport}
              label={t('Staff Expense Report')}
              onMouseEnter={preloadStaffExpenseReport}
            />
          </ContactTabs>
        </ContactTabsWrapper>

        <TabPanel value={StaffDetailTabEnum.MonthlySummary}>
          <DynamicMonthlySummary staffAccountId={staffAccountId} />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.Quarterly}>
          <DynamicQuarterly staffAccountId={staffAccountId} />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.Payroll}>
          <DynamicPayroll staffAccountId={staffAccountId} />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.MPGAReport}>
          <DynamicMPGA
            staffAccountId={staffAccountId}
            personNumber={personNumber}
          />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.StaffExpenseReport}>
          <StaffTabStaffExpenseReport
            staffAccountId={staffAccountId}
            personNumber={personNumber}
          />
        </TabPanel>
      </TabContext>
    </Box>
  );
};
