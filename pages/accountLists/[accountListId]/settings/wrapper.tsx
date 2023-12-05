import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import Head from 'next/head';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

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
  const [isNavListOpen, setNavListOpen] = useState(false);
  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>
          {appName} | {pageTitle}
        </title>
      </Head>
      <Box component="main">
        <SidePanelsLayout
          isScrollBox={false}
          leftPanel={
            <MultiPageMenu
              isOpen={isNavListOpen}
              selectedId="responsibilityCenters"
              onClose={handleNavListToggle}
              navType={NavTypeEnum.Settings}
            />
          }
          leftOpen={isNavListOpen}
          leftWidth="290px"
          mainContent={
            <>
              <MultiPageHeader
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={pageHeading}
                rightExtra={null}
                headerType={HeaderTypeEnum.Settings}
              />
              <PageContentWrapper maxWidth="lg">{children}</PageContentWrapper>
            </>
          }
        />
      </Box>
    </>
  );
};
