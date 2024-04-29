import React, { ReactElement, useState } from 'react';
import { Box, Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { gqlMock } from '__tests__/util/graphqlMocking';
import theme from '../../../../../../../theme';
import { ContactDetailsTabQuery } from '../../../ContactDetailsTab.generated';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../ContactPeople.generated';
import { PersonModal } from './PersonModal';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/People/Items/PersonModal',
  component: PersonModal,
};

export const Default = (): ReactElement => {
  const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc);
  const accountListId = '123';
  const contactId = '321';
  const [modalOpen, setModalOpen] = useState(false);

  const mockPerson: ContactDetailsTabQuery['contact']['people']['nodes'][0] =
    mock.people.nodes[0];

  return (
    <ThemeProvider theme={theme}>
      <Box m={2}>
        {modalOpen ? (
          <PersonModal
            person={mockPerson}
            contactId={contactId}
            accountListId={accountListId}
            handleClose={() => setModalOpen(false)}
          />
        ) : null}
        <Button color="primary" onClick={() => setModalOpen(true)}>
          Open Modal
        </Button>
      </Box>
    </ThemeProvider>
  );
};
