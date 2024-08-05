import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  ButtonTypeMap,
  ListItem,
  ListItemText,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import theme from 'src/theme';

const useStyles = makeStyles()(() => ({
  li: {
    borderBottom: '1px solid #EBECF1',
    paddingBottom: theme.spacing(3),
  },
  itemBox: {
    width: '100%',
  },
  itemButton: {
    width: '100%',
    textTransform: 'none',
  },
}));

export interface AppealsListFilterPanelButtonProps {
  title: string;
  onClick: () => void;
  buttonText: string;
  buttonError?: ButtonTypeMap['props']['color'];
  buttonVariant?: ButtonTypeMap['props']['variant'];
  disabled?: boolean;
  onMouseEnter?: React.MouseEventHandler<HTMLLIElement> | undefined;
}

export const AppealsListFilterPanelButton = ({
  title,
  onClick,
  buttonText,
  buttonError = 'primary',
  buttonVariant = 'contained',
  disabled,
  onMouseEnter,
}: AppealsListFilterPanelButtonProps): ReactElement => {
  const { classes } = useStyles();

  return (
    <ListItem className={classes.li} onMouseEnter={onMouseEnter}>
      <Box display="flex" flexDirection="column" className={classes.itemBox}>
        <ListItemText
          primaryTypographyProps={{
            variant: 'subtitle1',
            color: 'textPrimary',
          }}
          primary={title}
        />
        <Button
          variant={buttonVariant}
          onClick={onClick}
          disabled={disabled}
          className={classes.itemButton}
          color={buttonError}
        >
          {buttonText}
        </Button>
      </Box>
    </ListItem>
  );
};
