import Head from 'next/head';
import React, { useState } from 'react';
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
import { PageContentWrapper } from './styledComponents/PageContentWrapper';

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
        <title>{`${appName} | ${pageTitle}`}</title>
      </Head>
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
    </>
  );
};
