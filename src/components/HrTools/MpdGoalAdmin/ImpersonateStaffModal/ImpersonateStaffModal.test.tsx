import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { ImpersonateStaffModal } from './ImpersonateStaffModal';

const staffName = 'John & Jane Doe';
const staffEmail = 'john.doe@example.com';

const push = jest.fn();
const router = {
  push,
  isReady: true,
};

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

const handleClose = jest.fn();

const Components = () => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <ImpersonateStaffModal
          staffName={staffName}
          staffEmail={staffEmail}
          handleClose={handleClose}
        />
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('ImpersonateStaffModal', () => {
  it('shows who will be impersonated', () => {
    const { getByText } = render(<Components />);

    expect(getByText(`Impersonate ${staffName}`)).toBeInTheDocument();
    expect(
      getByText(
        `You are about to impersonate ${staffName} (${staffEmail}). You will be logged in on their behalf and will see what they see. Provide a reason for this impersonation.`,
      ),
    ).toBeInTheDocument();
  });

  it('requires a reason before submitting', async () => {
    const fetch = jest.fn();
    window.fetch = fetch;

    const { getByRole, findByText } = render(<Components />);

    userEvent.click(getByRole('button', { name: 'Impersonate' }));

    expect(await findByText('Reason is required')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('impersonates the staff member and redirects on success', async () => {
    const fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ errors: [] }),
      status: 200,
    });
    window.fetch = fetch;

    const { getByRole } = render(<Components />);

    userEvent.type(
      getByRole('textbox', { name: /reason \/ helpscout ticket link/i }),
      'HS-1234',
    );
    userEvent.click(getByRole('button', { name: 'Impersonate' }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/api/auth/impersonate/impersonateUser',
        {
          method: 'POST',
          body: JSON.stringify({
            user: staffEmail,
            reason: 'HS-1234',
          }),
        },
      ),
    );
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Redirecting you to home screen to impersonate user...',
        {
          variant: 'success',
        },
      ),
    );
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('disables the buttons while submitting', async () => {
    // A fetch that never resolves keeps the form in the submitting state
    const fetch = jest.fn().mockReturnValue(new Promise(() => {}));
    window.fetch = fetch;

    const { getByRole } = render(<Components />);

    userEvent.type(
      getByRole('textbox', { name: /reason \/ helpscout ticket link/i }),
      'HS-1234',
    );
    userEvent.click(getByRole('button', { name: 'Impersonate' }));

    await waitFor(() =>
      expect(getByRole('button', { name: 'Impersonate' })).toBeDisabled(),
    );
    expect(getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('shows the API errors without redirecting', async () => {
    const fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          errors: [{ detail: 'Error1' }, { detail: 'Error2' }],
        }),
      status: 400,
    });
    window.fetch = fetch;

    const { getByRole } = render(<Components />);

    userEvent.type(
      getByRole('textbox', { name: /reason \/ helpscout ticket link/i }),
      'HS-1234',
    );
    userEvent.click(getByRole('button', { name: 'Impersonate' }));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('Error1', { variant: 'error' });
      expect(mockEnqueue).toHaveBeenCalledWith('Error2', { variant: 'error' });
    });
    expect(push).not.toHaveBeenCalled();
  });

  it('shows unknown errors without redirecting', async () => {
    const fetch = jest.fn().mockRejectedValue(new Error('Unknown Error'));
    window.fetch = fetch;

    const { getByRole } = render(<Components />);

    userEvent.type(
      getByRole('textbox', { name: /reason \/ helpscout ticket link/i }),
      'HS-1234',
    );
    userEvent.click(getByRole('button', { name: 'Impersonate' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Unknown Error', {
        variant: 'error',
      }),
    );
    expect(push).not.toHaveBeenCalled();
  });

  it('closes without submitting via the cancel button', async () => {
    const fetch = jest.fn();
    window.fetch = fetch;

    const { getByRole } = render(<Components />);

    userEvent.click(getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(handleClose).toHaveBeenCalled());
    expect(fetch).not.toHaveBeenCalled();
  });
});
