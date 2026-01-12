import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import Icon from '@mdi/react';
import {
  Badge,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Link,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { makeStyles } from 'tss-react/mui';
import { useAccountListId } from '../../../hooks/useAccountListId';
import theme from '../../../theme';

const useStyles = makeStyles()(() => ({
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '250px',
    borderColor: theme.palette.mpdxGrayMedium.main,
    '&:hover': {
      outline: '2px solid',
      outlineColor: theme.palette.mpdxBlue.main,
      cursor: 'pointer',
    },
  },
  cardContent: {
    display: 'flex',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '250px',
  },
  iconNeedsAttention: {
    padding: theme.spacing(1),
    borderRadius: '50%',
    height: theme.spacing(8),
    width: theme.spacing(8),
    backgroundColor: theme.palette.progressBarYellow.main,
    color: theme.palette.common.white,
  },
  cardNeedsAttention: {
    backgroundColor: '#fdf2d3',
    outline: '1px solid',
    outlineColor: theme.palette.progressBarYellow.main,
  },
  customBadge: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.progressBarYellow.main,
    border: `1px solid ${theme.palette.progressBarYellow.main}`,
    fontWeight: 'bold',
  },
}));

export interface Props {
  tool: string;
  desc: string;
  icon: string;
  url: string;
  needsAttention: boolean;
  totalCount: number | string;
  loading: boolean;
  toolId: string;
}

const Tool = ({
  tool,
  desc,
  icon,
  url,
  needsAttention,
  totalCount,
  loading,
  toolId,
}: Props): ReactElement => {
  const { classes } = useStyles();
  const accountListId = useAccountListId();

  return (
    <Card
      className={clsx(
        classes.cardContainer,
        needsAttention && classes.cardNeedsAttention,
      )}
      elevation={3}
      data-testid={`${toolId}-container`}
    >
      <Link
        component={NextLink}
        href={`/accountLists/${accountListId}/tools/${url}`}
        color="inherit"
        underline="none"
      >
        <CardActionArea>
          <CardContent className={classes.cardContent}>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Badge
                classes={{ badge: classes.customBadge }}
                overlap="circular"
                badgeContent={!loading && needsAttention ? totalCount : 0}
                max={99}
                data-testid={`${toolId}-notifications`}
                color="secondary"
              >
                <Icon
                  data-testid={`${toolId}-icon`}
                  className={clsx(needsAttention && classes.iconNeedsAttention)}
                  path={icon}
                  size={2}
                />
              </Badge>
            </Box>
            <Typography variant="h6">{tool}</Typography>
            <Typography variant="subtitle2">{desc}</Typography>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
};

export default Tool;
