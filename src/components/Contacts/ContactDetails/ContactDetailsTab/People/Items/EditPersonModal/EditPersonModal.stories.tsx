import React, { ReactElement, useState } from 'react';
import { Box, Button, MuiThemeProvider } from '@material-ui/core';
import { gqlMock } from '../../../../../../../../__tests__/util/graphqlMocking';
import { ContactDetailsTabQuery } from '../../../ContactDetailsTab.generated';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../ContactPeople.generated';
import theme from '../../../../../../../theme';
import { EditPersonModal } from './EditPersonModal';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/People/Items/EditPersonModal',
  component: EditPersonModal,
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
        <EditPersonModal
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
