import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { ErgonoMockShape } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import theme from '../../../theme';
import FixCommitmentInfo from './FixCommitmentInfo';
import { mockInvalidStatusesResponse } from './FixCommitmentInfoMocks';
import { GetInvalidStatusesQuery } from './GetInvalidStatuses.generated';

jest.setTimeout(8000);

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

const accountListId = 'test121';
const router = {
  pathname: '/accountLists/[accountListId]/tools/fixCommitmentInfo',
  query: { accountListId: accountListId },
  push: jest.fn(),
};

const setContactFocus = jest.fn();

const Components = ({
  mockNodes = mockInvalidStatusesResponse,
}: {
  mockNodes?: ErgonoMockShape[];
}) => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <TestWrapper>
          <GqlMockedProvider<{
            GetInvalidStatuses: GetInvalidStatusesQuery;
          }>
            mocks={{
              GetInvalidStatuses: {
                contacts: {
                  nodes: mockNodes,
                },
              },
            }}
          >
            <VirtuosoMockContext.Provider
              value={{ viewportHeight: 1000, itemHeight: 100 }}
            >
              <FixCommitmentInfo
                accountListId={accountListId}
                setContactFocus={setContactFocus}
              />
            </VirtuosoMockContext.Provider>
          </GqlMockedProvider>
        </TestWrapper>
      </TestRouter>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('FixCommitmentContact', () => {
  it('default with test data', async () => {
    const { getByText, debug } = render(<Components />);
    debug(undefined, Infinity);
    await waitFor(() => {
      expect(getByText('Fix Commitment Info')).toBeInTheDocument();
      expect(
        getByText('You have 2 partner statuses to confirm.'),
      ).toBeInTheDocument();
    });
  });

  it('has correct styles', async () => {
    const { getByTestId, debug } = render(<Components />);
    debug(undefined, Infinity);
    const home = getByTestId('Home');

    expect(home.classList.contains('css-1ruq7cl-outer')).toBe(true);
    // expect(home).toHaveClass(' MuiBox-root css-1ruq7cl-outer');
    expect(home).toHaveStyle('display: flex');

    await waitFor(() => {
      const container = getByTestId('Container');
      const divider = getByTestId('Divider');
      const description = getByTestId('Description');

      expect(container.className).toEqual(expect.stringContaining('container'));
      expect(container).toHaveStyle('width: 70%');

      expect(divider.className).toEqual(expect.stringContaining('divider'));
      expect(divider).toHaveStyle('margin-top: 16px');

      expect(description.className).toEqual(
        expect.stringContaining('descriptionBox'),
      );

      expect(description).toHaveStyle('margin-bottom: 16px');
    });
  });

  it('Shows hide modal', async () => {
    const { getAllByTestId, queryByText, getByText } = render(<Components />);

    await waitFor(() => {
      userEvent.click(getAllByTestId('hideButton')[0]);
    });

    expect(
      getByText(
        'Are you sure you wish to hide Tester 1? Hiding a contact in MPDX actually sets the contact status to "Never Ask".',
      ),
    ).toBeInTheDocument();

    userEvent.click(getAllByTestId('action-button')[0]);

    expect(
      queryByText(
        'Are you sure you wish to hide Tester 1? Hiding a contact in MPDX actually sets the contact status to "Never Ask".',
      ),
    ).not.toBeInTheDocument();
  });

  it('calls update function', async () => {
    const { getAllByTestId, queryByText } = render(<Components />);

    await waitFor(() => {
      userEvent.click(getAllByTestId('confirmButton')[0]);
    });

    await waitFor(() =>
      expect(queryByText('Tester 1')).not.toBeInTheDocument(),
    );
  });

  it('opens contact drawer to donations tab', async () => {
    const { getAllByTestId } = render(<Components />);

    await waitFor(() => {
      userEvent.click(getAllByTestId('goToContactsButton')[0]);
    });
    await waitFor(() => {
      expect(setContactFocus).toHaveBeenCalled();
    });
  });
});
