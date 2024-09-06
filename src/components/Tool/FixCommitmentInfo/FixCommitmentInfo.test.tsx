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
import { InvalidStatusesQuery } from './GetInvalidStatuses.generated';

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
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 1000, itemHeight: 100 }}
          >
            <GqlMockedProvider<{
              InvalidStatuses: InvalidStatusesQuery;
            }>
              mocks={{
                InvalidStatuses: {
                  contacts: {
                    nodes: mockNodes,
                    totalCount: 2,
                  },
                },
              }}
            >
              <FixCommitmentInfo
                accountListId={accountListId}
                setContactFocus={setContactFocus}
              />
            </GqlMockedProvider>
          </VirtuosoMockContext.Provider>
        </TestWrapper>
      </TestRouter>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('FixCommitmentContact', () => {
  beforeEach(() => {
    setContactFocus.mockClear();
  });

  it('default with test data', async () => {
    const { getByText, getAllByText, findByText } = render(<Components />);
    await findByText('Fix Commitment Info');
    expect(getByText('Fix Commitment Info')).toBeInTheDocument();

    expect(
      getByText('You have 2 partner statuses to confirm.'),
    ).toBeInTheDocument();
    expect(getAllByText('Current: Partner - Financial $1 Weekly')).toHaveLength(
      2,
    );
  });

  it('has correct styles', async () => {
    const { getByTestId, findByTestId } = render(<Components />);
    const home = getByTestId('Home');

    expect(home).toHaveStyle('display: flex');
    const container = await findByTestId('Container');
    const divider = await findByTestId('Divider');
    const description = await findByTestId('Description');

    expect(container.className).toEqual(expect.stringContaining('container'));
    expect(container).toHaveStyle('width: calc(100% + 24px);');

    expect(divider.className).toEqual(expect.stringContaining('divider'));
    expect(divider).toHaveStyle('margin-top: 16px');

    expect(description.className).toEqual(
      expect.stringContaining('descriptionBox'),
    );

    expect(description).toHaveStyle('margin-bottom: 16px');
  });

  it('Shows hide modal', async () => {
    const { getAllByTestId, queryByText, getByText, findAllByTestId } = render(
      <Components />,
    );

    userEvent.click((await findAllByTestId('hideButton'))[0]);

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

  it('updates commitment info', async () => {
    const { getAllByTestId, queryByText, findByText, findAllByTestId } = render(
      <Components />,
    );

    userEvent.click((await findAllByTestId('confirmButton'))[0]);

    expect(
      await findByText(
        'Are you sure you wish to update Tester 1 commitment info?',
      ),
    ).toBeInTheDocument(),
      userEvent.click(getAllByTestId('action-button')[1]);

    await waitFor(() =>
      expect(queryByText('Tester 1')).not.toBeInTheDocument(),
    );

    userEvent.click((await findAllByTestId('confirmButton'))[0]);

    expect(
      await findByText(
        'Are you sure you wish to update Tester 2 commitment info?',
      ),
    ).toBeInTheDocument();

    userEvent.click((await findAllByTestId('hideButton'))[0]);

    expect(
      await findByText(
        `Are you sure you wish to hide Tester 2? Hiding a contact in MPDX actually sets the contact status to "Never Ask".`,
      ),
    ).toBeInTheDocument();

    userEvent.click(getAllByTestId('action-button')[1]);

    await waitFor(() =>
      expect(queryByText('Tester 2')).not.toBeInTheDocument(),
    );
  });

  it('opens contact drawer to donations tab', async () => {
    const { findAllByTestId } = render(<Components />);

    userEvent.click((await findAllByTestId('hideButton'))[0]);

    userEvent.click((await findAllByTestId('contactSelect'))[0]);

    expect(setContactFocus).toHaveBeenCalled();
  });

  it('updates contact info with dontChange enum', async () => {
    const { findAllByTestId, findByText, getAllByTestId, queryByText } = render(
      <Components />,
    );

    userEvent.click((await findAllByTestId('doNotChangeButton'))[0]);

    expect(
      await findByText(
        "Are you sure you wish to leave Tester 1's commitment information unchanged?",
      ),
    ).toBeInTheDocument();

    userEvent.click(getAllByTestId('action-button')[1]);

    await waitFor(() =>
      expect(queryByText('Tester 1')).not.toBeInTheDocument(),
    );
  });
});
