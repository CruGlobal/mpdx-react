import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { ActivityTypeEnum } from '../../../../../../../graphql/types.generated';
import { CreateTasksMutation } from '../../../../../Task/Modal/Form/TaskModal.generated';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import theme from '../../../../../../theme';
import LogNewsletter from './LogNewsletter';
import { createNewsletterTaskMutationMock } from './LogNewsLetter.mock';
import { Settings } from 'luxon';

const accountListId = 'abc';
const handleClose = jest.fn();
jest.mock('uuid', () => ({
  v4: (): string => 'comment-0',
}));

describe('LogNewsletter', () => {
  beforeEach(() => {
    // Create a stable time so that the "now" in the component will match "now" in the mocks
    const now = Date.now();
    Settings.now = () => now;
  });

  it('default', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <GqlMockedProvider<CreateTasksMutation>>
              <LogNewsletter
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );
    expect(queryByText('Log Newsletter')).toBeInTheDocument();
  });

  it('closes menu', () => {
    const { getByLabelText } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <GqlMockedProvider<CreateTasksMutation>>
              <LogNewsletter
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );
    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('Logging Newsletter', () => {
    it('Logs Physical Newsletter', async () => {
      const { getByLabelText, getByText, findByText } = render(
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <GqlMockedProvider<CreateTasksMutation>>
                <LogNewsletter
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>,
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
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <GqlMockedProvider<CreateTasksMutation>>
                <LogNewsletter
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>,
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
      const { getByLabelText, getByText, findByText } = render(
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <GqlMockedProvider<CreateTasksMutation>>
                <LogNewsletter
                  accountListId={accountListId}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>,
      );
      expect(getByText('Log Newsletter')).toBeInTheDocument();

      userEvent.click(getByText('Save'));
      expect(await findByText('Field is required')).toBeInTheDocument();

      userEvent.type(getByLabelText('Subject'), accountListId);
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByLabelText('Completed Date'));
      const dateOkButton = await waitFor(() => getByText('OK'));
      userEvent.click(dateOkButton);
      userEvent.click(getByLabelText('Completed Time'));
      const timeOkButton = await waitFor(() => getByText('OK'));
      userEvent.click(timeOkButton);
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });

    it('Logs Newsletter with Comment', async () => {
      const { getByLabelText, getByText, findByText } = render(
        <ThemeProvider theme={theme}>
          <TestWrapper
            mocks={[
              createNewsletterTaskMutationMock(
                'task-1',
                ActivityTypeEnum.NewsletterPhysical,
              ),
            ]}
          >
            <LogNewsletter
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </TestWrapper>
        </ThemeProvider>,
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

  it('Logs Both with Comment', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper
          mocks={[
            createNewsletterTaskMutationMock(
              'task-1',
              ActivityTypeEnum.NewsletterPhysical,
            ),
            createNewsletterTaskMutationMock(
              'task-2',
              ActivityTypeEnum.NewsletterEmail,
            ),
          ]}
        >
          <LogNewsletter
            accountListId={accountListId}
            handleClose={handleClose}
          />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(
      getByRole('heading', { name: 'Log Newsletter' }),
    ).toBeInTheDocument();

    userEvent.type(getByRole('textbox', { name: 'Subject' }), 'abc');
    userEvent.click(getByRole('radio', { name: 'Both' }));
    userEvent.type(getByRole('textbox', { name: 'Comment' }), 'comment');
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });
});
