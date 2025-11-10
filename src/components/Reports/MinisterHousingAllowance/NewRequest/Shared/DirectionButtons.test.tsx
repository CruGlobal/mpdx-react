import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from '../../Shared/MinisterHousingAllowanceContext';
import { DirectionButtons } from './DirectionButtons';

const submit = jest.fn();
const pushMock = jest.fn();
const handleNextStep = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: { accountListId: 'account-list-1' },
      }}
    >
      <Formik initialValues={{}} onSubmit={submit}>
        <MinisterHousingAllowanceProvider>
          <DirectionButtons />
        </MinisterHousingAllowanceProvider>
      </Formik>
    </TestRouter>
  </ThemeProvider>
);

jest.mock('../../Shared/MinisterHousingAllowanceContext', () => ({
  ...jest.requireActual('../../Shared/MinisterHousingAllowanceContext'),
  useMinisterHousingAllowance: jest.fn(),
}));

(useMinisterHousingAllowance as jest.Mock).mockReturnValue({
  handleNextStep,
});

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

    expect(handleNextStep).toHaveBeenCalled();
  });
});
