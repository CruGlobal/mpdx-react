import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  ActivityTypeEnum,
  ResultEnum,
} from '../../../../../../graphql/types.generated';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../../../__tests__/util/graphqlMocking';
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

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('ContactTaskRow', () => {
  it('should render loading', () => {
    const { getByTestId } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <ContactTaskRow
            accountListId={accountListId}
            task={undefined}
            isChecked={false}
            onTaskCheckToggle={onTaskCheckToggle}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    expect(getByTestId('loadingRow')).toBeVisible();
  });

  it('should render not complete', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
      },
    });

    const { findByText, queryByTestId } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <ContactTaskRow
            accountListId={accountListId}
            task={task}
            isChecked={false}
            onTaskCheckToggle={onTaskCheckToggle}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    expect(await findByText(task.subject)).toBeVisible();

    expect(
      await findByText(`${task.user?.firstName} ${task.user?.lastName}`),
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

    const { findByText, getByRole } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <ContactTaskRow
            accountListId={accountListId}
            task={task}
            onTaskCheckToggle={onTaskCheckToggle}
            isChecked={false}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    expect(await findByText(task.subject)).toBeVisible();
    userEvent.click(getByRole('checkbox', { hidden: true }));
    expect(onTaskCheckToggle).toHaveBeenCalledWith(task.id);
  });

  describe('task interactions', () => {
    it('handles complete button click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { findByText, getByRole } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('img', { hidden: true, name: 'Check Icon' }));
      expect(openTaskModal).toHaveBeenCalledWith({
        view: 'complete',
        taskId: task.id,
        showCompleteForm: true,
      });
    });

    it('handles subject click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { findByText, getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByText(task.subject));
      expect(openTaskModal).toHaveBeenCalledWith({
        view: 'edit',
        taskId: task.id,
      });
    });

    it('handle comment button click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { findByText, getByRole } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('img', { hidden: true, name: 'Comment Icon' }));
      expect(openTaskModal).toHaveBeenCalledWith({
        taskId: task.id,
        view: 'comments',
      });
    });
  });

  describe('activity type', () => {
    it('displays Appointment', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Appointment,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Appointment')).toBeVisible();
    });

    it('displays Call', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Call,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Call')).toBeVisible();
    });

    it('displays Email', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Email,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Email')).toBeVisible();
    });

    it('displays Facebook Message', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.FacebookMessage,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Facebook Message')).toBeVisible();
    });

    it('displays Letter', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Letter,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Letter')).toBeVisible();
    });

    it('displays Newslatter - Email', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.NewsletterEmail,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Newsletter - Email')).toBeVisible();
    });

    it('displays Newsletter - Physical', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.NewsletterPhysical,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Newsletter - Physical')).toBeVisible();
    });

    it('displays Prayer Request', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PrayerRequest,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Prayer Request')).toBeVisible();
    });

    it('displays Pre-Call Letter', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PreCallLetter,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Pre-Call Letter')).toBeVisible();
    });

    it('displays Reminder Letter', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.ReminderLetter,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Reminder Letter')).toBeVisible();
    });

    it('displays Support Letter', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.SupportLetter,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Support Letter')).toBeVisible();
    });

    it('displays Talk To In Person', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.TalkToInPerson,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Talk To In Person')).toBeVisible();
    });

    it('displays Text Message', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.TextMessage,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Text Message')).toBeVisible();
    });

    it('displays Thank', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Thank,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Thank')).toBeVisible();
    });

    it('displays To Do', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.ToDo,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactTaskRow
              accountListId={accountListId}
              task={task}
              isChecked={false}
              onTaskCheckToggle={onTaskCheckToggle}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('To Do')).toBeVisible();
    });
  });
});
