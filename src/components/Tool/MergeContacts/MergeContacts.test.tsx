import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { GetContactDuplicatesQuery } from './GetContactDuplicates.generated';
import MergeContacts from './MergeContacts';

const accountListId = '123';

const setContactFocus = jest.fn();

const mocks = {
  GetContactDuplicates: {
    contactDuplicates: {
      totalCount: 55,
      nodes: [
        {
          id: '1',
          recordOne: {
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
          recordTwo: {
            id: 'contact-2',
            avatar: 'https://mpdx.org/images/avatar.png',
            name: 'Doe, John and Nancy',
            createdAt: '2020-09-06T00:00:00-05:00',
            status: null,
            primaryAddress: {
              id: 'address-1',
              street: '123 John St',
              city: 'Orlando',
              state: 'FL',
              postalCode: '32832',
              source: 'MPDX',
            },
          },
        },
        {
          id: '2',
          recordOne: {
            id: 'contact-3',
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
          recordTwo: {
            id: 'contact-4',
            avatar: 'https://mpdx.org/images/avatar.png',
            name: 'Doe, Jane and Paul',
            createdAt: '1999-04-02T00:00:00-05:00',
            status: StatusEnum.NeverContacted,
            primaryAddress: {
              id: 'address-2',
              street: '123 Leonard Ave',
              city: 'Orlando',
              state: 'FL',
              postalCode: '32832',
              source: 'MPDX',
            },
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

interface MergeContactsWrapperProps {
  mutationSpy?: () => void;
}

const MergeContactsWrapper: React.FC<MergeContactsWrapperProps> = ({
  mutationSpy,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
        <GqlMockedProvider<{
          GetContactDuplicates: GetContactDuplicatesQuery;
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
            <MergeContacts
              accountListId={accountListId}
              setContactFocus={setContactFocus}
            />
          </ContactsProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('Tools - MergeContacts', () => {
  it('should render', async () => {
    const { findByText, getByTestId } = render(<MergeContactsWrapper />);

    expect(await findByText('Merge Contacts')).toBeInTheDocument();
    expect(getByTestId('ContactMergeDescription').textContent).toMatch(
      'You have 55 possible duplicate contacts',
    );
  });

  it('should merge contacts', async () => {
    const mutationSpy = jest.fn();

    const { getByText, queryAllByTestId, findByText, getByRole } = render(
      <SnackbarProvider>
        <MergeContactsWrapper mutationSpy={mutationSpy} />
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(queryAllByTestId('MergeContactPair')).toHaveLength(2),
    );
    const confirmButton = getByRole('button', { name: 'Confirm and Continue' });

    expect(confirmButton).toBeDisabled();
    userEvent.click(getByText('Doe, John and Nancy'));
    expect(await findByText('Use this one')).toBeInTheDocument();
    expect(confirmButton).not.toBeDisabled();

    userEvent.click(confirmButton);
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
      input: {
        winnersAndLosers: [
          {
            loserId: 'contact-1',
            winnerId: 'contact-2',
          },
        ],
      },
    });
  });

  it('should ignore contacts', async () => {
    const mutationSpy = jest.fn();

    const { queryByText, queryAllByTestId, findByText, getByRole } = render(
      <SnackbarProvider>
        <MergeContactsWrapper mutationSpy={mutationSpy} />
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(queryAllByTestId('MergeContactPair')).toHaveLength(2),
    );
    const confirmButton = getByRole('button', { name: 'Confirm and Continue' });

    expect(confirmButton).toBeDisabled();
    userEvent.click(queryAllByTestId('rightButton')[0]);
    expect(await findByText('Use this one')).toBeInTheDocument();
    userEvent.click(queryAllByTestId('ignoreButton')[0]);
    expect(queryByText('Use this one')).not.toBeInTheDocument();
    expect(confirmButton).not.toBeDisabled();
  });
});
