import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ConfirmUserGroupModal } from './ConfirmUserGroupModal';
import { GetUserGroupQuery } from './GetUserGroup.generated';

const handleClose = jest.fn();

const TestComponent = () => {
  return (
    <GqlMockedProvider<{
      GetUserGroup: GetUserGroupQuery;
    }>
      mocks={{
        GetUserGroup: {
          user: {
            userType: UserTypeEnum.UsStaff,
          },
        },
      }}
    >
      <ThemeProvider theme={theme}>
        <ConfirmUserGroupModal open={true} handleClose={handleClose} />
      </ThemeProvider>
    </GqlMockedProvider>
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

  it('calls handleClose when "Yes, Confirm" button is clicked', async () => {
    const { getByRole } = render(<TestComponent />);

    const confirmButton = await getByRole('button', { name: 'Yes, Confirm' });
    await waitFor(() => {
      expect(confirmButton).toBeInTheDocument();
    });

    await waitFor(() => {
      confirmButton.click();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('calls handleClose when "No, Request Change" button is clicked', async () => {
    const { getByRole } = render(<TestComponent />);

    const requestChangeButton = await getByRole('button', {
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
    const originalLocation = window.location;
    const hrefSetter = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: '' },
    });
    Object.defineProperty(window.location, 'href', {
      configurable: true,
      set: hrefSetter,
    });

    const { findByRole } = render(<TestComponent />);

    const requestChangeButton = await findByRole('button', {
      name: 'No, Request Change',
    });
    await waitFor(() => {
      expect(requestChangeButton).toBeInTheDocument();
    });

    userEvent.click(requestChangeButton);
    expect(hrefSetter).toHaveBeenCalledWith('mailto:support@mpdx.org');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });
});
