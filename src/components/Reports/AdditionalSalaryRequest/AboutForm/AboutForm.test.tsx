import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AdditionalSalaryRequestProvider } from '../Shared/AdditionalSalaryRequestContext';
import { AboutForm } from './AboutForm';

const mockHandleContinue = jest.fn();

jest.mock('../Shared/AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../Shared/AdditionalSalaryRequestContext',
  );
  return {
    ...originalModule,
    useAdditionalSalaryRequest: () => ({
      ...originalModule.useAdditionalSalaryRequest(),
      handleNextStep: mockHandleContinue,
    }),
  };
});

const router = {
  query: { accountListId: 'account-list-1' },
  isReady: true,
};

const TestWrapper: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <I18nextProvider i18n={i18n}>
        <GqlMockedProvider>
          <AdditionalSalaryRequestProvider>
            <AboutForm />
          </AdditionalSalaryRequestProvider>
        </GqlMockedProvider>
      </I18nextProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('AboutForm', () => {
  it('should render the about form content', () => {
    const { getByText } = render(<TestWrapper />);

    expect(getByText('About this Form')).toBeInTheDocument();
    expect(
      getByText(
        'You can use this form to electronically submit additional salary requests. Please note:',
      ),
    ).toBeInTheDocument();
    expect(getByText(/adequate funds/i)).toBeInTheDocument();
    expect(
      getByText('will not exceed your Remaining Allowable Salary'),
    ).toBeInTheDocument();
  });

  it('should display user information and financial data', () => {
    const { getByText } = render(<TestWrapper />);

    expect(getByText('Doc, John')).toBeInTheDocument();
    expect(getByText('00123456')).toBeInTheDocument();
    expect(getByText('Primary Account Balance')).toBeInTheDocument();
    expect(getByText('Your Remaining Allowable Salary')).toBeInTheDocument();
  });

  it('should navigate to Complete Form section when Continue is clicked', async () => {
    const { getByText } = render(<TestWrapper />);

    const continueButton = getByText('Continue');
    userEvent.click(continueButton);

    await waitFor(() => {
      expect(mockHandleContinue).toHaveBeenCalled();
    });
  });

  it('should have Progressive Approvals link', () => {
    const { getByText } = render(<TestWrapper />);

    expect(getByText('Progressive Approvals')).toBeInTheDocument();
  });

  it('should have paper version download link', () => {
    const { getByText } = render(<TestWrapper />);

    expect(getByText('paper version')).toBeInTheDocument();
  });
});
