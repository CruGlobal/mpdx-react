import Head from 'next/head';
import React, { JSXElementConstructor, ReactElement, useState } from 'react';
import { Box } from '@mui/material';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import {
  HeaderTypeEnum,
  MultiPageHeader,
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import NavToolList from 'src/components/Tool/NavToolList/NavToolList';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { ContactsWrapper } from '../contacts/ContactsWrapper';
import { PageContentWrapper } from '../settings/styledComponents';
import { useToolsHelper } from './useToolsHelper';

interface ToolsWrapperProps {
  pageTitle?: string;
  pageUrl: string;
  selectedMenuId?: string;
  children: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
}

export const ToolsWrapper: React.FC<ToolsWrapperProps> = ({
  pageTitle,
  pageUrl,
  selectedMenuId,
  children,
}) => {
  const { appName } = useGetAppSettings();
  const { accountListId, selectedContactId, handleSelectContact } =
    useToolsHelper();
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState<boolean>(false);

  return (
    <>
      <Head>
        <title>
          {appName} | {pageTitle}
        </title>
      </Head>
      <Box component="main">
        {accountListId ? (
          <SidePanelsLayout
            leftOpen={isToolDrawerOpen}
            isScrollBox={false}
            leftPanel={
              <NavToolList
                selectedId={selectedMenuId || ''}
                isOpen={isToolDrawerOpen}
                toggle={setIsToolDrawerOpen}
              />
            }
            leftWidth="290px"
            mainContent={
              <>
                <MultiPageHeader
                  isNavListOpen={isToolDrawerOpen}
                  onNavListToggle={() => setIsToolDrawerOpen(!isToolDrawerOpen)}
                  title={pageTitle || ''}
                  headerType={HeaderTypeEnum.Tools}
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
            rightPanel={
              selectedContactId ? (
                <ContactsWrapper>
                  <DynamicContactsRightPanel
                    onClose={() => handleSelectContact(pageUrl, '')}
                  />
                </ContactsWrapper>
              ) : undefined
            }
            rightOpen={typeof selectedContactId !== 'undefined'}
            rightWidth="60%"
            headerHeight={'0px'}
          />
        ) : (
          <Loading loading />
        )}
      </Box>
    </>
  );
};
