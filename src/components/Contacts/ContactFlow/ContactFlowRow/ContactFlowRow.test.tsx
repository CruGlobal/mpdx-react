import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestWrapper from '__tests__/util/TestWrapper';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { ContactRowFragment } from '../../ContactRow/ContactRow.generated';
import {
  ContactsContext,
  ContactsType,
} from '../../ContactsContext/ContactsContext';
import { ContactFlowRow } from './ContactFlowRow';

const accountListId = 'abc';
const status = StatusEnum.PartnerFinancial;
const contact = {
  id: '123',
  name: 'Test Name',
  starred: true,
  avatar: 'avatar.jpg',
  pledgeAmount: 100,
  pledgeCurrency: 'USD',
  pledgeReceived: false,
  uncompletedTasksCount: 0,
} as ContactRowFragment;

const getContactHrefObject = jest.fn().mockReturnValue({
  pathname: '/accountLists/[accountListId]/contacts/[contactId]',
  query: { accountListId, contactId: contact.id },
});

const Components = () => (
  <DndProvider backend={HTML5Backend}>
    <ThemeProvider theme={theme}>
      <TestWrapper>
        <ContactsContext.Provider
          value={
            {
              getContactHrefObject,
            } as unknown as ContactsType
          }
        >
          <ContactFlowRow
            accountListId={accountListId}
            contact={contact}
            status={status}
            contactPhase={PhaseEnum.PartnerCare}
          />
        </ContactsContext.Provider>
      </TestWrapper>
    </ThemeProvider>
  </DndProvider>
);
describe('ContactFlowRow', () => {
  it('should display contact name and status', () => {
    const { getByText, getByTitle } = render(<Components />);
    expect(getByText('Test Name')).toBeInTheDocument();
    expect(getByTitle('Unstar')).toBeInTheDocument();
  });

  it('should call contact selected function', () => {
    const { getByRole } = render(<Components />);
    const contactName = getByRole('link', { name: 'Test Name' });
    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/contacts/${contact.id}`,
    );
  });
});
