import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import Head from 'next/head';

const PageTitleWrapper = styled(Box)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  maxWidth: 1280,
  margin: '0 auto',
}));

interface PrefWrapperProps {
  pageTitle: string;
  pageHeading: string;
  children?: React.ReactNode;
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
        <PageTitleWrapper>
          <PageTitle variant="h4">{pageHeading}</PageTitle>
        </PageTitleWrapper>
        <Box padding={3} style={{ maxWidth: 1280, margin: '0 auto' }}>
          {children}
        </Box>
      </Box>
    </>
  );
};
