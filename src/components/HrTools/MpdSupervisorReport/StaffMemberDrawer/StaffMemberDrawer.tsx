import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Avatar, Box, IconButton, Tab, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
import { DynamicMPGA, preloadMPGA } from '../StaffDetailsTabs/MPGA/DynamicMPGA';
import { preloadMonthlySummary } from '../StaffDetailsTabs/MonthlySummary/DynamicMonthlySummary';
import { StaffTabMonthlySummary } from '../StaffDetailsTabs/MonthlySummary/MonthlySummary';
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

const StaffInfo = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 2,
  flexWrap: 'wrap',
}));

const ContactTabsWrapper = styled(Box)(({}) => ({
  width: '100%',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ContactTabs = styled(TabList)(({}) => ({
  width: '100%',
  minHeight: 40,
  indicator: {
    display: 'flex',
    '& > span': {
      width: '100%',
      height: 2,
      backgroundColor: '#FFCF07',
    },
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

  const { user, spouse } = selectedMember;
  const {
    preferredName,
    lastName,
    personNumber,
    staffAccountID,
    userPersonType,
    team,
  } = user;
  const initials =
    (preferredName[0] ?? '').toUpperCase() + (lastName[0] ?? '').toUpperCase();
  const fullName = `${preferredName} ${lastName}`;

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
        <DetailRow label={t('Staff Account Number')} value={staffAccountID} />
        <DetailRow label={t('Employment Type')} value={userPersonType} />
        <DetailRow label={t('Team')} value={team} />
      </StaffInfo>

      {spouse && (
        <StaffInfo>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            sx={{ width: '100%' }}
          >
            {t('Spouse')}: {`${spouse.preferredName} ${spouse.lastName}`}
          </Typography>
          <DetailRow label={t('Person Number')} value={spouse.personNumber} />
          <DetailRow
            label={t('Staff Account Number')}
            value={spouse.staffAccountID}
          />
        </StaffInfo>
      )}

      <TabContext value={selectedTabKey}>
        <ContactTabsWrapper>
          <ContactTabs
            onChange={handleChange}
            TabIndicatorProps={{ children: <span /> }}
          >
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
          <StaffTabMonthlySummary />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.Quarterly}>
          <DynamicQuarterly />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.Payroll}>
          <DynamicPayroll />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.MPGAReport}>
          <DynamicMPGA />
        </TabPanel>
        <TabPanel value={StaffDetailTabEnum.StaffExpenseReport}>
          <StaffTabStaffExpenseReport />
        </TabPanel>
      </TabContext>
    </Box>
  );
};
