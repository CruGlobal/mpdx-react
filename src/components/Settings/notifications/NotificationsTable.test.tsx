import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsTable } from './NotificationsTable';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../../__tests__/util/TestRouter';
import theme from '../../../../src/theme';
import { NotificationTypeTypeEnum } from '../../../../graphql/types.generated';

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
  query: { accountListId },
  isReady: true,
};
const createNotification = (type) => ({
  app: false,
  email: false,
  task: false,
  notificationType: {
    descriptionTemplate: type,
    type,
  },
});
const mocks = {
  getPreferencesNotifications: {
    notificationPreferences: {
      nodes: [
        createNotification(NotificationTypeTypeEnum.CallPartnerOncePerYear),
        createNotification(NotificationTypeTypeEnum.LargerGift),
        createNotification(NotificationTypeTypeEnum.LongTimeFrameGift),
      ],
    },
  },
};
const mutationSpy = jest.fn();
const Components = (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider onCall={mutationSpy} mocks={mocks}>
          <NotificationsTable />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('NotificationsTable', () => {
  beforeEach(() => {
    mutationSpy.mockReset();
  });
  it('Should render the Table and request data', async () => {
    const { getByTestId, queryByTestId, getByText } = render(Components);

    expect(getByTestId('skeleton-notifications')).toBeInTheDocument();

    await waitFor(() => {
      expect(queryByTestId('skeleton-notifications')).not.toBeInTheDocument(),
        expect(
          mutationSpy.mock.calls[0][0].operation.variables.accountListId,
        ).toEqual(accountListId);
      expect(mutationSpy.mock.calls[0][0].operation.operationName).toEqual(
        'getPreferencesNotifications',
      );
    });

    await waitFor(() => {
      expect(getByText('CALL_PARTNER_ONCE_PER_YEAR')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        getByTestId('CALL_PARTNER_ONCE_PER_YEAR-app-checkbox'),
      ).not.toBeChecked();
    });

    await waitFor(() => {
      expect(getByText('LARGER_GIFT')).toBeInTheDocument();
    });
  });

  it('Should select all', async () => {
    const { queryByTestId, getByTestId, getAllByRole } = render(Components);

    await waitFor(() =>
      expect(queryByTestId('skeleton-notifications')).not.toBeInTheDocument(),
    );
    expect(getAllByRole('checkbox')[0]).not.toBeChecked();
    expect(getAllByRole('checkbox')[1]).not.toBeChecked();
    expect(getAllByRole('checkbox')[2]).not.toBeChecked();
    expect(getAllByRole('checkbox')[3]).not.toBeChecked();
    expect(getAllByRole('checkbox')[4]).not.toBeChecked();
    expect(getAllByRole('checkbox')[5]).not.toBeChecked();
    expect(getAllByRole('checkbox')[6]).not.toBeChecked();
    expect(getAllByRole('checkbox')[7]).not.toBeChecked();
    expect(getAllByRole('checkbox')[8]).not.toBeChecked();

    // Select all app
    userEvent.click(getByTestId('select-all-app'));
    expect(getAllByRole('checkbox')[0]).toBeChecked();
    expect(getAllByRole('checkbox')[3]).toBeChecked();
    expect(getAllByRole('checkbox')[6]).toBeChecked();

    // Select all email
    userEvent.click(getByTestId('select-all-email'));
    expect(getAllByRole('checkbox')[1]).toBeChecked();
    expect(getAllByRole('checkbox')[4]).toBeChecked();
    expect(getAllByRole('checkbox')[7]).toBeChecked();

    // Select all tasks
    userEvent.click(getByTestId('select-all-task'));
    expect(getAllByRole('checkbox')[2]).toBeChecked();
    expect(getAllByRole('checkbox')[5]).toBeChecked();
    expect(getAllByRole('checkbox')[8]).toBeChecked();
  });

  it('Should send data to server on submit', async () => {
    const { queryByTestId, getByTestId, getByRole } = render(Components);

    await waitFor(() =>
      expect(queryByTestId('skeleton-notifications')).not.toBeInTheDocument(),
    );
    // Select all app
    userEvent.click(getByTestId('select-all-app'));

    userEvent.click(
      getByRole('button', {
        name: /save/i,
      }),
    );

    await waitFor(() => {
      // mutationSpy.mock.calls[1][0].operation.variables.input
      expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
        'UpdateNotificationPreferences',
      );

      expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
        accountListId: accountListId,
        attributes: [
          {
            app: true,
            email: false,
            task: false,
            notificationType: 'CALL_PARTNER_ONCE_PER_YEAR',
          },
          {
            app: true,
            email: false,
            task: false,
            notificationType: 'LARGER_GIFT',
          },
          {
            app: true,
            email: false,
            task: false,
            notificationType: 'LONG_TIME_FRAME_GIFT',
          },
        ],
      });
      expect(mockEnqueue).toHaveBeenCalled();
    });
  });
});
