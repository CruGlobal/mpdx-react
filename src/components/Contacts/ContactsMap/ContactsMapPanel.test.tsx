import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { StatusEnum } from '../../../../graphql/types.generated';
import TestRouter from '../../../../__tests__/util/TestRouter';
import theme from '../../../../src/theme';
import { ContactsPageProvider } from '../../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { ContactsMapPanel } from './ContactsMapPanel';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

const data = [
  {
    id: 'contact',
    name: 'Contact One',
    avatar: '',
    status: StatusEnum.PartnerFinancial,
    lat: 1.0,
    lng: 1.0,
    street: '1 Contact Street',
  },
  {
    id: 'contact2',
    name: 'Contact Two',
    avatar: '',
    status: StatusEnum.PartnerSpecial,
  },
  {
    id: 'contact3',
    name: 'Contact Three',
    avatar: '',
  },
];

const selected = { id: '', name: '', avatar: '' };
const setSelected = jest.fn();
const panTo = jest.fn();
const onClose = jest.fn();

describe('ContactsMapPanel', () => {
  it('should list the contacts sorted by properly', async () => {
    const { getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<ContactsQuery>>
            <ContactsPageProvider>
              <ContactsMapPanel
                data={data}
                selected={selected}
                setSelected={setSelected}
                panTo={panTo}
                onClose={onClose}
              />
            </ContactsPageProvider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByText('Partner - Financial')).toBeInTheDocument(),
    );
    expect(getByText('Contact One')).toBeInTheDocument();
    expect(getByText('1 Contact Street')).toBeInTheDocument();
    expect(queryByText('Partner - Special')).not.toBeInTheDocument();
    expect(getByText('No Primary Address Set')).toBeInTheDocument();
  });
});
