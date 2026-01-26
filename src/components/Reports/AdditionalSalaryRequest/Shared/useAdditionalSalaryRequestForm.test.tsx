import { ThemeProvider } from '@mui/material/styles';
import { act, renderHook, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import {
  AdditionalSalaryRequestQuery,
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
  steps: [],
  currentIndex: 1,
  currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
  handleNextStep: mockHandleNextStep,
  handlePreviousStep: jest.fn(),
  isDrawerOpen: true,
  toggleDrawer: jest.fn(),
  requestsData: null,
  requestData: null,
  requestsError: undefined,
  pageType: PageEnum.New,
  handleDeleteRequest: jest.fn(),
  requestId: 'test-request-id',
  user: undefined,
  spouse: undefined,
  isMutating: false,
  trackMutation: jest.fn((mutation) => mutation),
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
};

const mutationSpy = jest.fn();

type MocksType = {
  AdditionalSalaryRequest: AdditionalSalaryRequestQuery;
  UpdateAdditionalSalaryRequest: UpdateAdditionalSalaryRequestMutation;
  SubmitAdditionalSalaryRequest: SubmitAdditionalSalaryRequestMutation;
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
        UpdateAdditionalSalaryRequest: UpdateAdditionalSalaryRequestMutation;
        SubmitAdditionalSalaryRequest: SubmitAdditionalSalaryRequestMutation;
      }>
        mocks={mocks}
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

    it('should have max values for adoption and housing down payment', () => {
      const adoptionConfig = fieldConfig.find((f) => f.key === 'adoption');
      const housingConfig = fieldConfig.find(
        (f) => f.key === 'housingDownPayment',
      );

      expect(adoptionConfig?.max).toBe(15000);
      expect(housingConfig?.max).toBe(50000);
    });
  });

  describe('initialValues', () => {
    it('should return default initial values when no request data exists', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            requestId: 'test-request-id',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      expect(result.current.values).toEqual(defaultFormValues);
    });

    it('should use provided initial values when passed', async () => {
      const providedValues: CompleteFormValues = {
        ...defaultFormValues,
        currentYearSalaryNotReceived: '1000',
        phoneNumber: '555-1234',
      };

      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            requestId: 'test-request-id',
            initialValues: providedValues,
          }),
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
          additionalSalaryRequest: {
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

      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            requestId: 'test-request-id',
          }),
        {
          wrapper: ({ children }) => (
            <TestWrapper mocks={mocks}>{children}</TestWrapper>
          ),
        },
      );

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
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            requestId: 'test-request-id',
          }),
        {
          wrapper: TestWrapper,
        },
      );

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
            requestId: 'test-request-id',
            initialValues: {
              ...defaultFormValues,
              phoneNumber: 'invalid-phone!@#',
            },
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
            requestId: 'test-request-id',
            initialValues: {
              ...defaultFormValues,
              phoneNumber: '555-123-4567',
            },
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
            requestId: 'test-request-id',
            initialValues: {
              ...defaultFormValues,
              adoption: '20000',
              phoneNumber: '555-123-4567',
            },
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
            requestId: 'test-request-id',
            initialValues: {
              ...defaultFormValues,
              housingDownPayment: '60000',
              phoneNumber: '555-123-4567',
            },
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
  });

  describe('onSubmit', () => {
    it('should not submit when requestId is empty', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            requestId: '',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      await act(async () => {
        result.current.setFieldValue('phoneNumber', '555-123-4567');
        await result.current.submitForm();
      });

      expect(mutationSpy).not.toHaveBeenCalled();
    });

    it('should call update and submit mutations on form submit', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            requestId: 'test-request-id',
            initialValues: {
              ...defaultFormValues,
              phoneNumber: '555-123-4567',
              currentYearSalaryNotReceived: '100',
            },
          }),
        {
          wrapper: TestWrapper,
        },
      );

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
            requestId: 'test-request-id',
            initialValues: {
              ...defaultFormValues,
              currentYearSalaryNotReceived: '100',
              previousYearSalaryNotReceived: '200',
              adoption: '300',
              phoneNumber: '555-123-4567',
            },
          }),
        {
          wrapper: TestWrapper,
        },
      );

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
            requestId: 'test-request-id',
            initialValues: {
              ...defaultFormValues,
              phoneNumber: '555-123-4567',
            },
          }),
        {
          wrapper: TestWrapper,
        },
      );

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
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            requestId: 'test-request-id',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      expect(result.current.handleChange).toBeDefined();
      expect(result.current.handleBlur).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.setFieldValue).toBeDefined();
      expect(result.current.values).toBeDefined();
      expect(result.current.errors).toBeDefined();
      expect(result.current.touched).toBeDefined();
    });

    it('should return validationSchema', () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            requestId: 'test-request-id',
          }),
        {
          wrapper: TestWrapper,
        },
      );

      expect(result.current.validationSchema).toBeDefined();
    });

    it('should handle field value changes', async () => {
      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            requestId: 'test-request-id',
            initialValues: {
              ...defaultFormValues,
              currentYearSalaryNotReceived: '100',
            },
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
          additionalSalaryRequest: {
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

      const { result } = renderHook(
        () =>
          useAdditionalSalaryRequestForm({
            requestId: 'test-request-id',
          }),
        {
          wrapper: ({ children }) => (
            <TestWrapper mocks={mocks}>{children}</TestWrapper>
          ),
        },
      );

      await waitFor(() => {
        expect(result.current.values.currentYearSalaryNotReceived).toBe('999');
      });
    });
  });
});
