import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestWrapper from '__tests__/util/TestWrapper';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { ContactRowFragment } from '../../ContactRow/ContactRow.generated';
import {
  ContactsContext,
  ContactsType,
} from '../../ContactsContext/ContactsContext';
import { ContactFlowRow } from './ContactFlowRow';

const accountListId = 'abc';
const status = {
  id: StatusEnum.PartnerFinancial,
  value: 'Partner - Financial',
};
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

const getContactUrl = jest.fn().mockReturnValue({
  contactUrl: `/contacts/${contact.id}`,
});

const Components = () => (
  <DndProvider backend={HTML5Backend}>
    <ThemeProvider theme={theme}>
      <TestWrapper>
        <ContactsContext.Provider
          value={
            {
              getContactUrl,
            } as unknown as ContactsType
          }
        >
          <ContactFlowRow
            accountListId={accountListId}
            contact={contact}
            status={status}
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
    expect(getByTitle('Filled Star Icon')).toBeInTheDocument();
  });

  it('should call contact selected function', () => {
    const { getByRole } = render(<Components />);
    const contactName = getByRole('link', { name: 'Test Name' });
    expect(contactName).toBeInTheDocument();
    expect(contactName).toHaveAttribute('href', `/contacts/${contact.id}`);
  });
});
