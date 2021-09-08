import React, { ReactElement } from 'react';
import { ListItem, ListItemText, makeStyles, Box } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import clsx from 'clsx';
import theme from '../../../../../theme';
import { useAppealContext } from '../../AppealContextProvider/AppealContextProvider';

const useStyles = makeStyles(() => ({
  li: {
    borderBottom: '1px solid black',
  },
  liButton: {
    '&:hover': {
      backgroundColor: theme.palette.cruGrayLight.main,
    },
  },
  liSelected: {
    backgroundColor: theme.palette.cruGrayMedium.main + ' !important', //TODO: Get around this so we don't need the !important
  },
  red: {
    backgroundColor: 'red',
  },
  green: {
    backgroundColor: theme.palette.mpdxGreen.main,
  },
  gold: {
    backgroundColor: theme.palette.cruYellow.main,
    color: theme.palette.cruGrayDark.main + ' !important',
  },
  gray: {
    backgroundColor: theme.palette.cruGrayMedium.main,
    border: '1px solid white',
  },
  valueText: {
    color: 'white',
    borderRadius: 5,
    fontWeight: 600,
    padding: '2px 8px 2px 8px',
  },
}));

interface Props {
  id: string;
  title: string;
  isSelected: boolean;
  value: number;
}

export const AppealDrawerItem = ({
  id,
  title,
  isSelected,
  value,
}: Props): ReactElement => {
  const classes = useStyles();
  const { appealState, setAppealState } = useAppealContext();

  const changeSubDisplay = (props: string): void => {
    setAppealState({ ...appealState, subDisplay: props, selected: [] });
  };

  return (
    <ListItem
      button
      selected={isSelected}
      onClick={() => changeSubDisplay(id)}
      className={clsx(
        classes.li,
        isSelected ? classes.liSelected : classes.liButton,
      )}
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
          id === 'excluded'
            ? classes.red
            : id === 'asked'
            ? classes.gray
            : id === 'given'
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
