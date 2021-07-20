import React, { ReactElement, useState } from 'react';
import { Box, Button, MuiThemeProvider } from '@material-ui/core';
import { gqlMock } from '../../../../../../../../__tests__/util/graphqlMocking';
import { ContactDetailsTabQuery } from '../../../ContactDetailsTab.generated';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../ContactPeople.generated';
import theme from '../../../../../../../theme';
import { EditContactDetailsModal } from './EditContactDetailsModal';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/People/Items/EditContactDetailsModal',
  component: EditContactDetailsModal,
};

export const Default = (): ReactElement => {
  const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc);

  const [modalOpen, setModalOpen] = useState(false);
  const contactId = '123';
  const accountListId = 'abc';

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
        <EditContactDetailsModal
          accountListId={accountListId}
          contact={mockContact}
          isOpen={modalOpen}
          handleClose={() => setModalOpen(false)}
        />
        <Button color="primary" onClick={() => setModalOpen(true)}>
          Open Modal
        </Button>
      </Box>
    </MuiThemeProvider>
  );
};
