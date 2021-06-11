import React, { useState } from 'react';
import {
  Box,
  BoxProps,
  List,
  styled,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import NavReportListItem, { ReportOption } from './NavReportListItem';

const reportItems: ReportOption[] = [
  {
    id: 'donations',
    title: 'Donations',
    href: '/reports/donations',
  },
  {
    id: 'partner',
    title: 'Month Report',
    href: '/reports/partner',
    subTitle: 'Partner Currency',
  },
  {
    id: 'salary',
    title: 'Month Report',
    href: '/reports/salary',
    subTitle: 'Salary Currency',
  },
  {
    id: 'designation_accounts',
    title: 'Designation Accounts',
    href: '/reports/designation_accounts',
  },
  {
    id: 'monthly',
    title: 'Expected Monthly Total',
    href: '/reports/monthly',
  },
  {
    id: 'analysis',
    title: 'Partner Giving Analysis',
    href: '/reports/analysis',
  },
  {
    id: 'coaching',
    title: 'Coaching',
    href: '/reports/coaching',
  },
];

const useStyles = makeStyles(() => ({
  root: {
    overflow: 'hidden',
  },
}));

const FilterHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.grey[200],
}));

const FilterList = styled(List)(({ theme }) => ({
  '& .MuiListItemIcon-root': {
    minWidth: '37px',
  },
  '& .FilterListItemMultiselect-root': {
    marginBottom: theme.spacing(4),
  },
}));

const NavReportsList: React.FC<BoxProps> = ({ ...BoxProps }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleSelectReport = (value: string): void => {
    setSelectedReportId(value);
    console.log(selectedReportId);
  };

  return (
    <Box {...BoxProps}>
      <div className={classes.root}>
        <FilterHeader>
          <Typography variant="h6">Report</Typography>
        </FilterHeader>
        <FilterList dense>
          {reportItems.map((item) => (
            <NavReportListItem
              key={item.id}
              item={item}
              isSelected={item.id === selectedReportId}
              onSelect={handleSelectReport}
            />
          ))}
        </FilterList>
      </div>
    </Box>
  );
};

export default NavReportsList;
