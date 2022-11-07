import React, { ReactElement, useState } from 'react';
import { Box, Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { gqlMock } from '../../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../../theme';
import { EditContactDetailsModal } from './EditContactDetailsModal';
import {
  ContactDetailsFragment,
  ContactDetailsFragmentDoc,
} from './EditContactDetails.generated';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/People/Items/EditContactDetailsModal',
  component: EditContactDetailsModal,
};

export const Default = (): ReactElement => {
  const mock = gqlMock<ContactDetailsFragment>(ContactDetailsFragmentDoc);

  const [modalOpen, setModalOpen] = useState(false);
  const contactId = '123';
  const accountListId = 'abc';

  const mockContact: ContactDetailsFragment = {
    name: 'test person',
    id: contactId,
    people: mock.people,
    primaryPerson: mock.primaryPerson,
    greeting: 'Hello test',
    envelopeGreeting: 'Dear Test',
    sendNewsletter: mock.sendNewsletter,
    addresses: mock.addresses,
  };

  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
};
