import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { UpdateUserOptionMutation } from 'src/hooks/UserPreference.generated';
import theme from 'src/theme';
import { ConfirmUserGroupModal } from './ConfirmUserGroupModal';

const hrefSetter = jest.fn();
const handleClose = jest.fn();
const mutationSpy = jest.fn();

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

const originalLocation = window.location;
Object.defineProperty(window, 'location', {
  configurable: true,
  value: { ...originalLocation, href: '' },
});
Object.defineProperty(window.location, 'href', {
  configurable: true,
  set: hrefSetter,
});

const TestComponent = () => {
  return (
    <SnackbarProvider>
      <GqlMockedProvider<{
        UpdateUserOption: UpdateUserOptionMutation;
      }>
        mocks={{
          UpdateUserOption: {
            createOrUpdateUserOption: {
              option: {
                key: 'user_type_verified',
                value: 'true',
              },
            },
          },
        }}
        onCall={mutationSpy}
      >
        <ThemeProvider theme={theme}>
          <ConfirmUserGroupModal
            open={true}
            handleClose={handleClose}
            userType={UserTypeEnum.UsStaff}
          />
        </ThemeProvider>
      </GqlMockedProvider>
    </SnackbarProvider>
  );
};

describe('ConfirmUserGroupModal', () => {
  it('renders confirmation modal correctly', async () => {
    const { getByText, getByRole } = render(<TestComponent />);

    await waitFor(() => {
      expect(getByText('Is this your user group?')).toBeInTheDocument();
      expect(
        getByText('The user group for your account is:'),
      ).toBeInTheDocument();
      expect(
        getByText(
          /If this is correct, please confirm. If this is incorrect, please contact/,
        ),
      ).toBeInTheDocument();
      expect(getByText('support@mpdx.org')).toBeInTheDocument();
      expect(getByText(/to request changes\./)).toBeInTheDocument();

      expect(
        getByRole('button', { name: 'No, Request Change' }),
      ).toBeInTheDocument();
      expect(getByRole('button', { name: 'Yes, Confirm' })).toBeInTheDocument();
    });
  });

  it('renders user type correctly', async () => {
    const { getByText } = render(<TestComponent />);

    await waitFor(() => {
      expect(
        getByText('The user group for your account is:'),
      ).toBeInTheDocument();
      expect(getByText('Cru US Staff')).toBeInTheDocument();
    });
  });

  it('creates user option when "Yes, Confirm" button is clicked', async () => {
    const { findByRole } = render(<TestComponent />);

    const confirmButton = await findByRole('button', { name: 'Yes, Confirm' });
    await waitFor(() => {
      expect(confirmButton).toBeInTheDocument();
    });

    userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('UpdateUserOption', {
        key: 'user_type_verified',
        value: 'true',
      });
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully confirmed user group.',
        { variant: 'success' },
      );
    });
  });

  it('calls handleClose when "Yes, Confirm" button is clicked', async () => {
    const { findByRole } = render(<TestComponent />);

    const confirmButton = await findByRole('button', { name: 'Yes, Confirm' });
    await waitFor(() => {
      expect(confirmButton).toBeInTheDocument();
    });

    await waitFor(() => {
      confirmButton.click();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('creates user option when "No, Request Change" button is clicked', async () => {
    const { findByRole } = render(<TestComponent />);

    const requestChangeButton = await findByRole('button', {
      name: 'No, Request Change',
    });
    await waitFor(() => {
      expect(requestChangeButton).toBeInTheDocument();
    });

    userEvent.click(requestChangeButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('UpdateUserOption', {
        key: 'user_type_verified',
        value: 'true',
      });
    });
  });

  it('calls handleClose when "No, Request Change" button is clicked', async () => {
    const { findByRole } = render(<TestComponent />);

    const requestChangeButton = await findByRole('button', {
      name: 'No, Request Change',
    });
    await waitFor(() => {
      expect(requestChangeButton).toBeInTheDocument();
    });

    await waitFor(() => {
      requestChangeButton.click();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('opens email client when "No, Request Change" button is clicked', async () => {
    const { findByRole } = render(<TestComponent />);

    const requestChangeButton = await findByRole('button', {
      name: 'No, Request Change',
    });
    await waitFor(() => {
      expect(requestChangeButton).toBeInTheDocument();
    });

    userEvent.click(requestChangeButton);

    await waitFor(() => {
      expect(hrefSetter).toHaveBeenCalledWith('mailto:support@mpdx.org');
    });
  });
});
