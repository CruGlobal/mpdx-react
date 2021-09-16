import React from 'react';
import Head from 'next/head';
import { Box, Typography, styled } from '@material-ui/core';

const PageTitle = styled(Box)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: theme.palette.mpdxBlue.main,
  padding: theme.spacing(3),
}));

interface PrefWrapperProps {
  pageTitle: string;
  pageHeading: string;
}

export const PreferencesWrapper: React.FC<PrefWrapperProps> = ({
  pageTitle,
  pageHeading,
  children,
}) => {
  return (
    <>
      <Head>
        <title>MPDX | {pageTitle}</title>
      </Head>
      <Box component="main">
        <PageTitle>
          <Typography component="h1" variant="h4">
            {pageHeading}
          </Typography>
        </PageTitle>
        <Box padding={3}>{children}</Box>
      </Box>
    </>
  );
};
