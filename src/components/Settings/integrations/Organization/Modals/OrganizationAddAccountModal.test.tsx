import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { OrganizationAddAccountModal } from './OrganizationAddAccountModal';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
  isReady: true,
};

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const handleClose = jest.fn();

describe('OrganizationAddAccountModal', () => {
  it('should render modal and handle close', () => {
    const { getByText, getByTestId, getByRole } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <OrganizationAddAccountModal handleClose={handleClose} />
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    expect(getByText('Add Organization Account')).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
    userEvent.click(getByTestId('CloseIcon'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
