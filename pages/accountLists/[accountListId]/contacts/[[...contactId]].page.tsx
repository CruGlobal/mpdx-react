import Head from 'next/head';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { ContactsLeftPanel } from 'src/components/Contacts/ContactsLeftPanel/ContactsLeftPanel';
import { ContactsMainPanel } from 'src/components/Contacts/ContactsMainPanel/ContactsMainPanel';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import {
  TableViewModeEnum,
  headerHeight,
} from 'src/components/Shared/Header/ListHeader';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { ContactsWrapper } from './ContactsWrapper';

const Contacts: React.FC = ({}) => {
  const { t } = useTranslation();
  const {
    accountListId,
    filterPanelOpen,
    contactDetailsOpen,
    viewMode,
    setContactFocus,
  } = useContext(ContactsContext) as ContactsType;
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {appName} |{' '}
          {viewMode === TableViewModeEnum.Flows
            ? t('Contact Flows')
            : viewMode === TableViewModeEnum.Map
            ? t('Contacts Map')
            : t('Contacts')}
        </title>
      </Head>
      {accountListId ? (
        <SidePanelsLayout
          leftPanel={<ContactsLeftPanel />}
          leftOpen={filterPanelOpen}
          leftWidth="290px"
          mainContent={<ContactsMainPanel />}
          rightPanel={
            <DynamicContactsRightPanel
              onClose={() => setContactFocus(undefined, true)}
            />
          }
          rightOpen={contactDetailsOpen}
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

export default ContactsPage;

export const getServerSideProps = loadSession;
