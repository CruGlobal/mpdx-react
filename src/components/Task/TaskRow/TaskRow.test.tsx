import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { ActivityTypeEnum, ResultEnum } from 'src/graphql/types.generated';
import useTaskModal from '../../../hooks/useTaskModal';
import theme from '../../../theme';
import { TaskModalEnum } from '../Modal/TaskModal';
import { TaskRow } from './TaskRow';
import { TaskRowFragment, TaskRowFragmentDoc } from './TaskRow.generated';

const onContactSelected = jest.fn();
const onTaskCheckSelected = jest.fn();
const accountListId = 'abc';
const startAt = '2021-10-12';
const lateStartAt = '2019-10-12';

jest.mock('../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

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

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
});

interface TestComponentProps {
  task: TaskRowFragment;
}

const TestComponent: React.FC<TestComponentProps> = ({ task }) => (
  <TestRouter>
    <GqlMockedProvider>
      <ThemeProvider theme={theme}>
        <ContactPanelProvider>
          <TaskRow
            accountListId={accountListId}
            task={task}
            onTaskCheckToggle={onTaskCheckSelected}
            onContactSelected={onContactSelected}
            isChecked={false}
            filterPanelOpen={false}
          />
        </ContactPanelProvider>
      </ThemeProvider>
    </GqlMockedProvider>
  </TestRouter>
);

describe('TaskRow', () => {
  it('should render not complete', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
        contacts: {
          nodes: [{}],
        },
      },
    });

    const { findByText } = render(<TestComponent task={task} />);

    expect(await findByText(task.subject)).toBeVisible();

    expect(await findByText(task.contacts.nodes[0].name)).toBeVisible();
  });

  it('should render complete', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
        completedAt: '2021-10-20',
        contacts: {
          nodes: [{}],
        },
      },
    });

    const { findByText } = render(<TestComponent task={task} />);

    expect(await findByText(task.subject)).toBeVisible();

    expect(await findByText(task.contacts.nodes[0].name)).toBeVisible();
  });

  it('should render late and without assignee', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        id: '123',
        startAt: lateStartAt,
        result: ResultEnum.None,
        user: null,
        contacts: {
          nodes: [{}],
        },
      },
    });

    const { findByText, queryByTestId } = render(<TestComponent task={task} />);

    expect(await findByText(task.subject)).toBeVisible();

    expect(await findByText(task.contacts.nodes[0].name)).toBeVisible();

    await waitFor(() => {
      expect(queryByTestId('assigneeAvatar-123')).not.toBeInTheDocument();
    });
  });

  it('should render with Assignee', async () => {
    const assignee = {
      firstName: 'Cool',
      lastName: 'Guy',
      id: 'cool123',
    };

    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
        user: assignee,
        contacts: {
          nodes: [{}],
        },
      },
    });

    const { findByText } = render(<TestComponent task={task} />);

    expect(await findByText(task.subject)).toBeVisible();

    expect(await findByText(task.contacts.nodes[0].name)).toBeVisible();

    expect(
      await findByText(`${assignee.firstName[0]}${assignee.lastName[0]}`),
    ).toBeVisible();
  });

  describe('task interactions', () => {
    it('handles task checkbox click', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { getAllByText, getByRole } = render(<TestComponent task={task} />);
      expect(getAllByText(task.subject).length).toBe(1);
      userEvent.click(getByRole('checkbox', { hidden: true }));
      expect(onTaskCheckSelected).toHaveBeenCalledWith(task.id);
    });

    it('handles task row click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { getAllByText, getByTestId } = render(
        <TestComponent task={task} />,
      );
      expect(getAllByText(task.subject).length).toBe(1);
      userEvent.click(getByTestId('task-row'));
      expect(onTaskCheckSelected).toHaveBeenCalledWith(task.id);
    });

    it('handles complete button click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          completedAt: null,
          result: ResultEnum.None,
        },
      });

      const { getAllByText, getByRole } = render(<TestComponent task={task} />);

      expect(getAllByText(task.subject).length).toBe(1);
      userEvent.click(getByRole('button', { name: 'Complete Task' }));
      expect(openTaskModal).toHaveBeenCalledWith({
        taskId: task.id,
        view: TaskModalEnum.Complete,
      });
    });

    it('handles contact name click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
          contacts: {
            nodes: [{}],
          },
        },
      });

      const { findByText, getByText } = render(<TestComponent task={task} />);

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByText(task.contacts.nodes[0].name));
    });

    it('handle comment button click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { getAllByText, getByRole } = render(<TestComponent task={task} />);

      expect(getAllByText(task.subject).length).toBe(1);

      userEvent.click(getByRole('img', { hidden: true, name: 'Comment' }));
      userEvent.click(getByRole('img', { hidden: true, name: 'Comment' }));

      expect(openTaskModal).toHaveBeenCalledWith({
        taskId: task.id,
        view: TaskModalEnum.Comments,
      });
    });

    it('handle subject click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { getAllByText, getByTestId } = render(
        <TestComponent task={task} />,
      );

      expect(getAllByText(task.subject).length).toBe(1);
      userEvent.click(getByTestId('subject-wrap'));
      expect(openTaskModal).toHaveBeenCalledWith({
        taskId: task.id,
        view: TaskModalEnum.Edit,
      });
    });

    it('handle phase/action click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
          activityType: ActivityTypeEnum.FollowUpEmail,
        },
      });

      const { findByText, getByTestId } = render(<TestComponent task={task} />);

      expect(await findByText('Email')).toBeVisible();
      userEvent.click(getByTestId('phase-action-wrap'));
      expect(openTaskModal).toHaveBeenCalledWith({
        taskId: task.id,
        view: TaskModalEnum.Edit,
      });
    });
  });

  it('handles renders multiple names separated by comma', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
        contacts: {
          nodes: [
            {
              id: 'contact1',
              name: 'Contact 1',
            },
            {
              id: 'contact2',
              name: 'Contact 2',
            },
          ],
        },
      },
    });

    const { findByText } = render(<TestComponent task={task} />);

    expect(await findByText(task.subject)).toBeVisible();
    expect(await findByText('Contact 1,')).toBeVisible();
    expect(await findByText('Contact 2')).toBeVisible();
  });
});
