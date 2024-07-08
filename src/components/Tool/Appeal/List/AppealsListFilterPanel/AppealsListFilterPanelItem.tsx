import React, { ReactElement } from 'react';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import { Box, ListItem, ListItemText } from '@mui/material';
import clsx from 'clsx';
import { makeStyles } from 'tss-react/mui';
import theme from 'src/theme';
import { AppealListViewEnum } from '../../AppealsContext/AppealsContext';

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
  id: AppealListViewEnum;
  title: string;
  isSelected: boolean;
  value: number;
  onClick: (id: string) => void;
}

export const AppealsListFilterPanelItem = ({
  id,
  title,
  isSelected,
  value,
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
      <Box
        className={clsx(
          classes.valueText,
          id === AppealListViewEnum.Excluded
            ? classes.red
            : id === AppealListViewEnum.Asked
            ? classes.gray
            : id === AppealListViewEnum.Given
            ? classes.green
            : classes.gold,
        )}
      >
        {value}
      </Box>
      <ArrowForwardIos fontSize="small" color="disabled" />
    </ListItem>
  );
};
