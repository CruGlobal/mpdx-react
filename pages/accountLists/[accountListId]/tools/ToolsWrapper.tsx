import Head from 'next/head';
import React, { JSXElementConstructor, ReactElement, useState } from 'react';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import NavToolDrawer from 'src/components/Tool/NavToolList/NavToolDrawer';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { ContactsWrapper } from '../contacts/ContactsWrapper';
import { useToolsHelper } from './useToolsHelper';

interface ToolsWrapperProps {
  pageTitle: string;
  pageUrl: string;
  selectedMenuId: string; // for later use
  children: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
  styles?: React.ReactNode;
}

export const ToolsWrapper: React.FC<ToolsWrapperProps> = ({
  pageTitle,
  pageUrl,
  selectedMenuId,
  children,
  styles,
}) => {
  const { appName } = useGetAppSettings();
  const { accountListId, selectedContactId, handleSelectContact } =
    useToolsHelper();
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState<boolean>(false);

  const handleDrawerToggle = () => {
    setIsToolDrawerOpen(!isToolDrawerOpen);
  };

  return (
    <>
      <Head>
        <title>
          {appName} | {pageTitle}
        </title>
        {styles}
      </Head>

      {accountListId ? (
        <SidePanelsLayout
          leftOpen={isToolDrawerOpen}
          leftPanel={
            <NavToolDrawer
              selectedId={selectedMenuId}
              isOpen={isToolDrawerOpen}
              toggle={(isOpen) => setIsToolDrawerOpen(isOpen)}
            />
          }
          leftWidth="290px"
          mainContent={
            <>
              <MultiPageHeader
                isNavListOpen={true}
                onNavListToggle={handleDrawerToggle}
                title={pageTitle}
                headerType={HeaderTypeEnum.Report}
              />
              {children}
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
    </>
  );
};
