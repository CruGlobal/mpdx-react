import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import Icon from '@mdi/react';
import { Box, CardActionArea, CardContent, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AnimatedCard from 'src/components/AnimatedCard';
import { useAccountListId } from '../../../hooks/useAccountListId';
import theme from '../../../theme';

const useStyles = makeStyles()(() => ({
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid',
    height: '200px',
    borderColor: theme.palette.cruGrayMedium.main,
    backgroundColor: theme.palette.cruGrayLight.main,
    '&:hover': {
      border: '2px solid',
      borderColor: theme.palette.mpdxBlue.main,
      cursor: 'pointer',
    },
  },
  cardContent: {
    display: 'flex',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '200px',
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
  id: string;
}

const Tool = ({ tool, desc, icon, id }: Props): ReactElement => {
  const { classes } = useStyles();
  const accountListId = useAccountListId();

  return (
    <AnimatedCard className={classes.cardContainer}>
      <NextLink
        href={`/accountLists/${accountListId}/tools/${id}`}
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
            <Typography variant="body2">{desc}</Typography>
          </CardContent>
        </CardActionArea>
      </NextLink>
    </AnimatedCard>
  );
};

export default Tool;
