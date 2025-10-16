import React from 'react';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { DynamicContactFlow } from '../ContactFlow/DynamicContactFlow';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';
import { DynamicContactsList } from '../ContactsList/DynamicContactsList';
import { DynamicContactsMap } from '../ContactsMap/DynamicContactsMap';
import { ContactsMainPanelHeader } from './ContactsMainPanelHeader';

export const ContactsMainPanel: React.FC = () => {
  const { accountListId, viewMode, userOptionsLoading } = React.useContext(
    ContactsContext,
  ) as ContactsType;

  return (
    <>
      <ContactsMainPanelHeader />
      {!userOptionsLoading &&
        (viewMode === TableViewModeEnum.List ? (
          <DynamicContactsList />
        ) : viewMode === TableViewModeEnum.Flows ? (
          <DynamicContactFlow accountListId={accountListId ?? ''} />
        ) : (
          <DynamicContactsMap />
        ))}
    </>
  );
};
