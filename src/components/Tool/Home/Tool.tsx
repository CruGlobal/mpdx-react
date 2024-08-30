import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import Icon from '@mdi/react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useAccountListId } from '../../../hooks/useAccountListId';
import theme from '../../../theme';

const useStyles = makeStyles()(() => ({
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '250px',
    borderColor: theme.palette.cruGrayMedium.main,
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
  iconBG: {
    padding: theme.spacing(2),
    borderRadius: '50%',
    height: theme.spacing(8),
    width: theme.spacing(8),
    backgroundColor: 'white',
  },
}));

export interface Props {
  tool: string;
  desc: string;
  icon: string;
  url: string;
}

const Tool = ({ tool, desc, icon, url }: Props): ReactElement => {
  const { classes } = useStyles();
  const accountListId = useAccountListId();

  return (
    <Card className={classes.cardContainer} elevation={3}>
      <NextLink
        href={`/accountLists/${accountListId}/tools/${url}`}
        scroll={false}
      >
        <CardActionArea>
          <CardContent className={classes.cardContent}>
            <Box
              className={classes.iconBG}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Icon path={icon} size={3} />
            </Box>
            <Typography variant="h6">{tool}</Typography>
            <Typography variant="subtitle2">{desc}</Typography>
          </CardContent>
        </CardActionArea>
      </NextLink>
    </Card>
  );
};

export default Tool;
