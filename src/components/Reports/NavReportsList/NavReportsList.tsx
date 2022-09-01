import React from 'react';
import {
  Box,
  BoxProps,
  IconButton,
  List,
  Slide,
  styled,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Item } from './Item/Item';
import { ReportNavItems } from './ReportNavItems';

interface Props {
  selectedId: string;
  isOpen: boolean;
  onClose: () => void;
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
  selectedId,
  isOpen,
  onClose,
  ...BoxProps
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box data-testid="ReportNavList" {...BoxProps}>
      <div className={classes.root}>
        <Slide in={isOpen} direction="right" mountOnEnter unmountOnExit>
          <Box>
            <FilterHeader>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{t('Reports')}</Typography>
                <IconButton onClick={onClose}>
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
            </FilterHeader>
            <FilterList dense>
              {ReportNavItems.map((item) => (
                <Item
                  key={item.id}
                  item={item}
                  isSelected={item.id === selectedId}
                />
              ))}
            </FilterList>
          </Box>
        </Slide>
      </div>
    </Box>
  );
};
