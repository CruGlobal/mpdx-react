import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { ErgonoMockShape } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  fireEvent,
  render,
  waitFor,
} from '__tests__/util/testingLibraryReactMock';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { StatusEnum } from 'src/graphql/types.generated';
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
const mutationSpy = jest.fn();

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
              LoadConstants: LoadConstantsQuery;
              InvalidStatuses: InvalidStatusesQuery;
            }>
              mocks={{
                LoadConstants: loadConstantsMockData,
                InvalidStatuses: {
                  contacts: {
                    nodes: mockNodes,
                    totalCount: 2,
                  },
                },
              }}
              onCall={mutationSpy}
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

describe('FixCommitmentInfo', () => {
  beforeEach(() => {
    setContactFocus.mockClear();
  });

  it('default with test data', async () => {
    const { findByText, getAllByText } = render(<Components />);
    // await findByText('You have 2 partner statuses to confirm.');
    expect(
      await findByText('You have 2 partner statuses to confirm.'),
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
    const description = await findByTestId('Description');

    expect(container.className).toEqual(expect.stringContaining('container'));
    expect(container).toHaveStyle('width: calc(100% + 24px);');

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
    const {
      getAllByTestId,
      queryByText,
      findByText,
      findAllByTestId,
      getByText,
    } = render(<Components />);

    userEvent.click((await findAllByTestId('confirmButton'))[0]);

    expect(
      await findByText(
        'Are you sure you wish to update Tester 1 commitment info?',
      ),
    ).toBeInTheDocument(),
      userEvent.click(getByText('Yes'));

    await waitFor(() =>
      expect(queryByText('Tester 1')).not.toBeInTheDocument(),
    );

    const status = getAllByTestId('pledgeStatus-input')[0];
    fireEvent.change(status, {
      target: { value: StatusEnum.PartnerSpecial },
    });
    expect(status).toHaveValue(StatusEnum.PartnerSpecial);

    userEvent.click((await findAllByTestId('confirmButton'))[0]);

    expect(
      await findByText(
        'Are you sure you wish to update Tester 2 commitment info?',
      ),
    ).toBeInTheDocument();
    userEvent.click(await findByText('Yes'));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateStatus', {
        attributes: { status: StatusEnum.PartnerSpecial },
      }),
    );
  });

  it('hides contact', async () => {
    const { getAllByTestId, queryByText, findByText, findAllByTestId } = render(
      <Components />,
    );
    userEvent.click((await findAllByTestId('hideButton'))[1]);

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
