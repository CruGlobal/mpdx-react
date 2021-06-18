import React from 'react';
import type { FC, ReactNode } from 'react';
import {
  Box,
  Container,
  Theme,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

interface ReportLayoutProps {
  selectedId: string;
  title: string;
  children: ReactNode;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.common.white,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: 100,
  },
}));

export const ReportLayout: FC<ReportLayoutProps> = ({
  // selectedId,
  title,
  children,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <Container maxWidth={false}>
        <Box my={2}>
          <Typography variant="h5">{t(title)}</Typography>
        </Box>
        {children}
      </Container>
    </div>
  );
};
