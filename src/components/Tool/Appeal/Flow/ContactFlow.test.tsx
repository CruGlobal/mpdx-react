import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { appealInfo } from '../appealMockData';
import { ContactFlow, ContactFlowProps } from './ContactFlow';

const accountListId = 'abc';
const onContactSelected = jest.fn();
const contact = {
  id: '123',
  name: 'Test Person',
  status: StatusEnum.NotInterested,
  primaryAddress: {
    id: 'address',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
  },
};
const router = {
  query: { accountListId },
  isReady: true,
};

const initialProps = {
  accountListId,
  selectedFilters: {},
  onContactSelected,
  searchTerm: '',
  appealInfo: {
    appeal: appealInfo,
  },
  appealInfoLoading: false,
};

const mutationSpy = jest.fn();

const Components = (props: ContactFlowProps) => (
  <SnackbarProvider>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<{ Contacts: ContactsQuery }>
            mocks={{
              Contacts: {
                contacts: {
                  nodes: [contact],
                  pageInfo: { endCursor: 'Mg', hasNextPage: false },
                  totalCount: 1,
                },
              },
            }}
            onCall={mutationSpy}
          >
            <AppealsWrapper>
              <VirtuosoMockContext.Provider
                value={{ viewportHeight: 300, itemHeight: 100 }}
              >
                <ContactFlow {...props} />
              </VirtuosoMockContext.Provider>
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>
    </DndProvider>
  </SnackbarProvider>
);

describe('ContactFlow', () => {
  it('default', async () => {
    const { getByText, findByText } = render(<Components {...initialProps} />);

    expect(await findByText('Excluded')).toBeInTheDocument();
    expect(getByText('Asked')).toBeInTheDocument();
    expect(getByText('Committed')).toBeInTheDocument();
    expect(getByText('Received‌⁠')).toBeInTheDocument();
    expect(getByText('Given')).toBeInTheDocument();
  });

  it('Drag and drop', async () => {
    const { getAllByText, getByTestId } = render(
      <Components {...initialProps} />,
    );

    await waitFor(() =>
      expect(getAllByText(contact.name)[1]).toBeInTheDocument(),
    );

    const contactBox = getAllByText(contact.name)[1];
    const column = within(getByTestId('contactsFlowExcluded')).getByTestId(
      'contact-flow-drop-zone',
    );

    fireEvent.dragStart(contactBox);
    fireEvent.dragEnter(column);
    fireEvent.dragOver(column);
    fireEvent.drop(column);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateContactOther'),
    );
  });
});
