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
import NavReportListItem from './NavReportListItem';
import { ReportNavItems } from './ReportNavItems';

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
          {ReportNavItems.map((item) => (
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
