import { Box, styled } from '@material-ui/core';
import React, { useContext } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import _ from 'lodash';
import { SidePanelsLayout } from '../Layouts/SidePanelsLayout';
import {
  ContactsPageContext,
  ContactsPageType,
} from '../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { TableViewModeEnum } from '../Shared/Header/ListHeader';
import Loading from '../Loading';
import { ContactsMainPanel } from './ContactsMainPanel/ContactsMainPanel';
import { ContactsLeftPanel } from './ContactsLeftPanel/ContactsLeftPanel';
import { ContactsRightPanel } from './ContactsRightPanel/ContactsRightPanel';
import { ContactFlowDragLayer } from './ContactFlow/ContactFlowDragLayer/ContactFlowDragLayer';
import { useAccountListId } from 'src/hooks/useAccountListId';

const WhiteBackground = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

export const ContactsContainer: React.FC = ({}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { filterPanelOpen, contactDetailsOpen, viewMode } = useContext(
    ContactsPageContext,
  ) as ContactsPageType;

  return (
    <>
      <Head>
        <title>
          MPDX |{' '}
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
              rightPanel={<ContactsRightPanel />}
              rightOpen={contactDetailsOpen}
              rightWidth="60%"
            />
          </WhiteBackground>
        </DndProvider>
      ) : (
        <Loading loading />
      )}
    </>
  );
};
