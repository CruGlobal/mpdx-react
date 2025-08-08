import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import theme from 'src/theme';
import { GoalCalculatorProvider } from '../../../Shared/GoalCalculatorContext';
import { InformationStep } from './InformationStep';

const TestComponent = () => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
      }>
        mocks={{
          GetUser: {
            user: {
              id: 'user-id-1',
              firstName: 'Obi',
              lastName: 'Wan',
              avatar: 'avatar.jpg',
            },
          },
        }}
      >
        <GoalCalculatorProvider>
          <InformationStep />
        </GoalCalculatorProvider>
      </GqlMockedProvider>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('InformationStep', () => {
  it('toggles to spouse information when button is clicked', async () => {
    const { getByRole, queryByTestId, getByTestId } = render(<TestComponent />);
    const button = getByRole('button', { name: 'View Spouse' });
    expect(queryByTestId('spouse-personal-tab')).not.toBeInTheDocument();
    expect(queryByTestId('spouse-financial-tab')).not.toBeInTheDocument();
    userEvent.click(button);
    expect(getByTestId('spouse-personal-tab')).toBeInTheDocument();
    expect(getByTestId('spouse-financial-tab')).toBeInTheDocument();
  });

  it('shows user information by default', () => {
    const { getByTestId, getByRole } = render(<TestComponent />);
    expect(getByTestId('verify-info-typography')).toBeInTheDocument();
    expect(getByRole('button', { name: 'View Spouse' })).toBeInTheDocument();
    expect(getByTestId('personal-tab')).toBeInTheDocument();
    expect(getByTestId('financial-tab')).toBeInTheDocument();
  });

  it("renders the user's first name", async () => {
    const { getByTestId } = render(<TestComponent />);
    await waitFor(() => {
      expect(getByTestId('info-name-typography')).toHaveTextContent('Obi');
    });
  });

  it("renders the user's avatar", async () => {
    const { findByRole } = render(<TestComponent />);
    const avatarImg = await findByRole('img');
    expect(avatarImg).toBeInTheDocument();
  });
});
