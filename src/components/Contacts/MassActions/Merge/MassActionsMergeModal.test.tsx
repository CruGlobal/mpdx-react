import React from 'react';
import { render, waitFor, queryByText } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { MassActionsMergeModal } from './MassActionsMergeModal';
import { GetContactsForMergingQuery } from './MassActionsMerge.generated';

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
          status: 'NEVER_CONTACTED',
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

describe('ExportModal', () => {
  it('should render modal', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetContactsForMergingQuery> mocks={mocks}>
          <MassActionsMergeModal
            accountListId={accountListId}
            ids={['contact-1', 'contact-2']}
            handleClose={handleClose}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByText('Merge Contacts')).toBeInTheDocument();
  });

  it('should close modal', () => {
    const { getByLabelText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetContactsForMergingQuery> mocks={mocks}>
          <MassActionsMergeModal
            accountListId={accountListId}
            ids={['contact-1', 'contact-2']}
            handleClose={handleClose}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should select clicked contact', async () => {
    const { queryAllByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetContactsForMergingQuery> mocks={mocks}>
          <MassActionsMergeModal
            accountListId={accountListId}
            ids={['contact-1', 'contact-2']}
            handleClose={handleClose}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

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
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<GetContactsForMergingQuery>
            mocks={mocks}
            onCall={mutationSpy}
          >
            <MassActionsMergeModal
              accountListId={accountListId}
              ids={['contact-1', 'contact-2']}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
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
});
