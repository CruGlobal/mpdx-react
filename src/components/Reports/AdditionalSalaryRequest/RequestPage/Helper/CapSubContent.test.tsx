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
import { CapSubContent } from './CapSubContent';

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
    initialValues: {
      ...defaultCompleteFormValues,
      totalAdditionalSalaryRequested: '5000',
    },
    onSubmit: jest.fn(),
  });
  return <FormikProvider value={formik}>{children}</FormikProvider>;
};

const renderCapSubContent = () =>
  render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <FormikWrapper>
          <CapSubContent />
        </FormikWrapper>
      </I18nextProvider>
    </ThemeProvider>,
  );

describe('CapSubContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Progressive Approvals messaging when hasBoardCapException is false', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      hasBoardCapException: false,
      requestData: {
        latestAdditionalSalaryRequest: {
          progressiveApprovalTier: {
            approver: 'Division Head',
            approvalTimeframe: '1-2 weeks',
          },
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByText, queryByText } = renderCapSubContent();

    expect(getByText(/Progressive Approvals/)).toBeInTheDocument();
    expect(
      queryByText(/You have a Board approved Maximum Allowable Salary/),
    ).not.toBeInTheDocument();
  });

  it('renders nothing when hasBoardCapException is true (message is carried by getCapOverrides)', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      hasBoardCapException: true,
      requestData: {
        latestAdditionalSalaryRequest: {
          progressiveApprovalTier: null,
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { container, queryByText } = renderCapSubContent();

    expect(container).toBeEmptyDOMElement();
    expect(
      queryByText(/You have a Board approved Maximum Allowable Salary/),
    ).not.toBeInTheDocument();
    expect(queryByText(/Progressive Approvals/)).not.toBeInTheDocument();
  });
});
