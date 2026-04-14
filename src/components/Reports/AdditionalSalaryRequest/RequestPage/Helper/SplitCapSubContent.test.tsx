import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { FormikProvider, useFormik } from 'formik';
import { I18nextProvider } from 'react-i18next';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { SplitCapSubContent } from './SplitCapSubContent';

jest.mock('../../Shared/AdditionalSalaryRequestContext', () => ({
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const FormikWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const formik = useFormik<CompleteFormValues>({
    initialValues: { ...defaultCompleteFormValues },
    onSubmit: jest.fn(),
  });
  return <FormikProvider value={formik}>{children}</FormikProvider>;
};

const setupContext = (opts: {
  spouseCap: number | null;
  spousePending?: number;
  spouseGross?: number;
}) => {
  const { spouseCap, spousePending = 0, spouseGross = 40000 } = opts;
  mockUseAdditionalSalaryRequest.mockReturnValue({
    traditional403bPercentage: 0.12,
    roth403bPercentage: 0.1,
    user: { currentSalary: { grossSalaryAmount: 50000 } },
    spouse:
      spouseCap !== null
        ? { currentSalary: { grossSalaryAmount: spouseGross } }
        : undefined,
    requestData: {
      latestAdditionalSalaryRequest: {
        calculations: { currentSalaryCap: 60000, pendingAsrAmount: 0 },
        spouseCalculations:
          spouseCap !== null
            ? {
                currentSalaryCap: spouseCap,
                pendingAsrAmount: spousePending,
              }
            : null,
      },
    },
  } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);
};

const renderSplitCapSubContent = (spouseName = 'Jane') =>
  render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <FormikWrapper>
          <SplitCapSubContent spouseName={spouseName} />
        </FormikWrapper>
      </I18nextProvider>
    </ThemeProvider>,
  );

describe('SplitCapSubContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders existing copy with spouse name and Progressive Approvals link', () => {
    setupContext({ spouseCap: 50000 });

    const { getByText, getByRole } = renderSplitCapSubContent('Jane');

    expect(
      getByText(/Please make adjustments to your request/),
    ).toBeInTheDocument();
    expect(
      getByText(/separate request up to Jane's maximum allowable salary/),
    ).toBeInTheDocument();
    expect(
      getByRole('link', { name: 'Progressive Approvals' }),
    ).toBeInTheDocument();
  });

  it('renders status bar header with spouse salary and cap amounts', () => {
    setupContext({
      spouseCap: 50000,
      spousePending: 2000,
      spouseGross: 40000,
    });

    const { getByText } = renderSplitCapSubContent('Jane');

    // spouse total = 40000 + 2000 = 42000, cap = 50000
    expect(
      getByText("Jane's Salary / Max Allowable Salary"),
    ).toBeInTheDocument();
    expect(getByText('$42,000.00 / $50,000.00')).toBeInTheDocument();
  });

  it('renders remaining amount in footer', () => {
    setupContext({
      spouseCap: 50000,
      spousePending: 2000,
      spouseGross: 40000,
    });

    const { getByText } = renderSplitCapSubContent('Jane');

    expect(
      getByText("Remaining in Jane's Max Allowable Salary"),
    ).toBeInTheDocument();
    expect(getByText('$8,000.00')).toBeInTheDocument();
  });

  it('renders progress bar with correct value', () => {
    setupContext({
      spouseCap: 50000,
      spousePending: 2000,
      spouseGross: 40000,
    });

    const { getByRole } = renderSplitCapSubContent('Jane');

    const progressBar = getByRole('progressbar');
    // 42000 / 50000 = 84%
    expect(progressBar).toHaveAttribute('aria-valuenow', '84');
  });

  it('shows 100% bar and $0 remaining when spouse is at cap', () => {
    setupContext({
      spouseCap: 50000,
      spousePending: 10000,
      spouseGross: 40000,
    });

    const { getByText, getByRole } = renderSplitCapSubContent('Jane');

    expect(getByText('$50,000.00 / $50,000.00')).toBeInTheDocument();
    expect(getByText('$0.00')).toBeInTheDocument();
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('does not render status bar when spouse cap is 0', () => {
    setupContext({ spouseCap: 0 });

    const { queryByRole } = renderSplitCapSubContent('Jane');

    expect(queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('does not render the status bar when spouse cap is unavailable', () => {
    setupContext({ spouseCap: null });

    const { queryByRole, queryByText, getByText } =
      renderSplitCapSubContent('Jane');

    expect(
      getByText(/Please make adjustments to your request/),
    ).toBeInTheDocument();
    expect(queryByRole('progressbar')).not.toBeInTheDocument();
    expect(queryByText(/Max Allowable Salary/)).not.toBeInTheDocument();
  });
});
