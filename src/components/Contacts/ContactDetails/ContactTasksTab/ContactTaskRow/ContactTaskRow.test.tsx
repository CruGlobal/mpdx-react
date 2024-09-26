import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
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
      },
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
    it.each([
      { activityType: ActivityTypeEnum.AppointmentInPerson, name: 'In Person' },
      {
        activityType: ActivityTypeEnum.InitiationPhoneCall,
        name: 'Phone Call',
      },
      { activityType: ActivityTypeEnum.InitiationEmail, name: 'Email' },
      {
        activityType: ActivityTypeEnum.InitiationSocialMedia,
        name: 'Social Media',
      },
      {
        activityType: ActivityTypeEnum.PartnerCareDigitalNewsletter,
        name: 'Digital Newsletter',
      },
      {
        activityType: ActivityTypeEnum.PartnerCarePhysicalNewsletter,
        name: 'Physical Newsletter',
      },
      {
        activityType: ActivityTypeEnum.PartnerCarePrayerRequest,
        name: 'Prayer Request',
      },
      { activityType: ActivityTypeEnum.InitiationLetter, name: 'Letter' },
      {
        activityType: ActivityTypeEnum.InitiationSpecialGiftAppeal,
        name: 'Special Gift Appeal',
      },
      { activityType: ActivityTypeEnum.PartnerCareInPerson, name: 'In Person' },
      {
        activityType: ActivityTypeEnum.FollowUpTextMessage,
        name: 'Text Message',
      },
      {
        activityType: ActivityTypeEnum.PartnerCareThank,
        name: 'Thank You Note',
      },
      { activityType: ActivityTypeEnum.PartnerCareToDo, name: 'To Do' },
    ])('displays $name', ({ activityType, name }) => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType,
        },
      });

      const { getByText } = render(<Components task={task} />);

      expect(getByText(name)).toBeVisible();
    });
  });
});
