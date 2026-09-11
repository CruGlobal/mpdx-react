import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Avatar, Box, IconButton, Tab, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
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
import { getInitials, pendingField } from '../helpers';

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <Box
    sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 140 }}
  >
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
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
  const {
    selectedMember,
    closePanel,
    selectedTabKey,
    handleTabChange: handleChange,
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
    spousePersonNumber,
    spouseStaffAccountId,
    teams,
  } = selectedMember;
  const initials = getInitials(firstName, lastName);
  const fullName = `${firstName} ${lastName}`;
  const team =
    teams.employee.map(({ name }) => name).join(', ') || pendingField;

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
        <DetailRow
          label={t('Staff Account Number')}
          value={staffAccountId ?? pendingField}
        />
        <DetailRow label={t('Employment Type')} value={pendingField} />
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
          <DynamicMonthlySummary staffAccountId={staffAccountId ?? null} />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.Quarterly}>
          <DynamicQuarterly staffAccountId={staffAccountId ?? null} />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.Payroll}>
          <DynamicPayroll staffAccountId={staffAccountId ?? null} />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.MPGAReport}>
          <DynamicMPGA staffAccountId={staffAccountId ?? null} />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.StaffExpenseReport}>
          <StaffTabStaffExpenseReport
            staffAccountId={staffAccountId ?? null}
            personNumber={personNumber}
          />
        </TabPanel>
      </TabContext>
    </Box>
  );
};
