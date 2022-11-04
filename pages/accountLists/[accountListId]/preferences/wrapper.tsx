import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import Head from 'next/head';

const PageHeadingWrapper = styled(Box)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const PageContentWrapper = styled(Container)(({theme}) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}))

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
        <PageHeadingWrapper>
          <Container maxWidth="lg">
            <Typography variant="h4">{pageHeading}</Typography>
          </Container>
        </PageHeadingWrapper>
        <PageContentWrapper maxWidth="lg">
          {children}
        </PageContentWrapper>
      </Box>
    </>
  );
};
