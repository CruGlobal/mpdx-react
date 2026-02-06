import { ThemeProvider } from '@mui/material/styles';
import { act, renderHook, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import {
  AdditionalSalaryRequestQuery,
  SalaryInfoQuery,
  SubmitAdditionalSalaryRequestMutation,
  UpdateAdditionalSalaryRequestMutation,
} from '../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import {
  AdditionalSalaryRequestType,
  useAdditionalSalaryRequest,
} from './AdditionalSalaryRequestContext';
import {
  fieldConfig,
  useAdditionalSalaryRequestForm,
} from './useAdditionalSalaryRequestForm';

jest.mock('./AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual('./AdditionalSalaryRequestContext');
  return {
    ...originalModule,
    useAdditionalSalaryRequest: jest.fn(),
  };
});

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const mockHandleNextStep = jest.fn();

const defaultMockContextValue: AdditionalSalaryRequestType = {
  staffAccountId: 'staff-account-1',
  staffAccountIdLoading: false,
  steps: [],
  currentIndex: 1,
  currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
  handleNextStep: mockHandleNextStep,
  handlePreviousStep: jest.fn(),
  isDrawerOpen: true,
  toggleDrawer: jest.fn(),
  requestData: null,
  loading: false,
  requestError: undefined,
  pageType: PageEnum.New,
  handleDeleteRequest: jest.fn(),
  requestId: 'test-request-id',
  user: undefined,
  spouse: undefined,
  salaryInfo: {
    id: '1',
    maxAdoptionInt: 15000,
    maxAdoptionUss: 15000,
    maxAutoPurchaseInt: 25000,
    maxAutoPurchaseUss: 25000,
    maxCollegeInt: 21000,
    maxCollegeUss: 21000,
    maxHousingDownPaymentInt: 50000,
    maxHousingDownPaymentUss: 50000,
  },
  isInternational: false,
  isMutating: false,
  trackMutation: jest.fn((mutation) => mutation),
  traditional403bPercentage: 0,
};

const defaultFormValues: CompleteFormValues = {
  currentYearSalaryNotReceived: '0',
  previousYearSalaryNotReceived: '0',
  additionalSalaryWithinMax: '0',
  adoption: '0',
  traditional403bContribution: '0',
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
  deductTwelvePercent: false,
  phoneNumber: '',
  totalAdditionalSalaryRequested: '0',
  emailAddress: '',
  additionalInfo: '',
};

const mutationSpy = jest.fn();

type MocksType = {
  AdditionalSalaryRequest: AdditionalSalaryRequestQuery;
  SalaryInfo: SalaryInfoQuery;
  UpdateAdditionalSalaryRequest: UpdateAdditionalSalaryRequestMutation;
  SubmitAdditionalSalaryRequest: SubmitAdditionalSalaryRequestMutation;
};

const defaultGqlMocks: DeepPartial<MocksType> = {
  AdditionalSalaryRequest: {
    latestAdditionalSalaryRequest: {
      id: 'test-request-id',
      calculations: {
        maxAmountAndReason: {
          amount: 100000,
        },
        pendingAsrAmount: 0,
      },
    },
  },
};

interface TestComponentProps {
  children: React.ReactElement;
  mocks?: DeepPartial<MocksType>;
}

const TestWrapper: React.FC<TestComponentProps> = ({ children, mocks }) => {
  return (
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        AdditionalSalaryRequest: AdditionalSalaryRequestQuery;
        SalaryInfo: SalaryInfoQuery;
        UpdateAdditionalSalaryRequest: UpdateAdditionalSalaryRequestMutation;
        SubmitAdditionalSalaryRequest: SubmitAdditionalSalaryRequestMutation;
      }>
        mocks={mocks ?? defaultGqlMocks}
        onCall={mutationSpy}
      >
        {children}
      </GqlMockedProvider>
    </ThemeProvider>
  );
};

describe('useAdditionalSalaryRequestForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdditionalSalaryRequest.mockReturnValue(defaultMockContextValue);
  });

  describe('fieldConfig', () => {
    it('should have all expected field configurations', () => {
      expect(fieldConfig).toHaveLength(15);

      const fieldKeys = fieldConfig.map((f) => f.key);
      expect(fieldKeys).toContain('currentYearSalaryNotReceived');
      expect(fieldKeys).toContain('previousYearSalaryNotReceived');
      expect(fieldKeys).toContain('additionalSalaryWithinMax');
      expect(fieldKeys).toContain('adoption');
      expect(fieldKeys).toContain('housingDownPayment');
    });

    it('should have salaryInfo keys for fields with dynamic max values', () => {
      const adoptionConfig = fieldConfig.find((f) => f.key === 'adoption');
      const housingConfig = fieldConfig.find(
        (f) => f.key === 'housingDownPayment',
      );
      const autoConfig = fieldConfig.find((f) => f.key === 'autoPurchase');
      const collegeConfig = fieldConfig.find(
        (f) => f.key === 'childrenCollegeEducation',
      );

      expect(adoptionConfig?.salaryInfoIntKey).toBe('maxAdoptionInt');
      expect(adoptionConfig?.salaryInfoUssKey).toBe('maxAdoptionUss');
      expect(housingConfig?.salaryInfoIntKey).toBe('maxHousingDownPaymentInt');
      expect(housingConfig?.salaryInfoUssKey).toBe('maxHousingDownPaymentUss');
      expect(autoConfig?.salaryInfoIntKey).toBe('maxAutoPurchaseInt');
      expect(autoConfig?.salaryInfoUssKey).toBe('maxAutoPurchaseUss');
      expect(collegeConfig?.salaryInfoIntKey).toBe('maxCollegeInt');
      expect(collegeConfig?.salaryInfoUssKey).toBe('maxCollegeUss');
    });
  });

  describe('initialValues', () => {
    it('should return default initial values when no request data exists', async () => {
      const { result } = renderHook(() => useAdditionalSalaryRequestForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.values).toEqual(defaultFormValues);
    });

    it('should use provided initial values when passed', async () => {
      const providedValues: CompleteFormValues = {
        ...defaultFormValues,
        currentYearSalaryNotReceived: '1000',
        phoneNumber: '555-1234',
      };

      const { result } = renderHook(
        () => useAdditionalSalaryRequestForm(providedValues),
        {
          wrapper: TestWrapper,
        },
      );

      expect(result.current.values.currentYearSalaryNotReceived).toBe('1000');
      expect(result.current.values.phoneNumber).toBe('555-1234');
    });

    it('should populate initial values from request data query', async () => {
      const mocks = {
        AdditionalSalaryRequest: {
          latestAdditionalSalaryRequest: {
            id: 'test-request-id',
            currentYearSalaryNotReceived: 500,
            previousYearSalaryNotReceived: 200,
            additionalSalaryWithinMax: 0,
            adoption: 0,
            traditional403bContribution: 0,
            counselingNonMedical: 0,
            healthcareExpensesExceedingLimit: 0,
            babysittingMinistryEvents: 0,
            childrenMinistryTripExpenses: 0,
            childrenCollegeEducation: 0,
            movingExpense: 0,
            seminary: 0,
            housingDownPayment: 0,
            autoPurchase: 0,
            expensesNotApprovedWithin90Days: 0,
            deductTwelvePercent: true,
            phoneNumber: '123-456-7890',
            calculations: {
              currentSalaryCap: 50000,
              staffAccountBalance: 20000,
              predictedYearIncome: 40000,
              pendingAsrAmount: 0,
              maxAmountAndReason: {
                amount: 10000,
                reason: 'Test reason',
              },
            },
          },
        },
      };

      const { result } = renderHook(() => useAdditionalSalaryRequestForm(), {
        wrapper: ({ children }) => (
          <TestWrapper mocks={mocks}>{children}</TestWrapper>
        ),
      });

      await waitFor(() => {
        expect(result.current.values.currentYearSalaryNotReceived).toBe('500');
      });

      expect(result.current.values.previousYearSalaryNotReceived).toBe('200');
      expect(result.current.values.deductTwelvePercent).toBe(true);
      expect(result.current.values.phoneNumber).toBe('123-456-7890');
    });
  });

  describe('validation', () => {
    it('should require phone number', async () => {
      const { result } = renderHook(() => useAdditionalSalaryRequestForm(), {
        wrapper: TestWrapper,
      });

      let errors: Record<string, string> = {};
      await act(async () => {
        errors = await result.current.validateForm();
      });

      expect(errors.phoneNumber).toBe('Telephone number is required');
    });

    it('should validate phone number format', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            ...defaultFormValues,
            phoneNumber: 'invalid-phone!@#',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      let errors: Record<string, string> = {};
      await act(async () => {
        errors = await result.current.validateForm();
      });

      expect(errors.phoneNumber).toBe('Please enter a valid telephone number');
    });

    it('should accept valid phone number formats', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            ...defaultFormValues,
            phoneNumber: '555-123-4567',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      let errors: Record<string, string> = {};
      await act(async () => {
        errors = await result.current.validateForm();
      });

      expect(errors.phoneNumber).toBeUndefined();
    });

    it('should validate adoption max amount of $15,000', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            ...defaultFormValues,
            adoption: '20000',
            phoneNumber: '555-123-4567',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      let errors: Record<string, string> = {};
      await act(async () => {
        errors = await result.current.validateForm();
      });

      expect(errors.adoption).toContain('Exceeds');
      expect(errors.adoption).toContain('$15,000.00');
    });

    it('should validate housing down payment max amount of $50,000', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            ...defaultFormValues,
            housingDownPayment: '60000',
            phoneNumber: '555-123-4567',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      let errors: Record<string, string> = {};
      await act(async () => {
        errors = await result.current.validateForm();
      });

      expect(errors.housingDownPayment).toContain('Exceeds');
      expect(errors.housingDownPayment).toContain('$50,000.00');
    });

    it('should validate auto purchase max amount of $25,000', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            ...defaultFormValues,
            autoPurchase: '30000',
            phoneNumber: '555-123-4567',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      let errors: Record<string, string> = {};
      await act(async () => {
        errors = await result.current.validateForm();
      });

      expect(errors.autoPurchase).toContain('Exceeds');
      expect(errors.autoPurchase).toContain('$25,000.00');
    });

    it('should validate college max amount of $21,000', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            ...defaultFormValues,
            childrenCollegeEducation: '25000',
            phoneNumber: '555-123-4567',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      let errors: Record<string, string> = {};
      await act(async () => {
        errors = await result.current.validateForm();
      });

      expect(errors.childrenCollegeEducation).toContain('Exceeds');
      expect(errors.childrenCollegeEducation).toContain('$21,000.00');
    });

    it('should validate additional info when exceedsCap is true', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            ...defaultFormValues,
            phoneNumber: '555-123-4567',
            additionalSalaryWithinMax: '10000',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      let errors: Record<string, string> = {};
      await act(async () => {
        errors = await result.current.validateForm();
      });

      expect(errors.additionalInfo).toBe(
        'Additional info is required for requests exceeding your cap.',
      );
    });
  });

  describe('onSubmit', () => {
    it('should not submit when requestId is empty', async () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...defaultMockContextValue,
        requestId: '',
      });
      const { result } = renderHook(() => useAdditionalSalaryRequestForm(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.setFieldValue('phoneNumber', '555-123-4567');
        await result.current.submitForm();
      });

      expect(mutationSpy).not.toHaveGraphqlOperation(
        'UpdateAdditionalSalaryRequest',
      );
    });

    it('should call update and submit mutations on form submit', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            ...defaultFormValues,
            phoneNumber: '555-123-4567',
            emailAddress: 'test@example.com',
            currentYearSalaryNotReceived: '100',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      await waitFor(async () => {
        const errors = await result.current.validateForm();
        expect(errors).toEqual({});
      });

      await act(async () => {
        await result.current.submitForm();
      });

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation(
          'UpdateAdditionalSalaryRequest',
          {
            id: 'test-request-id',
          },
        );
      });
    });

    it('should calculate total correctly when submitting', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            ...defaultFormValues,
            currentYearSalaryNotReceived: '100',
            previousYearSalaryNotReceived: '200',
            adoption: '300',
            phoneNumber: '555-123-4567',
            emailAddress: 'test@example.com',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      await waitFor(async () => {
        const errors = await result.current.validateForm();
        expect(errors).toEqual({});
      });

      await act(async () => {
        await result.current.submitForm();
      });

      await waitFor(() => {
        expect(mutationSpy).toHaveBeenCalled();
      });

      // Verify the mutation was called with the correct total (100 + 200 + 300 = 600)
      const updateCall = mutationSpy.mock.calls.find(
        (call: { operation: { operationName: string } }[]) =>
          call[0]?.operation?.operationName === 'UpdateAdditionalSalaryRequest',
      );
      expect(updateCall).toBeDefined();
      expect(
        updateCall[0].operation.variables.attributes
          .totalAdditionalSalaryRequested,
      ).toBe(600);
    });

    it('should call handleNextStep after successful submit', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            ...defaultFormValues,
            phoneNumber: '555-123-4567',
            emailAddress: 'test@example.com',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      await waitFor(async () => {
        const errors = await result.current.validateForm();
        expect(errors).toEqual({});
      });

      await act(async () => {
        await result.current.submitForm();
      });

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation(
          'SubmitAdditionalSalaryRequest',
        );
      });

      await waitFor(() => {
        expect(mockHandleNextStep).toHaveBeenCalled();
      });
    });
  });

  describe('formik integration', () => {
    it('should return formik methods', () => {
      const { result } = renderHook(() => useAdditionalSalaryRequestForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.handleChange).toBeDefined();
      expect(result.current.handleBlur).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.setFieldValue).toBeDefined();
      expect(result.current.values).toBeDefined();
      expect(result.current.errors).toBeDefined();
      expect(result.current.touched).toBeDefined();
    });

    it('should return validationSchema', () => {
      const { result } = renderHook(() => useAdditionalSalaryRequestForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.validationSchema).toBeDefined();
    });

    it('should handle field value changes', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            ...defaultFormValues,
            currentYearSalaryNotReceived: '100',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      expect(result.current.values.currentYearSalaryNotReceived).toBe('100');
    });

    it('should enable reinitialize', async () => {
      const mocks = {
        AdditionalSalaryRequest: {
          latestAdditionalSalaryRequest: {
            id: 'test-request-id',
            currentYearSalaryNotReceived: 999,
            previousYearSalaryNotReceived: 0,
            additionalSalaryWithinMax: 0,
            adoption: 0,
            traditional403bContribution: 0,
            counselingNonMedical: 0,
            healthcareExpensesExceedingLimit: 0,
            babysittingMinistryEvents: 0,
            childrenMinistryTripExpenses: 0,
            childrenCollegeEducation: 0,
            movingExpense: 0,
            seminary: 0,
            housingDownPayment: 0,
            autoPurchase: 0,
            expensesNotApprovedWithin90Days: 0,
            deductTwelvePercent: false,
            phoneNumber: '',
            emailAddress: '',
            calculations: {
              currentSalaryCap: 50000,
              staffAccountBalance: 20000,
              predictedYearIncome: 40000,
              pendingAsrAmount: 0,
              maxAmountAndReason: {
                amount: 10000,
                reason: 'Test reason',
              },
            },
          },
        },
      };

      const { result } = renderHook(() => useAdditionalSalaryRequestForm(), {
        wrapper: ({ children }) => (
          <TestWrapper mocks={mocks}>{children}</TestWrapper>
        ),
      });

      await waitFor(() => {
        expect(result.current.values.currentYearSalaryNotReceived).toBe('999');
      });
    });
  });
});
