import React, { ReactElement } from 'react';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import {
  Box,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { makeStyles } from 'tss-react/mui';
import theme from 'src/theme';
import { AppealStatusEnum } from '../../AppealsContext/AppealsContext';

const useStyles = makeStyles()(() => ({
  li: {
    borderBottom: '1px solid #EBECF1',
    '&:hover': {
      backgroundColor: theme.palette.cruGrayLight.main,
    },
  },
  red: {
    backgroundColor: theme.palette.statusDanger.main,
  },
  green: {
    backgroundColor: theme.palette.mpdxGreen.main,
  },
  gold: {
    backgroundColor: theme.palette.cruYellow.main,
    color: theme.palette.cruGrayDark.main,
  },
  gray: {
    backgroundColor: theme.palette.cruGrayMedium.main,
    border: '1px solid #ffffff',
  },
  valueText: {
    color: '#ffffff',
    borderRadius: 5,
    fontWeight: 600,
    padding: '2px 8px 2px 8px',
  },
}));

interface Props {
  id: AppealStatusEnum;
  title: string;
  isSelected: boolean;
  count?: number;
  loading: boolean;
  onClick: (newAppealListView: AppealStatusEnum) => void;
}

export const AppealsListFilterPanelItem = ({
  id,
  title,
  isSelected,
  count,
  loading,
  onClick,
}: Props): ReactElement => {
  const { classes } = useStyles();

  const handleClick = () => {
    onClick(id);
  };

  return (
    <ListItem
      button
      selected={isSelected}
      onClick={handleClick}
      className={classes.li}
    >
      <ListItemText
        primaryTypographyProps={{
          variant: 'subtitle1',
          color: 'textPrimary',
        }}
        primary={title}
      />

      {loading && count === undefined && (
        <Skeleton width={'25px'} height={'35px'} />
      )}
      <Box
        className={clsx(
          classes.valueText,
          id === AppealStatusEnum.Excluded
            ? classes.red
            : id === AppealStatusEnum.Asked
            ? classes.gray
            : id === AppealStatusEnum.Processed
            ? classes.green
            : classes.gold,
        )}
      >
        <Typography variant="body2">{count}</Typography>
      </Box>
      <ArrowForwardIos fontSize="small" color="disabled" />
    </ListItem>
  );
};
