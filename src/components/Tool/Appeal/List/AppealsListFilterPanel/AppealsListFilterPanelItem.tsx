import React, { ReactElement } from 'react';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import {
  Box,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import theme from 'src/theme';
import { AppealStatusEnum } from '../../AppealsContext/AppealsContext';

const useStyles = makeStyles()(() => ({
  li: {
    borderBottom: `1px solid ${theme.palette.mpdxGrayLight.main}`,
    '&:hover': {
      backgroundColor: theme.palette.mpdxGrayLight.main,
    },
  },
}));

const countBoxStyles = (status: AppealStatusEnum): React.CSSProperties => {
  const styles: React.CSSProperties = {
    color: '#ffffff',
    borderRadius: 5,
    fontWeight: 600,
    padding: '2px 8px 2px 8px',
  };
  switch (status) {
    case AppealStatusEnum.Excluded:
      return {
        ...styles,
        backgroundColor: theme.palette.statusDanger.main,
      };
    case AppealStatusEnum.Asked:
      return {
        ...styles,
        backgroundColor: theme.palette.mpdxGrayMedium.main,
        border: '1px solid #ffffff',
      };
    case AppealStatusEnum.Processed:
      return {
        ...styles,
        backgroundColor: theme.palette.mpdxGreen.main,
      };
    default:
      return {
        ...styles,
        backgroundColor: theme.palette.yellow.main,
        color: theme.palette.mpdxGrayDark.main,
      };
  }
};

export interface AppealsListFilterPanelItemProps {
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
}: AppealsListFilterPanelItemProps): ReactElement => {
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
        <Skeleton
          data-testid="panel-item-skeleton"
          width={'25px'}
          height={'35px'}
        />
      )}
      <Box style={countBoxStyles(id)} data-testid="panel-item-count-box">
        <Typography variant="body2">{count}</Typography>
      </Box>
      <ArrowForwardIos fontSize="small" color="disabled" />
    </ListItem>
  );
};
