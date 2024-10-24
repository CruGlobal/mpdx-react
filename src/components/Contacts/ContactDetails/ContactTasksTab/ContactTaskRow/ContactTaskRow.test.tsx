import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import { ResultEnum } from 'src/graphql/types.generated';
import useTaskModal from '../../../../../hooks/useTaskModal';
import theme from '../../../../../theme';
import {
  TaskRowFragment,
  TaskRowFragmentDoc,
} from '../../../../Task/TaskRow/TaskRow.generated';
import { ContactTaskRow } from './ContactTaskRow';

const accountListId = 'abc';
const startAt = '2021-04-12';

jest.mock('../../../../../hooks/useTaskModal');

const openTaskModal = jest.fn();
const onTaskCheckToggle = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
});

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

const Components = ({ task }: { task?: TaskRowFragment }) => (
  <GqlMockedProvider>
    <ThemeProvider theme={theme}>
      <ContactTaskRow
        accountListId={accountListId}
        task={task}
        isChecked={false}
        onTaskCheckToggle={onTaskCheckToggle}
      />
    </ThemeProvider>
  </GqlMockedProvider>
);

describe('ContactTaskRow', () => {
  it('should render loading', () => {
    const { getByTestId } = render(<Components />);

    expect(getByTestId('loadingRow')).toBeVisible();
  });

  it('should render not complete', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
      },
    });

    const { findByText, queryByTestId } = render(<Components task={task} />);

    expect(await findByText(task.subject)).toBeVisible();

    expect(
      await findByText(
        `${task.user?.firstName?.[0]}${task.user?.lastName?.[0]}`,
      ),
    ).toBeVisible();

    expect(queryByTestId('loadingRow')).toBeNull();
  });

  it('handles task checkbox click', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
      },
    });

    const { findByText, getByRole } = render(<Components task={task} />);

    expect(await findByText(task.subject)).toBeVisible();
    userEvent.click(getByRole('checkbox', { hidden: true }));
    expect(onTaskCheckToggle).toHaveBeenCalledWith(task.id);
  });

  describe('task interactions', () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
        user: {
          firstName: 'John',
          lastName: 'Wayne',
        },
      },
    });
    const taskWithTags = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        id: '123',
        startAt,
        result: ResultEnum.None,
        tagList: ['testTag'],
        user: null,
      },
    });

    it('renders the assignee avatar', async () => {
      const { findByText } = render(<Components task={task} />);

      expect(await findByText('JW')).toBeVisible();
    });

    it('renders the tag icon', async () => {
      const { findByTestId } = render(<Components task={taskWithTags} />);

      expect(await findByTestId('tagIcon-123')).toBeVisible();
    });

    it('handles complete button click', async () => {
      const { findByText, getByRole } = render(<Components task={task} />);

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('img', { hidden: true, name: 'Check' }));
      expect(openTaskModal).toHaveBeenCalledWith({
        view: TaskModalEnum.Complete,
        taskId: task.id,
        showCompleteForm: true,
      });
    });

    it('handles subject click', async () => {
      const { findByText, getByText } = render(<Components task={task} />);

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByText(task.subject));
      expect(openTaskModal).toHaveBeenCalledWith({
        view: TaskModalEnum.Edit,
        taskId: task.id,
      });
    });

    it('handle comment button click', async () => {
      const { findByText, getByRole } = render(<Components task={task} />);

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('img', { hidden: true, name: 'Comment' }));
      expect(openTaskModal).toHaveBeenCalledWith({
        taskId: task.id,
        view: TaskModalEnum.Comments,
      });
    });

    it('handles delete task', async () => {
      const { findByText, getByRole, getByText, queryByText } = render(
        <Components task={task} />,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('img', { name: 'Delete' }));
      expect(
        await findByText('Are you sure you wish to delete the selected task?'),
      ).toBeVisible();
      userEvent.click(getByText('Yes'));
      await waitFor(() =>
        expect(queryByText(task.subject)).not.toBeInTheDocument(),
      );
    });
  });

  describe('activity type', () => {
    it.each(loadConstantsMockData.constant.activities || [])(
      'displays $value',
      (activity) => {
        const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
          mocks: {
            activityType: activity?.id,
          },
        });

        const { getByText } = render(<Components task={task} />);

        expect(getByText(activity?.value.split(' - ')[1].trim())).toBeVisible();
      },
    );
  });
});
