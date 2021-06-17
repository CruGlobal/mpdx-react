import React, { ReactElement, useState } from 'react';
import { Box, Button, MuiThemeProvider } from '@material-ui/core';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import { ContactDetailsTabQuery } from '../ContactDetailsTab.generated';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../People/ContactPeople.generated';
import theme from '../../../../../theme';
import { EditContactModal } from './EditContactModal';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/EditContactModal',
  component: EditContactModal,
};

export const Default = (): ReactElement => {
  const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc);

  const [modalOpen, setModalOpen] = useState(false);
  const contactId = '123';

  const mockContact: ContactDetailsTabQuery['contact'] = {
    name: 'test person',
    id: contactId,
    tagList: [],
    people: mock.people,
    primaryPerson: mock.primaryPerson,
  };

  return (
    <MuiThemeProvider theme={theme}>
      <Box m={2}>
        <EditContactModal
          contact={mockContact}
          isOpen={modalOpen}
          handleOpenModal={setModalOpen}
        />
        <Button color="primary" onClick={() => setModalOpen(true)}>
          Open Modal
        </Button>
      </Box>
    </MuiThemeProvider>
  );
};
