import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormikProvider, useFormik } from 'formik';
import { I18nextProvider } from 'react-i18next';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { CompleteFormValues } from '../MainPages/OverviewPage';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from '../Shared/CompleteForm.mock';
import { TotalAnnualSalarySummaryCard } from './TotalAnnualSalarySummaryCard';

jest.mock('../Shared/AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../Shared/AdditionalSalaryRequestContext',
  );
  return {
    ...originalModule,
    useAdditionalSalaryRequest: jest.fn(),
  };
});

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const defaultMockContextValue = {
  requestData: {
    latestAdditionalSalaryRequest: {
      id: 'test-request-id',
      traditional403bContribution: 0.12,
      calculations: {
        maxAmountAndReason: { amount: 100000 },
        pendingAsrAmount: 5000,
      },
    },
  },
  user: {
    currentSalary: {
      grossSalaryAmount: 50000,
    },
  },
};

interface TestWrapperProps {
  children: React.ReactNode;
  initialValues?: CompleteFormValues;
}

const TestFormikWrapper: React.FC<TestWrapperProps> = ({
  children,
  initialValues = defaultCompleteFormValues,
}) => {
  const formik = useFormik<CompleteFormValues>({
    initialValues,
    onSubmit: () => {},
    enableReinitialize: true,
  });

  return <FormikProvider value={formik}>{children}</FormikProvider>;
};

interface RenderComponentProps {
  initialValues?: CompleteFormValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextOverrides?: Record<string, any>;
}

const renderComponent = ({
  initialValues,
  contextOverrides = {},
}: RenderComponentProps = {}) => {
  mockUseAdditionalSalaryRequest.mockReturnValue({
    ...defaultMockContextValue,
    ...contextOverrides,
  } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

  return render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <TestFormikWrapper initialValues={initialValues}>
          <TotalAnnualSalarySummaryCard />
        </TestFormikWrapper>
      </I18nextProvider>
    </ThemeProvider>,
  );
};

describe('TotalAnnualSalarySummaryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders card structure with title, table, and summary items', () => {
    const { getByText } = renderComponent();

    expect(getByText('Total Annual Salary')).toBeInTheDocument();
    expect(getByText('A review of your income')).toBeInTheDocument();

    expect(getByText('Total Salary Requested')).toBeInTheDocument();
    expect(
      getByText('Remaining in your Max Allowable Salary'),
    ).toBeInTheDocument();

    expect(getByText('Description')).toBeInTheDocument();
    expect(getByText('Amount')).toBeInTheDocument();

    expect(getByText('Maximum Allowable Salary')).toBeInTheDocument();
    expect(getByText('Gross Annual Salary')).toBeInTheDocument();
    expect(
      getByText('Additional Salary Received This Year'),
    ).toBeInTheDocument();
    expect(getByText('Additional Salary on This Request')).toBeInTheDocument();
    expect(getByText('Total Annual Salary:')).toBeInTheDocument();

    expect(
      getByText('Does not include payments received for backpay.'),
    ).toBeInTheDocument();
    expect(
      getByText('Does not include requests made for backpay.'),
    ).toBeInTheDocument();
  });

  it('displays currency values correctly from context data', () => {
    const { getByText, getByRole } = renderComponent();

    // Max allowable: $100,000
    expect(getByText('$100,000')).toBeInTheDocument();
    // Gross annual: $50,000
    expect(getByText('$50,000')).toBeInTheDocument();
    // Additional received: $5,000
    expect(getByText('$5,000')).toBeInTheDocument();
    // Total = 50000 + 5000 + 0 = $55,000
    expect(getByText('$55,000')).toBeInTheDocument();
    // Remaining = 100000 - 55000 = $45,000
    expect(getByText('$45,000')).toBeInTheDocument();

    // Progress bar: 55%
    const progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '55');
  });

  it('displays additional salary from form values', () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '5000',
      adoption: '2000',
      counselingNonMedical: '3000',
    };

    const { getAllByText } = renderComponent({
      initialValues: valuesWithSalary,
    });

    // Additional salary on this request should be $10,000
    expect(getAllByText('$10,000').length).toBeGreaterThanOrEqual(1);
  });

  describe('expand/collapse functionality', () => {
    it('starts expanded and can be collapsed', async () => {
      const { getByText, getByRole } = renderComponent();

      expect(getByText('Description')).toBeInTheDocument();

      const expandButton = getByRole('button', {
        name: 'Collapse salary details',
      });
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');

      userEvent.click(expandButton);

      await waitFor(() => {
        expect(
          getByRole('button', { name: 'Expand salary details' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('over max warning state', () => {
    it('shows warning icon and negative remaining when over max', () => {
      const { container, getByText, getByRole } = renderComponent({
        contextOverrides: {
          requestData: {
            latestAdditionalSalaryRequest: {
              id: 'test-request-id',
              traditional403bContribution: 0.12,
              calculations: {
                maxAmountAndReason: { amount: 50000 },
                pendingAsrAmount: 10000,
              },
            },
          },
          user: {
            currentSalary: {
              grossSalaryAmount: 60000,
            },
          },
        },
      });

      const warningIcon = container.querySelector(
        '[data-testid="WarningAmberIcon"]',
      );
      expect(warningIcon).toBeInTheDocument();

      // Progress capped at 100%
      const progressBar = getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');

      // Remaining: 50000 - 70000 = -$20,000
      expect(getByText('-$20,000')).toBeInTheDocument();
    });

    it('does not show warning icon when under max allowable', () => {
      const { container } = renderComponent();

      const warningIcon = container.querySelector(
        '[data-testid="WarningAmberIcon"]',
      );
      expect(warningIcon).not.toBeInTheDocument();
    });

    it('does not show warning icon when maxAllowableSalary is zero', () => {
      const { container } = renderComponent({
        contextOverrides: {
          requestData: {
            latestAdditionalSalaryRequest: {
              id: 'test-request-id',
              traditional403bContribution: 0.12,
              calculations: {
                maxAmountAndReason: { amount: 0 },
                predictedYearIncome: 50000,
                pendingAsrAmount: 5000,
              },
            },
          },
        },
      });

      const warningIcon = container.querySelector(
        '[data-testid="WarningAmberIcon"]',
      );
      expect(warningIcon).not.toBeInTheDocument();
    });
  });
});
