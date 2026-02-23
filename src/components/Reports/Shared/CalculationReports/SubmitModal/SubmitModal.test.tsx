import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormikProvider, useFormik } from 'formik';
import { SnackbarProvider } from 'notistack';
import * as yup from 'yup';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { CompleteFormValues } from 'src/components/Reports/AdditionalSalaryRequest/AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from 'src/components/Reports/AdditionalSalaryRequest/Shared/AdditionalSalaryRequestContext';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../../../MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from '../Shared/sharedTypes';
import { SubmitModal } from './SubmitModal';

jest.mock(
  'src/components/Reports/AdditionalSalaryRequest/Shared/AdditionalSalaryRequestContext',
);

const title = 'Test Title';
const content = 'Test Content';
const subContent = 'Test Sub Content';
const date = '2024-12-31';

const handleClose = jest.fn();
const handleConfirm = jest.fn();

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const baseFormValues: CompleteFormValues = {
  currentYearSalaryNotReceived: '0',
  previousYearSalaryNotReceived: '0',
  additionalSalaryWithinMax: '0',
  adoption: '0',
  traditional403bContribution: '0',
  roth403bContribution: '0',
  counselingNonMedical: '0',
  healthcareExpensesExceedingLimit: '0',
  babysittingMinistryEvents: '0',
  childrenMinistryTripExpenses: '0',
  childrenCollegeEducation: '0',
  movingExpense: '0',
  seminary: '0',
  housingDownPayment: '0',
  autoPurchase: '0',
  expensesNotApprovedWithin90Days: '0',
  deductTaxDeferredPercent: false,
  deductRothPercent: false,
  phoneNumber: '',
  emailAddress: '',
  totalAdditionalSalaryRequested: '0',
  additionalInfo: '',
};

const validationSchema = yup.object({
  additionalInfo: yup.string(),
});

const FormikWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const formik = useFormik({
    initialValues: baseFormValues,
    validationSchema,
    onSubmit: () => {},
  });

  const formikWithSchema = { ...formik, validationSchema };

  return <FormikProvider value={formikWithSchema}>{children}</FormikProvider>;
};

interface TestComponentProps {
  formTitle?: string;
  pageType?: PageEnum;
  overrideTitle?: string;
  overrideContent?: string;
  overrideSubContent?: string;
  isCancel?: boolean;
  isDiscard?: boolean;
  isDiscardEdit?: boolean;
  actionRequired?: boolean;
  additionalApproval?: boolean;
  splitAsr?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  formTitle = 'Main Title',
  pageType,
  overrideTitle,
  overrideContent,
  overrideSubContent,
  isCancel,
  isDiscard,
  isDiscardEdit,
  actionRequired,
  additionalApproval,
  splitAsr,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <SnackbarProvider>
        <GqlMockedProvider>
          <FormikWrapper>
            <MinisterHousingAllowanceProvider type={pageType}>
              <SubmitModal
                formTitle={formTitle}
                handleClose={handleClose}
                handleConfirm={handleConfirm}
                overrideTitle={overrideTitle}
                overrideContent={overrideContent}
                overrideSubContent={overrideSubContent}
                isCancel={isCancel}
                isDiscard={isDiscard}
                isDiscardEdit={isDiscardEdit}
                deadlineDate={date}
                actionRequired={actionRequired}
                additionalApproval={additionalApproval}
                splitAsr={splitAsr}
              />
            </MinisterHousingAllowanceProvider>
          </FormikWrapper>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('ConfirmationModal', () => {
  beforeEach(() => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      traditional403bPercentage: 0.12,
      roth403bPercentage: 0.1,
      requestData: {
        latestAdditionalSalaryRequest: {
          calculations: { currentSalaryCap: 10000 },
        },
      },
    } as ReturnType<typeof useAdditionalSalaryRequest>);
  });

  it('renders submit confirmation modal correctly', async () => {
    const { getByText, getByRole, findByText } = render(
      <TestComponent pageType={PageEnum.New} />,
    );

    expect(
      await findByText('Are you ready to submit your Main Title?'),
    ).toBeInTheDocument();
    expect(
      getByText('You are submitting your Main Title.'),
    ).toBeInTheDocument();

    expect(getByText(/12\/31\/2024/)).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /YES, CONTINUE/i }));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('renders update confirmation modal correctly', async () => {
    const { getByText, getByRole, findByRole } = render(
      <TestComponent pageType={PageEnum.Edit} actionRequired={true} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Are you ready to submit your updated Main Title?',
      }),
    ).toBeInTheDocument();

    expect(
      getByText(/you are submitting changes to your/i),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /YES, CONTINUE/i }));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('calls handleClose when modal is closed', async () => {
    const { getByRole, findByRole } = render(<TestComponent isCancel={true} />);

    expect(
      await findByRole('heading', {
        name: 'Do you want to cancel your Main Title?',
      }),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /BACK/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should override title, content, and subcontent when provided', async () => {
    const { getByText, findByText } = render(
      <TestComponent
        overrideTitle={title}
        overrideContent={content}
        overrideSubContent={subContent}
      />,
    );

    expect(await findByText(title)).toBeInTheDocument();
    expect(getByText(content)).toBeInTheDocument();
    expect(getByText(subContent)).toBeInTheDocument();
  });

  it('should render correct title when form is MHA Request', async () => {
    const { getByText } = render(
      <TestComponent
        formTitle="MHA Request"
        pageType={PageEnum.New}
        overrideTitle={undefined}
        actionRequired={true}
      />,
    );

    expect(
      await getByText(
        'You are submitting changes to your Annual MHA Request for board approval.',
      ),
    ).toBeInTheDocument();
  });

  it('renders discard modal correctly', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent isDiscard={true} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Do you want to discard?',
      }),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /BACK/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders discard changes modal correctly', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent isDiscardEdit={true} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Do you want to discard these changes?',
      }),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /BACK/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('Additional Salary Request', () => {
    it('shows TotalSalaryRequested and ApprovalProcess when additionalApproval is true and splitAsr is false', async () => {
      const { findByText, getByText } = render(
        <TestComponent additionalApproval={true} splitAsr={false} />,
      );

      expect(await findByText('Total Salary Requested')).toBeInTheDocument();
      expect(getByText('Approval Process')).toBeInTheDocument();
    });

    it('hides submit button when splitAsr is true', async () => {
      const { findByRole, queryByRole } = render(
        <TestComponent splitAsr={true} />,
      );

      await findByRole('dialog');

      expect(
        queryByRole('button', { name: /YES, CONTINUE/i }),
      ).not.toBeInTheDocument();
    });

    it('shows Submit For Approval button when additionalApproval is true', async () => {
      const { findByRole } = render(
        <TestComponent additionalApproval={true} splitAsr={false} />,
      );

      expect(
        await findByRole('button', { name: /Submit For Approval/i }),
      ).toBeInTheDocument();
    });
  });
});
