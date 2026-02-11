import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormikProvider, useFormik } from 'formik';
import { I18nextProvider } from 'react-i18next';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { TotalAnnualSalary } from './TotalAnnualSalary';

jest.mock('../../Shared/AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../../Shared/AdditionalSalaryRequestContext',
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
  maxAdditionalAllowableSalary: 100000,
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
  onForm?: boolean;
}

const renderComponent = ({
  initialValues,
  contextOverrides = {},
  onForm,
}: RenderComponentProps = {}) => {
  mockUseAdditionalSalaryRequest.mockReturnValue({
    ...defaultMockContextValue,
    ...contextOverrides,
  } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

  return render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <TestFormikWrapper initialValues={initialValues}>
          <TotalAnnualSalary onForm={onForm} />
        </TestFormikWrapper>
      </I18nextProvider>
    </ThemeProvider>,
  );
};

describe('TotalAnnualSalary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders accordion with title, table, and summary items', async () => {
    const { getByText, queryByTestId, getByRole } = renderComponent();

    expect(queryByTestId('card')).not.toBeInTheDocument();

    expect(getByText('Total Annual Salary')).toBeInTheDocument();
    expect(getByText('A review of your income')).toBeInTheDocument();

    const expandButton = getByRole('button', {
      name: 'Expand salary details',
    });
    userEvent.click(expandButton);

    await waitFor(() => {
      expect(getByText('Total Salary Requested')).toBeInTheDocument();
    });

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
    expect(getByText('Additional Salary on this Request')).toBeInTheDocument();
    expect(getByText('Total Annual Salary:')).toBeInTheDocument();

    expect(
      getByText('Does not include payments received for backpay.'),
    ).toBeInTheDocument();
    expect(
      getByText('Does not include requests made for backpay.'),
    ).toBeInTheDocument();
  });

  it('renders card version when onForm is true', () => {
    const { getByText, getByTestId } = renderComponent({ onForm: true });

    expect(getByTestId('card')).toBeInTheDocument();

    expect(getByText('Total Annual Salary')).toBeInTheDocument();
    expect(getByText('A review of your income')).toBeInTheDocument();
  });

  it('displays currency values correctly from context data', async () => {
    const { getByText, getByRole } = renderComponent();

    const expandButton = getByRole('button', {
      name: 'Expand salary details',
    });
    userEvent.click(expandButton);

    await waitFor(() => {
      expect(getByText('Total Salary Requested')).toBeInTheDocument();
    });

    expect(getByRole('table')).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Description' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();

    // Max allowable: $100,000.00
    expect(getByText('$100,000.00')).toBeInTheDocument();
    // Gross annual: $50,000.00
    expect(getByText('$50,000.00')).toBeInTheDocument();
    // Additional received: $5,000.00
    expect(getByText('$5,000.00')).toBeInTheDocument();
    // Total = 50000 + 5000 + 0 = $55,000.00
    expect(getByText('$55,000.00')).toBeInTheDocument();
    // Remaining = 100000 - 55000 = $45,000.00
    expect(getByText('$45,000.00')).toBeInTheDocument();

    // Progress bar: always 100 (determinate)
    const progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('displays additional salary from form values', async () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '5000',
      adoption: '2000',
      counselingNonMedical: '3000',
    };

    const { getAllByText, getByRole, getByText } = renderComponent({
      initialValues: valuesWithSalary,
    });

    const expandButton = getByRole('button', {
      name: 'Expand salary details',
    });
    userEvent.click(expandButton);

    await waitFor(() => {
      expect(getByText('Total Salary Requested')).toBeInTheDocument();
    });

    // Additional salary on this request should be $10,000.00
    expect(getAllByText('$10,000.00').length).toBeGreaterThanOrEqual(1);
  });
});
