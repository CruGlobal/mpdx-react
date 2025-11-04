import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { DirectionButtons } from './DirectionButtons';

const handleNext = jest.fn();
const submit = jest.fn();
const pushMock = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: { accountListId: 'account-list-1' },
      }}
    >
      <Formik initialValues={{}} onSubmit={submit}>
        <DirectionButtons handleNext={handleNext} />
      </Formik>
    </TestRouter>
  </ThemeProvider>
);

jest.mock('src/hooks/useAccountListId', () => ({
  useAccountListId: () => 'account-list-1',
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('DirectionButtons', () => {
  it('renders Cancel and Continue buttons', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'CANCEL' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'CONTINUE' })).toBeInTheDocument();
  });

  it('calls handleNext when Continue is clicked', () => {
    const { getByRole } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'CONTINUE' });
    continueButton.click();

    expect(handleNext).toHaveBeenCalled();
  });

  it('navigates to the correct URL when Cancel is clicked', async () => {
    const { getByRole, findByRole, getByText } = render(<TestComponent />);
    const cancelButton = getByRole('button', { name: 'CANCEL' });

    await userEvent.click(cancelButton);

    expect(await findByRole('dialog')).toBeInTheDocument();
    expect(getByText('Do you want to cancel?')).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /yes, cancel/i }));

    expect(pushMock).toHaveBeenCalledWith(
      '/accountLists/account-list-1/reports/housingAllowance',
    );
  });
});
