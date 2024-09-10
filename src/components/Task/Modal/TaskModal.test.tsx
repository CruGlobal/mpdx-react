import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ActivityTypeEnum, ResultEnum } from 'src/graphql/types.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import theme from 'src/theme';
import TaskModal, { TaskModalEnum } from './TaskModal';
import { GetTaskForTaskModalQuery } from './TaskModalTask.generated';

jest.mock('src/hooks/useTaskModal');

const openTaskModal = jest.fn();
beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
});

const accountListId = 'abc';
const taskId = 'taskId';
const defaultValues = { subject: 'defaultSubject' };
const router = {
  query: { accountListId },
  isReady: true,
};

const completedTask = {
  task: {
    id: 'id',
    activityType: ActivityTypeEnum.PartnerCarePrayerRequest,
    subject: 'New Task',
    location: null,
    startAt: '2023-08-18T17:26:52Z',
    completedAt: '2024-01-18T19:36:55Z',
    result: ResultEnum.Done,
    nextAction: ActivityTypeEnum.FollowUpTextMessage,
    tagList: [],
    user: null,
    notificationTimeBefore: null,
    notificationType: null,
    notificationTimeUnit: null,
    contacts: {
      nodes: [
        {
          id: '8638ad97-1ad5-4e31-b43a-6f5652d7571c',
          name: 'contact name',
        },
      ],
    },
  },
};

type TaskModalComponentProps = {
  view: TaskModalEnum;
  GetTaskForTaskModalMock: GetTaskForTaskModalQuery;
  taskId?: string;
  showFlowsMessage?: boolean;
};

const TaskModalComponent = ({
  GetTaskForTaskModalMock,
  taskId,
  view,
  showFlowsMessage,
}: TaskModalComponentProps) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <GqlMockedProvider<{
            GetTaskForTaskModal: GetTaskForTaskModalQuery;
          }>
            mocks={{
              GetTaskForTaskModal: GetTaskForTaskModalMock,
            }}
          >
            <TaskModal
              taskId={taskId}
              defaultValues={defaultValues}
              view={view}
              showFlowsMessage={showFlowsMessage}
            />
          </GqlMockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('TaskModal', () => {
  it('Show Complete Task Form', async () => {
    const { getByRole } = render(
      <TaskModalComponent
        GetTaskForTaskModalMock={completedTask}
        view={TaskModalEnum.Complete}
        taskId={taskId}
      />,
    );

    await waitFor(() => {
      expect(
        getByRole('heading', { name: 'Complete Task' }),
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      const dialog = getByRole('dialog', {
        name: 'Complete Task',
      });
      expect(within(dialog).getByText('Prayer Request')).toBeInTheDocument();
    });
  });

  it('Show Comments Form', async () => {
    const { getByRole } = render(
      <TaskModalComponent
        GetTaskForTaskModalMock={completedTask}
        view={TaskModalEnum.Comments}
        taskId={taskId}
      />,
    );

    await waitFor(() => {
      expect(
        getByRole('heading', { name: 'Task Comments' }),
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        getByRole('button', {
          name: 'Add Comment',
        }),
      ).toBeInTheDocument();
    });
  });

  it('Show Log Form', async () => {
    const { getByRole, getByText } = render(
      <TaskModalComponent
        GetTaskForTaskModalMock={completedTask}
        view={TaskModalEnum.Log}
        taskId={taskId}
      />,
    );

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Log Task' })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText('defaultSubject')).toBeInTheDocument();
      expect(getByText('Show More')).toBeInTheDocument();
    });
  });

  it('Show Default Form', async () => {
    const { getByRole } = render(
      <TaskModalComponent
        view={TaskModalEnum.Add}
        GetTaskForTaskModalMock={{
          task: {
            id: 'id',
            activityType: ActivityTypeEnum.PartnerCarePrayerRequest,
            subject: 'New Task',
            location: null,
            startAt: null,
            completedAt: null,
            result: null,
            nextAction: null,
            tagList: [],
            user: null,
            notificationTimeBefore: null,
            notificationType: null,
            notificationTimeUnit: null,
            contacts: {
              nodes: [],
            },
          },
        }}
      />,
    );

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Add Task' })).toBeInTheDocument();
    });

    await waitFor(() => {
      const dialog = getByRole('dialog', {
        name: 'Add Task',
      });
      expect(within(dialog).getByText('Notifications')).toBeInTheDocument();
    });
  });

  describe('flows status change message', () => {
    it.each([TaskModalEnum.Add, TaskModalEnum.Complete, TaskModalEnum.Log])(
      'shows in %s modal when showFlowsMessage is set',
      async (view) => {
        const { findByText } = render(
          <TaskModalComponent
            GetTaskForTaskModalMock={completedTask}
            view={view}
            taskId={taskId}
            showFlowsMessage
          />,
        );

        expect(
          await findByText(/The contact's status has been updated/),
        ).toBeInTheDocument();
      },
    );
  });
});
