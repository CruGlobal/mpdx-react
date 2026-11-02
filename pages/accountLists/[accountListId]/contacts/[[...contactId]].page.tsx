import Head from 'next/head';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { ContactsLeftPanel } from 'src/components/Contacts/ContactsLeftPanel/ContactsLeftPanel';
import { ContactsMainPanel } from 'src/components/Contacts/ContactsMainPanel/ContactsMainPanel';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { useContactPanel } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import {
  TableViewModeEnum,
  headerHeight,
} from 'src/components/Shared/Header/ListHeader';
import { getAppName } from 'src/lib/getAppName';
import { ContactsWrapper } from './ContactsWrapper';

const Contacts: React.FC = () => {
  const { t } = useTranslation();
  const { accountListId, filterPanelOpen, setFilterPanelOpen, viewMode } =
    useContext(ContactsContext) as ContactsType;
  const appName = getAppName();
  const { isOpen } = useContactPanel();

  return (
    <>
      <Head>
        <title>
          {`${appName} | ${
            viewMode === TableViewModeEnum.Flows
              ? t('Contact Flows')
              : viewMode === TableViewModeEnum.Map
                ? t('Contacts Map')
                : t('Contacts')
          }`}
        </title>
      </Head>
      {accountListId ? (
        <SidePanelsLayout
          leftPanel={<ContactsLeftPanel />}
          leftOpen={filterPanelOpen}
          onLeftClose={() => setFilterPanelOpen(false)}
          leftWidth="290px"
          mainContent={<ContactsMainPanel />}
          rightPanel={<DynamicContactsRightPanel />}
          rightOpen={isOpen}
          rightWidth="60%"
          headerHeight={headerHeight}
        />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

const ContactsPage: React.FC = () => (
  <ContactsWrapper>
    <Contacts />
  </ContactsWrapper>
);

// No getServerSideProps so that client navigation here works offline:
// RouterGuard and DefaultAccountListRedirect handle the session and "_" checks
export default ContactsPage;
