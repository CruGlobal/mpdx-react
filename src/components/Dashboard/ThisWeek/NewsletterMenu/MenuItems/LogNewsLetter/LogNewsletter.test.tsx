import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { MuiThemeProvider } from '@material-ui/core';
import { CreateTaskMutation } from '../../../../../Task/Drawer/Form/TaskDrawer.generated';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import theme from '../../../../../../theme';
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
      <MuiThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <SnackbarProvider>
            <GqlMockedProvider<CreateTaskMutation>>
              <LogNewsletter
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </MuiPickersUtilsProvider>
      </MuiThemeProvider>,
    );
    expect(queryByText('Log Newsletter')).toBeInTheDocument();
  });

  it('closes menu', () => {
    const { getByLabelText } = render(
      <MuiThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <SnackbarProvider>
            <GqlMockedProvider<CreateTaskMutation>>
              <LogNewsletter
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </MuiPickersUtilsProvider>
      </MuiThemeProvider>,
    );
    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('Logging Newsletter', () => {
    it('Logs Physical Newsletter', async () => {
      const { getByLabelText, getByText, findByText } = render(
        <MuiThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <SnackbarProvider>
              <GqlMockedProvider<CreateTaskMutation>>
                <LogNewsletter
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </MuiPickersUtilsProvider>
        </MuiThemeProvider>,
      );
      expect(getByText('Log Newsletter')).toBeInTheDocument();

      userEvent.click(getByText('Save'));
      expect(await findByText('Field is required')).toBeInTheDocument();

      userEvent.type(getByLabelText('Subject'), accountListId);
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });

    it('Logs Email Newsletter', async () => {
      const { getByLabelText, getByText, findByText } = render(
        <MuiThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <SnackbarProvider>
              <GqlMockedProvider<CreateTaskMutation>>
                <LogNewsletter
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </MuiPickersUtilsProvider>
        </MuiThemeProvider>,
      );
      expect(getByText('Log Newsletter')).toBeInTheDocument();

      userEvent.click(getByText('Save'));
      expect(await findByText('Field is required')).toBeInTheDocument();

      userEvent.type(getByLabelText('Subject'), accountListId);
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByLabelText('Newsletter - Email'));
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });

    it('Logs Newsletter with completedAt date', async () => {
      const { getByLabelText, getByText, findByText, getByTestId } = render(
        <MuiThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <SnackbarProvider>
              <GqlMockedProvider<CreateTaskMutation>>
                <LogNewsletter
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </MuiPickersUtilsProvider>
        </MuiThemeProvider>,
      );
      expect(getByText('Log Newsletter')).toBeInTheDocument();

      userEvent.click(getByText('Save'));
      expect(await findByText('Field is required')).toBeInTheDocument();

      userEvent.type(getByLabelText('Subject'), accountListId);
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
      const { getByLabelText, getByText, findByText } = render(
        <MuiThemeProvider theme={theme}>
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
          </TestWrapper>
        </MuiThemeProvider>,
      );
      expect(getByText('Log Newsletter')).toBeInTheDocument();

      userEvent.click(getByText('Save'));
      expect(await findByText('Field is required')).toBeInTheDocument();

      userEvent.type(getByLabelText('Subject'), accountListId);
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());

      userEvent.type(getByLabelText('Comment'), 'comment');

      userEvent.click(getByText('Save'));

      await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });
  });
});
