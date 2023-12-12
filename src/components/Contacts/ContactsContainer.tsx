import Head from 'next/head';
import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import {
  ContactsContext,
  ContactsType,
} from '../../../pages/accountLists/[accountListId]/contacts/ContactsContext';
import { SidePanelsLayout } from '../Layouts/SidePanelsLayout';
import Loading from '../Loading';
import { TableViewModeEnum, headerHeight } from '../Shared/Header/ListHeader';
import { ContactFlowDragLayer } from './ContactFlow/ContactFlowDragLayer/ContactFlowDragLayer';
import { ContactsLeftPanel } from './ContactsLeftPanel/ContactsLeftPanel';
import { ContactsMainPanel } from './ContactsMainPanel/ContactsMainPanel';
import { DynamicContactsRightPanel } from './ContactsRightPanel/DynamicContactsRightPanel';

const WhiteBackground = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

export const ContactsContainer: React.FC = ({}) => {
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
        <DndProvider backend={HTML5Backend}>
          <ContactFlowDragLayer />
          <WhiteBackground>
            <SidePanelsLayout
              leftPanel={<ContactsLeftPanel />}
              leftOpen={filterPanelOpen}
              leftWidth="290px"
              mainContent={<ContactsMainPanel />}
              rightPanel={
                <DynamicContactsRightPanel
                  onClose={() =>
                    setContactFocus(
                      undefined,
                      true,
                      viewMode === TableViewModeEnum.Flows,
                      viewMode === TableViewModeEnum.Map,
                    )
                  }
                />
              }
              rightOpen={contactDetailsOpen}
              rightWidth="60%"
              headerHeight={headerHeight}
            />
          </WhiteBackground>
        </DndProvider>
      ) : (
        <Loading loading />
      )}
    </>
  );
};
