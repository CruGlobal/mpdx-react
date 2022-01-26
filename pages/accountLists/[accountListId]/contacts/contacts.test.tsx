import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import { GroupItemContent } from 'react-virtuoso';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../../__tests__/util/TestRouter';
import theme from '../../../../src/theme';
import { useMassSelection } from '../../../../src/hooks/useMassSelection';
import { ListHeaderCheckBoxState } from '../../../../src/components/Shared/Header/ListHeader';
import Contacts from './[[...contactId]].page';
import { ContactsQuery } from './Contacts.generated';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

const contact = { id: '1', name: 'Test Person', pledgeCurrency: 'USD' };

jest.mock('../../../../src/hooks/useMassSelection');

(useMassSelection as jest.Mock).mockReturnValue({
  selectionType: ListHeaderCheckBoxState.unchecked,
  isRowChecked: jest.fn(),
  toggleSelectAll: jest.fn(),
  toggleSelectionById: jest.fn(),
});

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

jest.mock('react-virtuoso', () => ({
  // eslint-disable-next-line react/display-name
  GroupedVirtuoso: ({
    itemContent,
  }: {
    itemContent: GroupItemContent<undefined>;
  }) => {
    return <div>{itemContent(0, 0, undefined)}</div>;
  },
}));

it('should render list of people', async () => {
  const { findByTestId, getByText } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<ContactsQuery>
          mocks={{
            Contacts: {
              contacts: {
                nodes: [contact],
                pageInfo: { endCursor: 'Mg', hasNextPage: false },
              },
            },
          }}
        >
          <Contacts />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );

  await waitFor(() => expect(getByText('Test Person')).toBeInTheDocument());
  expect(await findByTestId('rowButton')).toHaveTextContent(contact.name);
});

it('should render contact detail panel', async () => {
  const { findByTestId, findAllByRole, getByText } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<ContactsQuery>
          mocks={{
            Contacts: {
              contacts: {
                nodes: [contact],
                pageInfo: { endCursor: 'Mg', hasNextPage: false },
              },
            },
          }}
        >
          <Contacts />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );
  await waitFor(() => expect(getByText('Test Person')).toBeInTheDocument());
  const row = await findByTestId('rowButton');

  userEvent.click(row);

  const detailsTabList = (await findAllByRole('tablist'))[0];

  expect(detailsTabList).toBeInTheDocument();
});
