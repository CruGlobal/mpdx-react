import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import {
  DeepPartialMock,
  GqlMockedProvider,
} from '__tests__/util/graphqlMocking';
import {
  AsrStatusEnum,
  ProgressiveApprovalTierReasonEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { HcmQuery } from '../../Shared/HcmData/Hcm.generated';
import { AdditionalSalaryRequestQuery } from '../AdditionalSalaryRequest.generated';
import { openAvailableBalanceTooltip } from '../FormVersions/testUtils';
import { AdditionalSalaryRequestProvider } from '../Shared/AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from '../Shared/CompleteForm.mock';
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

const hcmMocks = {
  Hcm: {
    hcm: [
      {
        id: '1',
        staffInfo: {
          id: 'staff-1',
          firstName: 'John',
          lastName: 'Doc',
          preferredName: 'Doc, John',
          personNumber: '00123456',
        },
      },
      {
        id: '2',
        staffInfo: {
          id: 'staff-2',
          firstName: 'Jane',
          lastName: 'Doe',
          preferredName: 'Jane',
          personNumber: '00123457',
        },
      },
    ],
  },
};

type AboutFormMocks = {
  Hcm: HcmQuery;
  AdditionalSalaryRequest: AdditionalSalaryRequestQuery;
};

interface TestWrapperProps {
  asrMocks?: DeepPartialMock<AboutFormMocks>;
  onCall?: jest.Mock;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ asrMocks, onCall }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <SnackbarProvider>
        <GqlMockedProvider<AboutFormMocks>
          mocks={{ ...hcmMocks, ...asrMocks }}
          onCall={onCall}
        >
          <AdditionalSalaryRequestProvider>
            <Formik
              initialValues={defaultCompleteFormValues}
              onSubmit={jest.fn()}
            >
              <AboutForm />
            </Formik>
          </AdditionalSalaryRequestProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
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

  it('shows the name skeleton until HCM loads', async () => {
    const { getByTestId, findByText, queryByTestId } = render(<TestWrapper />);

    expect(getByTestId('name-display-skeleton')).toBeInTheDocument();
    expect(await findByText('Doc, John')).toBeInTheDocument();
    expect(queryByTestId('name-display-skeleton')).not.toBeInTheDocument();
  });

  it('should display user information', async () => {
    const { findByText } = render(<TestWrapper />);

    expect(await findByText('Doc, John')).toBeInTheDocument();
  });

  it('should display financial data when a request exists', async () => {
    const { findByText, queryByText } = render(<TestWrapper />);

    expect(
      await findByText(/^Available for This Request$/i),
    ).toBeInTheDocument();
    expect(queryByText(/Primary Account Balance/i)).not.toBeInTheDocument();
    expect(
      await findByText(/Your Maximum Allowable Salary \(CAP\)/i),
    ).toBeInTheDocument();
    expect(await findByText('REMAINING ALLOWABLE SALARY')).toBeInTheDocument();
  });

  // MPDX-10239: after a paid request, its amount was shown as room still left
  it('shows the remaining salary the API counts after a paid request', async () => {
    const { findByTestId } = render(
      <TestWrapper
        asrMocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: {
              status: AsrStatusEnum.ApprovedAndPaid,
              calculations: {
                currentSalaryCap: 120000,
                grossAnnualSalary: 60000,
                ytdAsrAmount: 0,
                remainingAllowableSalary: 30000,
              },
            },
          },
        }}
      />,
    );

    expect(await findByTestId('amount-three')).toHaveTextContent('$30,000.00');
  });

  it('explains the available amount in a tooltip beside its label', async () => {
    const utils = render(
      <TestWrapper
        asrMocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: {
              calculations: {
                staffAccountBalance: 1500,
                staffAccountDeficitLimit: 500,
                unpaidHouseholdAsrAmount: 800,
                unpaidHouseholdAsrs: [
                  {
                    amount: 800,
                    status: AsrStatusEnum.Pending,
                    submittedAt: null,
                    spouse: true,
                  },
                ],
              },
            },
          },
        }}
      />,
    );

    await utils.findByTestId('amount-one');
    expect(utils.queryByText(/Primary balance/)).not.toBeInTheDocument();
    const tooltip = await openAvailableBalanceTooltip(utils);
    expect(tooltip).toHaveTextContent(
      'Primary balance of $1,500.00, plus deficit limit of $500.00, minus $800.00 in other unpaid requests',
    );
    expect(tooltip).toHaveTextContent(
      "Your spouse's request, waiting for approval: $800.00",
    );
  });

  it('shows the approval note inside the card, under the amounts', async () => {
    const { findByText, getByTestId } = render(
      <TestWrapper
        asrMocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: {
              calculations: {
                approvalThreshold: 30000,
                approvalThresholdReason:
                  ProgressiveApprovalTierReasonEnum.OverUserCap,
              },
            },
          },
        }}
      />,
    );

    const note = await findByText(
      /Requests over \$30,000\.00 \(your remaining allowable salary\) need approval/,
    );
    expect(note.closest('.MuiCard-root')).toContainElement(
      getByTestId('amount-one'),
    );
  });

  // MPDX-10269: the spouse figure comes from the API, not cap - gross - ytd ($10,000 here)
  it("shows the spouse's remaining salary from the API", async () => {
    const { findByText } = render(
      <TestWrapper
        asrMocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: {
              spouseCalculations: {
                currentSalaryCap: 60000,
                grossAnnualSalary: 45000,
                ytdAsrAmount: 5000,
                remainingAllowableSalary: 4000,
              },
            },
          },
        }}
      />,
    );

    expect(
      await findByText('Up to their remaining allowable salary of $4,000'),
    ).toBeInTheDocument();
  });

  it('should hide financial data when no request has been created yet', async () => {
    const mutationSpy = jest.fn();
    const { findByText, queryByText } = render(
      <TestWrapper
        asrMocks={{
          AdditionalSalaryRequest: { latestAdditionalSalaryRequest: null },
        }}
        onCall={mutationSpy}
      />,
    );

    // The CardHeader name proves the form rendered; absence assertions below
    // document that only the financial portion is hidden when no ASR exists.
    expect(await findByText('Doc, John')).toBeInTheDocument();
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AdditionalSalaryRequest'),
    );
    expect(queryByText(/Available for This Request/i)).not.toBeInTheDocument();
    expect(
      queryByText(/Your Maximum Allowable Salary \(CAP\)/i),
    ).not.toBeInTheDocument();
    expect(queryByText('REMAINING ALLOWABLE SALARY')).not.toBeInTheDocument();
  });

  it('should link to the Progressive Approvals document', () => {
    const { getByRole } = render(<TestWrapper />);

    expect(
      getByRole('link', { name: 'Progressive Approvals' }),
    ).toHaveAttribute(
      'href',
      'https://drive.google.com/file/d/1Z1WuiIUMrmfrUUV0V-ACCdhyuSd1Cgzg/view?usp=drive_link',
    );
  });

  it('should link to the paper version document', () => {
    const { getByRole } = render(<TestWrapper />);

    expect(getByRole('link', { name: 'paper version' })).toHaveAttribute(
      'href',
      'https://drive.google.com/file/d/1BXoJGnr9Gc3_KAek8jI8RsKAOo_We0JV/view?usp=drive_link',
    );
  });
});
