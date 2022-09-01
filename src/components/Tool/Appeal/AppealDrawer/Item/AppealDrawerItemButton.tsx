import React, { ReactElement } from 'react';
import { ListItem, ListItemText, Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import theme from '../../../../../theme';

const useStyles = makeStyles(() => ({
  li: {
    borderBottom: '1px solid black',
    paddingBottom: theme.spacing(3),
  },
  itemButton: {
    backgroundColor: theme.palette.cruGrayLight.main,
    width: '260px',
    textTransform: 'none',
  },
}));

interface Props {
  title: string;
  func: () => void;
  buttonText: string;
  disabled?: boolean;
}

export const AppealDrawerItemButton = ({
  title,
  func,
  buttonText,
  disabled,
}: Props): ReactElement => {
  const classes = useStyles();

  return (
    <ListItem className={classes.li}>
      <Box display="flex" flexDirection="column">
        <ListItemText
          primaryTypographyProps={{
            variant: 'subtitle1',
            color: 'textPrimary',
          }}
          primary={title}
        />
        <Button
          variant="contained"
          onClick={func}
          disabled={disabled}
          className={classes.itemButton}
        >
          {buttonText}
        </Button>
      </Box>
    </ListItem>
  );
};
