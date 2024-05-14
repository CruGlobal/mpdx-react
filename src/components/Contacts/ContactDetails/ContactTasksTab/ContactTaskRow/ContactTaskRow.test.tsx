import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { ActivityTypeEnum, ResultEnum } from 'src/graphql/types.generated';
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

describe('ContactTaskRow', () => {
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

    it('handles delete task', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { findByText, getByRole, getByText, queryByText } = render(
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
      userEvent.click(getByRole('img', { name: 'Outlined Delete Icon' }));
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
    it('displays Appointment', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.AppointmentInPerson,
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

      expect(getByText('In Person')).toBeVisible();
    });

    it('displays Call', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.InitiationPhoneCall,
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

      expect(getByText('Phone Call')).toBeVisible();
    });

    it('displays Email', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.InitiationEmail,
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

    it('displays Social Media Message', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.InitiationSocialMedia,
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

      expect(getByText('Social Media')).toBeVisible();
    });

    it('displays Letter', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.InitiationLetter,
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

    it('displays Newsletter - Email', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PartnerCareDigitalNewsletter,
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

      expect(getByText('Digital Newsletter')).toBeVisible();
    });

    it('displays Newsletter - Physical', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PartnerCarePhysicalNewsletter,
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

      expect(getByText('Physical Newsletter')).toBeVisible();
    });

    it('displays Prayer Request', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PartnerCarePrayerRequest,
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

    it('displays Initation Letter', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.InitiationLetter,
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

    it('displays Special Gift Appeal', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.InitiationSpecialGiftAppeal,
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

      expect(getByText('Special Gift Appeal')).toBeVisible();
    });

    it('displays Talk To In Person', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PartnerCareInPerson,
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

      expect(getByText('In Person')).toBeVisible();
    });

    it('displays Text Message', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.FollowUpTextMessage,
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
          activityType: ActivityTypeEnum.PartnerCareThank,
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

      expect(getByText('Thank You Note')).toBeVisible();
    });

    it('displays To Do', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PartnerCareToDo,
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
