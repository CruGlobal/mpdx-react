import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { CreateTaskMutation } from '../../../../../Task/Drawer/Form/TaskDrawer.generated';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import LogNewsletter from './LogNewsletter';
import {
  createNewsLetterTaskCommentMutation,
  createNewsletterTaskMutationMock,
} from './LogNewsLetter.mock';

const accountListId = 'abc';
const handleClose = jest.fn();
jest.mock('uuid', () => ({
  v4: (): string => 'comment-0',
}));

describe('LogNewsletter', () => {
  it('default', () => {
    const { queryByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <GqlMockedProvider<CreateTaskMutation>>
            <LogNewsletter
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>,
    );
    expect(queryByText('Log Newsletter')).toBeInTheDocument();
  });

  it('closes menu', () => {
    const { getByRole } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <GqlMockedProvider<CreateTaskMutation>>
            <LogNewsletter
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>,
    );
    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('Logging Newsletter', () => {
    it('Logs Physical Newsletter', async () => {
      const { getByRole, getByText, findByText } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <SnackbarProvider>
            <GqlMockedProvider<CreateTaskMutation>>
              <LogNewsletter
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </MuiPickersUtilsProvider>,
      );
      expect(getByText('Log Newsletter')).toBeInTheDocument();

      userEvent.click(getByText('Save'));
      expect(await findByText('Field is required')).toBeInTheDocument();

      userEvent.type(getByRole('textbox', { name: 'Subject' }), accountListId);
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });

    it('Logs Email Newsletter', async () => {
      const { getByRole, getByText, findByText } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <SnackbarProvider>
            <GqlMockedProvider<CreateTaskMutation>>
              <LogNewsletter
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </MuiPickersUtilsProvider>,
      );
      expect(getByText('Log Newsletter')).toBeInTheDocument();

      userEvent.click(getByText('Save'));
      expect(await findByText('Field is required')).toBeInTheDocument();

      userEvent.type(getByRole('textbox', { name: 'Subject' }), accountListId);
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByRole('radio', { name: 'Newsletter - Email' }));
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });

    it('Logs Newsletter with completedAt date', async () => {
      const { getByRole, getByText, findByText, getByTestId } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <SnackbarProvider>
            <GqlMockedProvider<CreateTaskMutation>>
              <LogNewsletter
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </MuiPickersUtilsProvider>,
      );
      expect(getByText('Log Newsletter')).toBeInTheDocument();

      userEvent.click(getByText('Save'));
      expect(await findByText('Field is required')).toBeInTheDocument();

      userEvent.type(getByRole('textbox', { name: 'Subject' }), accountListId);
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByTestId('completedDate'));
      const dateOkButton = await waitFor(() => getByText('OK'));
      userEvent.click(dateOkButton);
      userEvent.click(getByTestId('completedTime'));
      const timeOkButton = await waitFor(() => getByText('OK'));
      userEvent.click(timeOkButton);
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });

    it('Logs Newsletter with Comment', async () => {
      const { getByRole, getByText, findByText } = render(
        <TestWrapper
          mocks={[
            createNewsletterTaskMutationMock(),
            createNewsLetterTaskCommentMutation(),
          ]}
        >
          <LogNewsletter
            accountListId={accountListId}
            handleClose={handleClose}
          />
        </TestWrapper>,
      );
      expect(getByText('Log Newsletter')).toBeInTheDocument();

      userEvent.click(getByText('Save'));
      expect(await findByText('Field is required')).toBeInTheDocument();

      userEvent.type(getByRole('textbox', { name: 'Subject' }), accountListId);
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());

      userEvent.type(getByRole('textbox', { name: 'Comment' }), 'comment');

      userEvent.click(getByText('Save'));

      await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });
  });
});
