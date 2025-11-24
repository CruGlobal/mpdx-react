import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import {
  AdditionalSalaryRequestProvider,
  AdditionalSalaryRequestType,
} from '../Shared/AdditionalSalaryRequestContext';
import { AboutForm } from './AboutForm';

const mockHandleContinue = jest.fn();

const mockSectionOrder = [
  {
    title: 'About this Form',
    section: AdditionalSalaryRequestSectionEnum.AboutForm,
  },
  {
    title: 'Complete Form',
    section: AdditionalSalaryRequestSectionEnum.CompleteForm,
  },
  {
    title: 'Receipt',
    section: AdditionalSalaryRequestSectionEnum.Receipt,
  },
];

jest.mock('../Shared/AdditionalSalaryRequestContext', () => ({
  ...jest.requireActual('../Shared/AdditionalSalaryRequestContext'),
  useAdditionalSalaryRequest: (): AdditionalSalaryRequestType => ({
    sectionOrder: mockSectionOrder,
    handleContinue: mockHandleContinue,
    selectedSection: mockSectionOrder[0 /* AboutForm */],
    isDrawerOpen: false,
    toggleDrawer: jest.fn(),
    setSelectedSection: jest.fn(),
    setIsDrawerOpen: jest.fn(),
  }),
}));

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
  beforeEach(() => {
    mockHandleContinue.mockClear();
  });

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
    expect(getByText('PRIMARY ACCOUNT BALANCE')).toBeInTheDocument();
    expect(getByText('YOUR REMAINING ALLOWABLE SALARY')).toBeInTheDocument();
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
