import Head from 'next/head';
import React, { JSXElementConstructor, ReactElement, useState } from 'react';
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
import {
  ContactPanelProvider,
  useContactPanel,
} from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { PageContentWrapper } from '../settings/styledComponents';
import { useToolsHelper } from './useToolsHelper';

interface ToolsWrapperProps {
  pageTitle?: string;
  pageUrl: string;
  selectedMenuId?: string;
  showToolsHeader?: boolean;
  children: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
}

const ToolsPageContent: React.FC<ToolsWrapperProps> = ({
  pageTitle,
  selectedMenuId,
  children,
}) => {
  const { accountListId } = useToolsHelper();
  const { isOpen } = useContactPanel();
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState<boolean>(false);

  return accountListId ? (
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
      rightPanel={isOpen ? <DynamicContactsRightPanel /> : undefined}
      rightOpen={isOpen}
      rightWidth="60%"
      headerHeight={'0px'}
    />
  ) : (
    <Loading loading data-testid="ToolsWrapperLoading" />
  );
};

export const ToolsWrapper: React.FC<ToolsWrapperProps> = (props) => {
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>{`${appName} | ${props.pageTitle}`}</title>
      </Head>
      <ContactPanelProvider>
        <ToolsPageContent {...props} />
      </ContactPanelProvider>
    </>
  );
};
