import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../../../../../App';
import { User } from '../../../../../../../graphql/types.generated';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import { CreateTaskMutation } from '../../../../../Task/Drawer/Form/TaskDrawer.generated';
import { CreateTaskCommentMutation } from '../../../../../Task/Drawer/CommentList/Form/CreateTaskComment.generated';
import LogNewsletter from './LogNewsletter';

const accountListId = '111';
const handleClose = jest.fn();
jest.mock('uuid', () => ({
  v4: (): string => 'comment-0',
}));

describe('LogNewsletter', () => {
  it('default', () => {
    const { queryByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <AppProvider
          initialState={{
            user: {
              id: 'user-1',
              firstName: 'John',
              lastName: 'Smith',
            } as User,
          }}
        >
          <SnackbarProvider>
            <GqlMockedProvider<CreateTaskMutation>>
              <LogNewsletter
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </AppProvider>
      </MuiPickersUtilsProvider>,
    );
    expect(queryByText('Log Newsletter')).toBeInTheDocument();
  });

  it('closes menu', () => {
    const { getByRole } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <AppProvider
          initialState={{
            user: {
              id: 'user-1',
              firstName: 'John',
              lastName: 'Smith',
            } as User,
          }}
        >
          <SnackbarProvider>
            <GqlMockedProvider<CreateTaskMutation>>
              <LogNewsletter
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </AppProvider>
      </MuiPickersUtilsProvider>,
    );
    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('Logging Newsletter', () => {
    it('Logs Physical Newsletter', async () => {
      const { getByRole, getByText, findByText } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <AppProvider
            initialState={{
              user: {
                id: 'user-1',
                firstName: 'John',
                lastName: 'Smith',
              } as User,
            }}
          >
            <SnackbarProvider>
              <GqlMockedProvider<CreateTaskMutation>>
                <LogNewsletter
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </AppProvider>
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
          <AppProvider
            initialState={{
              user: {
                id: 'user-1',
                firstName: 'John',
                lastName: 'Smith',
              } as User,
            }}
          >
            <SnackbarProvider>
              <GqlMockedProvider<CreateTaskMutation>>
                <LogNewsletter
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </AppProvider>
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
          <AppProvider
            initialState={{
              user: {
                id: 'user-1',
                firstName: 'John',
                lastName: 'Smith',
              } as User,
            }}
          >
            <SnackbarProvider>
              <GqlMockedProvider<CreateTaskMutation>>
                <LogNewsletter
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </AppProvider>
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
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <AppProvider
            initialState={{
              user: {
                id: 'user-1',
                firstName: 'John',
                lastName: 'Smith',
              } as User,
            }}
          >
            <SnackbarProvider>
              <GqlMockedProvider<
                CreateTaskMutation & CreateTaskCommentMutation
              >>
                <LogNewsletter
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </AppProvider>
        </MuiPickersUtilsProvider>,
      );
      expect(getByText('Log Newsletter')).toBeInTheDocument();

      userEvent.click(getByText('Save'));
      expect(await findByText('Field is required')).toBeInTheDocument();

      userEvent.type(getByRole('textbox', { name: 'Subject' }), accountListId);
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByRole('radio', { name: 'Newsletter - Email' }));
      userEvent.type(
        getByRole('textbox', { name: 'Comment' }),
        'Some Random Comment',
      );

      // userEvent.click(getByText('Save'));

      // await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });
  });
});
