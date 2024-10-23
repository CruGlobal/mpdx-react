import Head from 'next/head';
import { useRouter } from 'next/router';
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
  showToolsHeader?: boolean;
  children: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
}

export const ToolsWrapper: React.FC<ToolsWrapperProps> = ({
  pageTitle,
  pageUrl,
  selectedMenuId,
  showToolsHeader = true,
  children,
}) => {
  const { push } = useRouter();
  const { appName } = useGetAppSettings();
  const { accountListId, selectedContactId } = useToolsHelper();
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState<boolean>(false);

  const handleCloseContact = () => {
    const pathname = `/accountLists/${accountListId}/${pageUrl}/`;
    push(pathname);
  };

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
                {showToolsHeader && (
                  <>
                    <MultiPageHeader
                      isNavListOpen={isToolDrawerOpen}
                      onNavListToggle={() =>
                        setIsToolDrawerOpen(!isToolDrawerOpen)
                      }
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
                )}
                {!showToolsHeader && children}
              </>
            }
            rightPanel={
              selectedContactId ? (
                <ContactsWrapper>
                  <DynamicContactsRightPanel onClose={handleCloseContact} />
                </ContactsWrapper>
              ) : undefined
            }
            rightOpen={typeof selectedContactId !== 'undefined'}
            rightWidth="60%"
            headerHeight={'0px'}
          />
        ) : (
          <Loading loading data-testid="ToolsWrapperLoading" />
        )}
      </Box>
    </>
  );
};
