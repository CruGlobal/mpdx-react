import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { ContactRowFragment } from '../../ContactRow/ContactRow.generated';
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

const router = {
  pathname: '/accountLists/[accountListId]/contacts/[...contactId]',
  query: {
    accountListId,
    contactId: ['00000000-0000-0000-0000-000000000000'],
  },
};

const Components = () => (
  <DndProvider backend={HTML5Backend}>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider>
          <ContactPanelProvider>
            <ContactFlowRow
              accountListId={accountListId}
              contact={contact}
              status={status}
              contactPhase={PhaseEnum.PartnerCare}
            />
          </ContactPanelProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  </DndProvider>
);

describe('ContactFlowRow', () => {
  it('should display contact name and status', () => {
    const { getByText, getByTitle } = render(<Components />);
    expect(getByText('Test Name')).toBeInTheDocument();
    expect(getByTitle('Unstar')).toBeInTheDocument();
  });

  it('should render a link to the contact', () => {
    const { getByRole } = render(<Components />);
    const contactName = getByRole('link', { name: 'Test Name' });
    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/contacts/${contact.id}`,
    );
  });
});
