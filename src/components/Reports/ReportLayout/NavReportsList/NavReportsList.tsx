import React from 'react';
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
  },
  {
    id: 'partnerCurrency',
    title: 'Month Report',
    subTitle: 'Partner Currency',
  },
  {
    id: 'salaryCurrency',
    title: 'Month Report',
    subTitle: 'Salary Currency',
  },
  {
    id: 'designationAccounts',
    title: 'Designation Accounts',
  },
  {
    id: 'responsibilityCenters',
    title: 'Responsibility Centers',
  },
  {
    id: 'expectedMonthlyTotal',
    title: 'Expected Monthly Total',
  },
  {
    id: 'partnerGivingAnalysis',
    title: 'Partner Giving Analysis',
  },
  {
    id: 'coaching',
    title: 'Coaching',
  },
];

interface Props {
  selected: string;
}

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

export const NavReportsList: React.FC<Props & BoxProps> = ({
  selected,
  ...BoxProps
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box width={280} {...BoxProps}>
      <div className={classes.root}>
        <FilterHeader>
          <Typography variant="h6">{t('Reports')}</Typography>
        </FilterHeader>
        <FilterList dense>
          {reportItems.map((item) => (
            <NavReportListItem
              key={item.id}
              item={item}
              isSelected={item.id === selected}
            />
          ))}
        </FilterList>
      </div>
    </Box>
  );
};
