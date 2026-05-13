import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { FormikProvider, useFormik } from 'formik';
import { ProgressiveApprovalTierReasonEnum } from 'pages/api/graphql-rest.page.generated';
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
      <FormikWrapper>
        <CapSubContent />
      </FormikWrapper>
    </ThemeProvider>,
  );

describe('CapSubContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Progressive Approvals messaging when reason is not board cap exception', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: {
        latestAdditionalSalaryRequest: {
          progressiveApprovalTier: {
            approver: 'Division Head',
            approvalTimeframe: '1-2 weeks',
          },
          progressiveApprovalTierReason:
            ProgressiveApprovalTierReasonEnum.OverUserCap,
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByText, queryByText } = renderCapSubContent();

    expect(getByText(/Progressive Approvals/)).toBeInTheDocument();
    expect(getByText(/Division Head/)).toBeInTheDocument();
    expect(getByText(/1-2 weeks/)).toBeInTheDocument();
    expect(
      queryByText(/You have a Board approved Maximum Allowable Salary/),
    ).not.toBeInTheDocument();
  });

  it('renders nothing when reason is board cap exception (message is carried by getCapOverrides)', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      requestData: {
        latestAdditionalSalaryRequest: {
          progressiveApprovalTier: null,
          progressiveApprovalTierReason:
            ProgressiveApprovalTierReasonEnum.BoardCapException,
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
