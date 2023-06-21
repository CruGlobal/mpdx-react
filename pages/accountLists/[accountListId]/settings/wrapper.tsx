import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import Head from 'next/head';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const PageHeadingWrapper = styled(Box)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const PageContentWrapper = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

interface SettingsWrapperProps {
  pageTitle: string;
  pageHeading: string;
  children?: React.ReactNode;
}

export const SettingsWrapper: React.FC<SettingsWrapperProps> = ({
  pageTitle,
  pageHeading,
  children,
}) => {
  const { appName } = useGetAppSettings();
  return (
    <>
      <Head>
        <title>
          {appName} | {pageTitle}
        </title>
      </Head>
      <Box component="main">
        <PageHeadingWrapper>
          <Container maxWidth="lg">
            <Typography variant="h4">{pageHeading}</Typography>
          </Container>
        </PageHeadingWrapper>
        <PageContentWrapper maxWidth="lg">{children}</PageContentWrapper>
      </Box>
    </>
  );
};
