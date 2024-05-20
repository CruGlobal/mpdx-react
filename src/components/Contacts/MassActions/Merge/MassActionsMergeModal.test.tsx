import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { queryByText, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  ContactsContext,
  ContactsProvider,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { GetContactsForMergingQuery } from './MassActionsMerge.generated';
import { MassActionsMergeModal } from './MassActionsMergeModal';

const handleClose = jest.fn();
const accountListId = '123';

const mocks = {
  GetContactsForMerging: {
    contacts: {
      nodes: [
        {
          id: 'contact-1',
          avatar: 'https://mpdx.org/images/avatar.png',
          name: 'Doe, John',
          createdAt: '2022-09-06T00:00:00-05:00',
          status: null,
          primaryAddress: {
            id: 'address-1',
            street: '123 Main St',
            city: 'Orlando',
            state: 'FL',
            postalCode: '32832',
            source: 'MPDX',
          },
        },
        {
          id: 'contact-2',
          avatar: 'https://mpdx.org/images/avatar.png',
          name: 'Doe, Jane',
          createdAt: '2022-04-02T00:00:00-05:00',
          status: StatusEnum.NeverContacted,
          primaryAddress: {
            id: 'address-2',
            street: '123 First Ave',
            city: 'Orlando',
            state: 'FL',
            postalCode: '32832',
            source: 'MPDX',
          },
        },
      ],
    },
  },
};

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

interface MassActionsMergeModalWrapperProps {
  mutationSpy?: () => void;
}

const MassActionsMergeModalWrapper: React.FC<
  MassActionsMergeModalWrapperProps
> = ({ mutationSpy }) => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
        <GqlMockedProvider<{
          GetContactsForMerging: GetContactsForMergingQuery;
        }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <ContactsProvider
            activeFilters={{}}
            setActiveFilters={() => {}}
            starredFilter={{}}
            setStarredFilter={() => {}}
            filterPanelOpen={false}
            setFilterPanelOpen={() => {}}
            contactId={[]}
            searchTerm={''}
          >
            <MassActionsMergeModal
              accountListId={accountListId}
              ids={['contact-1', 'contact-2']}
              handleClose={handleClose}
            />
          </ContactsProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('MassActionsMergeModal', () => {
  it('should render modal', () => {
    const { getByText } = render(<MassActionsMergeModalWrapper />);

    expect(getByText('Merge Contacts')).toBeInTheDocument();
  });

  it('should close modal', () => {
    const { getByLabelText } = render(<MassActionsMergeModalWrapper />);

    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should select clicked contact', async () => {
    const { queryAllByTestId } = render(<MassActionsMergeModalWrapper />);

    await waitFor(() =>
      expect(queryAllByTestId('MassActionsMergeModalContact')).toHaveLength(2),
    );

    const contacts = queryAllByTestId('MassActionsMergeModalContact');
    expect(queryByText(contacts[0], 'Use This One')).toBeInTheDocument();
    expect(queryByText(contacts[1], 'Use This One')).not.toBeInTheDocument();

    userEvent.click(contacts[1]);

    expect(queryByText(contacts[0], 'Use This One')).not.toBeInTheDocument();
    expect(queryByText(contacts[1], 'Use This One')).toBeInTheDocument();
  });

  it('should merge contacts', async () => {
    const mutationSpy = jest.fn();

    const { getByText, queryAllByTestId } = render(
      <SnackbarProvider>
        <MassActionsMergeModalWrapper mutationSpy={mutationSpy} />
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(queryAllByTestId('MassActionsMergeModalContact')).toHaveLength(2),
    );

    userEvent.click(getByText('Merge'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contacts merged!', {
        variant: 'success',
      }),
    );

    const mergeCalls = mutationSpy.mock.calls
      .map(([{ operation }]) => operation)
      .filter(({ operationName }) => operationName === 'MassActionsMerge');
    expect(mergeCalls).toHaveLength(1);
    expect(mergeCalls[0].variables).toEqual({
      loserContactIds: ['contact-2'],
      winnerContactId: 'contact-1',
    });
  });

  it('calls function to deselect contacts when merge is complete', async () => {
    const deselectAll = jest.fn();
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider<{
            GetContactsForMerging: GetContactsForMergingQuery;
          }>
            mocks={mocks}
          >
            <ContactsContext.Provider
              value={{ deselectAll } as unknown as ContactsType}
            >
              <MassActionsMergeModal
                accountListId={accountListId}
                ids={['contact-1', 'contact-2']}
                handleClose={handleClose}
              />
            </ContactsContext.Provider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    const button = getByRole('button', { name: 'Merge' });
    expect(button).toBeInTheDocument();
    await waitFor(() => userEvent.click(button));
    await waitFor(() => {
      expect(deselectAll).toHaveBeenCalled();
    });
  });

  it('should show contact error message if 9 contacts or over', async () => {
    const { getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider<{
            GetContactsForMerging: GetContactsForMergingQuery;
          }>
            mocks={mocks}
          >
            <ContactsContext.Provider
              value={{ deselectAll: jest.fn() } as unknown as ContactsType}
            >
              <MassActionsMergeModal
                accountListId={accountListId}
                ids={[
                  'contact-1',
                  'contact-2',
                  'contact-3',
                  'contact-4',
                  'contact-5',
                  'contact-6',
                  'contact-7',
                  'contact-8',
                  'contact-9',
                ]}
                handleClose={handleClose}
              />
            </ContactsContext.Provider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(
        getByText('You can only merge up to 8 contacts at a time.'),
      ).toBeInTheDocument();

      expect(
        queryByText('This action cannot be undone!'),
      ).not.toBeInTheDocument();
    });
  });

  it('should not show contact error message if 8 contacts', async () => {
    const { getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider<{
            GetContactsForMerging: GetContactsForMergingQuery;
          }>
            mocks={mocks}
          >
            <ContactsContext.Provider
              value={{ deselectAll: jest.fn() } as unknown as ContactsType}
            >
              <MassActionsMergeModal
                accountListId={accountListId}
                ids={[
                  'contact-1',
                  'contact-2',
                  'contact-3',
                  'contact-4',
                  'contact-5',
                  'contact-6',
                  'contact-7',
                  'contact-8',
                ]}
                handleClose={handleClose}
              />
            </ContactsContext.Provider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(
        queryByText('You can only merge up to 8 contacts at a time.'),
      ).not.toBeInTheDocument();

      expect(getByText('This action cannot be undone!')).toBeInTheDocument();
    });
  });
});
