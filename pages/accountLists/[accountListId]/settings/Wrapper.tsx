import Head from 'next/head';
import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import {
  HeaderTypeEnum,
  MultiPageHeader,
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const PageContentWrapper = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  '&:after': {
    content: '""',
    width: '100%',
    height: theme.spacing(10),
    display: 'block',
  },
}));

interface SettingsWrapperProps {
  pageTitle: string;
  pageHeading: string;
  selectedMenuId: string;
  children?: React.ReactNode;
}

export const SettingsWrapper: React.FC<SettingsWrapperProps> = ({
  pageTitle,
  pageHeading,
  selectedMenuId,
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
          isScrollBox
          leftPanel={
            <MultiPageMenu
              isOpen={isNavListOpen}
              selectedId={selectedMenuId}
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
              <PageContentWrapper
                maxWidth="lg"
                style={{
                  height: `calc(100vh - ${navBarHeight} - ${multiPageHeaderHeight})`,
                }}
              >
                {children}
              </PageContentWrapper>
            </>
          }
        />
      </Box>
    </>
  );
};
