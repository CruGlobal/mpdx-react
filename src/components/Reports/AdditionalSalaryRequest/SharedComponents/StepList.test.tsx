import { render, waitFor } from '@testing-library/react';
import { PageEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { AdditionalSalaryRequestTestWrapper } from '../AdditionalSalaryRequestTestWrapper';
import { EditForm } from '../FormVersions/Edit/EditForm';
import { NewForm } from '../FormVersions/New/NewForm';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { StepList } from './StepList';

jest.mock('../Shared/AdditionalSalaryRequestContext', () => ({
  ...jest.requireActual('../Shared/AdditionalSalaryRequestContext'),
  useAdditionalSalaryRequest: jest.fn(),
}));

const defaultInitialValues: CompleteFormValues = {
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
  totalAdditionalSalaryRequested: '0',
  emailAddress: '',
  additionalInfo: '',
};

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const mockContextValue = {
  staffAccountId: 'staff-1',
  staffAccountIdLoading: false,
  steps: [],
  currentIndex: 0,
  currentStep: AdditionalSalaryRequestSectionEnum.AboutForm,
  handleNextStep: jest.fn(),
  handlePreviousStep: jest.fn(),
  goToStep: jest.fn(),
  isDrawerOpen: false,
  toggleDrawer: jest.fn(),
  requestData: null,
  requestError: undefined,
  pageType: PageEnum.New,
  setPageType: jest.fn(),
  handleDeleteRequest: jest.fn(),
  requestId: undefined,
  user: undefined,
  spouse: undefined,
  salaryInfo: undefined,
  isInternational: false,
  isMutating: false,
  trackMutation: jest.fn(),
  loading: false,
  traditional403bPercentage: 0,
  roth403bPercentage: 0,
  isNewAsr: false,
  setIsNewAsr: jest.fn(),
  isSpouse: false,
};

describe('StepList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with NewForm', () => {
    const TestComponent: React.FC = () => (
      <AdditionalSalaryRequestTestWrapper>
        <StepList FormComponent={NewForm} />
      </AdditionalSalaryRequestTestWrapper>
    );

    it('renders AboutForm when currentIndex is 0', async () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...mockContextValue,
        currentIndex: 0,
      });

      const { getByText } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByText('About this Form')).toBeInTheDocument(),
      );
    });

    it('renders NewForm when currentIndex is 1', async () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...mockContextValue,
        currentIndex: 1,
      });

      const { getByText } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByText('Additional Salary Request')).toBeInTheDocument(),
      );
    });

    it('renders Receipt when currentIndex is 2', async () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...mockContextValue,
        currentIndex: 2,
      });

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(
          getByText('Thank you for Submitting your Additional Salary Request!'),
        ).toBeInTheDocument();
        expect(
          getByText(/your request has been sent to payroll/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('with EditForm', () => {
    const TestComponent: React.FC = () => (
      <AdditionalSalaryRequestTestWrapper pageType={PageEnum.Edit}>
        <StepList FormComponent={EditForm} />
      </AdditionalSalaryRequestTestWrapper>
    );

    it('renders AboutForm when currentIndex is 0', async () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...mockContextValue,
        currentIndex: 0,
      });

      const { getByText } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByText('About this Form')).toBeInTheDocument(),
      );
    });

    it('renders EditForm when currentIndex is 1', async () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...mockContextValue,
        currentIndex: 1,
      });

      const { getByText } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByText('Edit Your Request')).toBeInTheDocument(),
      );
    });

    it('renders Receipt when currentIndex is 2', async () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...mockContextValue,
        currentIndex: 2,
        pageType: PageEnum.Edit,
      });

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(
          getByText('Thank you for updating your Additional Salary Request!'),
        ).toBeInTheDocument();
        expect(
          getByText(/we will review your updated request/i),
        ).toBeInTheDocument();
      });
    });
  });

  it('renders null when currentIndex is out of bounds', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...mockContextValue,
      currentIndex: 99,
    });

    const { queryByText } = render(
      <AdditionalSalaryRequestTestWrapper>
        <StepList FormComponent={NewForm} />
      </AdditionalSalaryRequestTestWrapper>,
    );

    expect(queryByText('About this Form')).not.toBeInTheDocument();
    expect(queryByText('Complete the Form')).not.toBeInTheDocument();
    expect(
      queryByText('Thank you for Submitting your Additional Salary Request!'),
    ).not.toBeInTheDocument();
  });

  describe('Exceeds cap', () => {
    it('renders exceeds cap (for single) text when true', async () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...mockContextValue,
        currentIndex: 2,
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: {
              currentSalaryCap: 500,
            },
          },
        },
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

      const { getByText } = render(
        <AdditionalSalaryRequestTestWrapper
          initialValues={{
            ...defaultInitialValues,
            currentYearSalaryNotReceived: '1000',
          }}
        >
          <StepList FormComponent={NewForm} />
        </AdditionalSalaryRequestTestWrapper>,
      );

      await waitFor(() => {
        expect(
          getByText(
            /because your request exceeds your remaining allowable salary/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('renders exceeds cap (for married) text when true', async () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...mockContextValue,
        currentIndex: 2,
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: {
              currentSalaryCap: 500,
            },
            spouseCalculations: {
              currentSalaryCap: 500,
              pendingAsrAmount: 600,
            },
          },
        },
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

      const { getByText } = render(
        <AdditionalSalaryRequestTestWrapper
          initialValues={{
            ...defaultInitialValues,
            currentYearSalaryNotReceived: '1000',
          }}
        >
          <StepList FormComponent={NewForm} />
        </AdditionalSalaryRequestTestWrapper>,
      );

      await waitFor(() => {
        expect(
          getByText(
            /because your request exceeds your remaining allowable salary/i,
          ),
        ).toBeInTheDocument();
      });
    });
  });
});
