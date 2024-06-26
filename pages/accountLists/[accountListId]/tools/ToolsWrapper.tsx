import Head from 'next/head';
import React, { JSXElementConstructor, ReactElement } from 'react';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
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
  children,
  styles,
}) => {
  const { appName } = useGetAppSettings();
  const { accountListId, selectedContactId, handleSelectContact } =
    useToolsHelper();

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
          leftOpen={false}
          leftWidth="290px"
          mainContent={children}
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
