import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { DateTime } from 'luxon';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import {
  getDataForTaskDrawerMock,
  createTaskMutationMock,
  updateTaskMutationMock,
} from './Form.mock';
import TaskDrawerForm from '.';

describe('TaskDrawerForm', () => {
  it('default', async () => {
    const onClose = jest.fn();
    const { getByText, getByRole, findByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[getDataForTaskDrawerMock(), createTaskMutationMock()]}
            addTypename={false}
          >
            <TaskDrawerForm accountListId="abc" onClose={onClose} />
          </MockedProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>,
    );
    userEvent.click(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
    onClose.mockClear();
    userEvent.click(getByText('Save'));
    expect(await findByText('Field is required')).toBeInTheDocument();
    userEvent.type(getByRole('textbox', { name: 'Subject' }), 'abc');
    userEvent.click(getByRole('checkbox', { name: 'Notification' }));
    userEvent.type(getByRole('spinbutton', { name: 'Period' }), '20');
    userEvent.click(getByRole('checkbox', { name: 'Notification' }));
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  }, 10000);

  it('persisted', async () => {
    const onClose = jest.fn();
    const { getByText, getByRole, getAllByRole } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[getDataForTaskDrawerMock(), updateTaskMutationMock()]}
            addTypename={false}
          >
            <TaskDrawerForm
              accountListId="abc"
              onClose={onClose}
              task={{
                activityType: null,
                contacts: {
                  nodes: [],
                },
                id: 'task-1',
                notificationTimeBefore: null,
                notificationTimeUnit: null,
                notificationType: null,
                startAt: DateTime.local(2013, 1, 5, 1, 2).toISO(),
                completedAt: DateTime.local(2016, 1, 5, 1, 2).toISO(),
                subject: '',
                tagList: [],
                user: null,
              }}
            />
          </MockedProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>,
    );
    expect(
      getAllByRole('textbox').find(
        (item: HTMLInputElement) => item.value === 'Jan 5, 2016',
      ),
    ).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Type' }));
    userEvent.click(
      within(getByRole('listbox', { name: 'Type' })).getByText(
        'NEWSLETTER_EMAIL',
      ),
    );

    userEvent.type(
      getByRole('textbox', { name: 'Subject' }),
      'On the Journey with the Johnson Family',
    );

    const tagsElement = getByRole('textbox', { name: 'Tags' });
    userEvent.click(tagsElement);
    userEvent.click(
      await within(getByRole('presentation')).findByText('tag-1'),
    );
    userEvent.click(tagsElement);
    userEvent.click(within(getByRole('presentation')).getByText('tag-2'));

    const assigneeElement = getByRole('textbox', { name: 'Assignee' });
    userEvent.click(assigneeElement);
    userEvent.click(
      await within(getByRole('presentation')).findByText('Robert Anderson'),
    );

    const contactsElement = getByRole('textbox', { name: 'Contacts' });
    userEvent.click(contactsElement);
    userEvent.click(
      await within(getByRole('presentation')).findByText('Anderson, Robert'),
    );
    userEvent.click(contactsElement);
    userEvent.click(within(getByRole('presentation')).getByText('Smith, John'));

    userEvent.click(getByRole('checkbox', { name: 'Notification' }));
    userEvent.type(getByRole('spinbutton', { name: 'Period' }), '20');
    userEvent.click(getByRole('button', { name: 'Unit' }));
    userEvent.click(
      within(getByRole('listbox', { name: 'Unit' })).getByText('HOURS'),
    );
    userEvent.click(getByRole('button', { name: 'Platform' }));
    userEvent.click(
      within(getByRole('listbox', { name: 'Platform' })).getByText('BOTH'),
    );

    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  }, 20000);
});
