import { ThemeProvider } from '@mui/material/styles';
import { renderHook, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { UpdateAdditionalSalaryRequestMutation } from '../../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../../AdditionalSalaryRequestHelper';
import {
  AdditionalSalaryRequestType,
  useAdditionalSalaryRequest,
} from '../AdditionalSalaryRequestContext';
import { useSaveField } from './useSaveField';

jest.mock('../AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../AdditionalSalaryRequestContext',
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

const mutationSpy = jest.fn();

const defaultFormValues: CompleteFormValues = {
  currentYearSalaryNotReceived: '100',
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
  deductTaxDeferredPercent: false,
  phoneNumber: '555-1234',
  emailAddress: 'test@testerson.test',
  totalAdditionalSalaryRequested: '100',
};

const mockTrackMutation = jest.fn((mutation) => mutation);

const defaultMockContextValue: AdditionalSalaryRequestType = {
  staffAccountId: 'staff-account-1',
  staffAccountIdLoading: false,
  steps: [],
  currentIndex: 1,
  currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
  handleNextStep: jest.fn(),
  handlePreviousStep: jest.fn(),
  isDrawerOpen: true,
  toggleDrawer: jest.fn(),
  requestData: {
    latestAdditionalSalaryRequest: {
      id: 'request-id',
      calculations: {
        currentSalaryCap: 50000,
        staffAccountBalance: 20000,
      },
    },
  } as AdditionalSalaryRequestType['requestData'],
  loading: false,
  requestError: undefined,
  pageType: PageEnum.New,
  handleDeleteRequest: jest.fn(),
  requestId: 'request-id',
  user: undefined,
  spouse: undefined,
  salaryInfo: undefined,
  isInternational: false,
  isMutating: false,
  trackMutation: mockTrackMutation,
};

interface TestComponentProps {
  children: React.ReactElement;
}

const TestComponent: React.FC<TestComponentProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        UpdateAdditionalSalaryRequest: UpdateAdditionalSalaryRequestMutation;
      }>
        onCall={mutationSpy}
      >
        {children}
      </GqlMockedProvider>
    </ThemeProvider>
  );
};

describe('useSaveField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdditionalSalaryRequest.mockReturnValue(defaultMockContextValue);
  });

  it('should update additional salary request with new attributes and calculated total', async () => {
    const { result } = renderHook(
      () =>
        useSaveField({
          formValues: defaultFormValues,
        }),
      {
        wrapper: TestComponent,
      },
    );

    result.current({ currentYearSalaryNotReceived: '200' });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateAdditionalSalaryRequest',
        {
          id: 'request-id',
          attributes: {
            currentYearSalaryNotReceived: '200',
            totalAdditionalSalaryRequested: 200,
          },
        },
      ),
    );
  });

  it('should not call mutation when requestId is missing', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      requestData: null,
    });

    const { result } = renderHook(
      () =>
        useSaveField({
          formValues: defaultFormValues,
        }),
      {
        wrapper: TestComponent,
      },
    );

    await result.current({ currentYearSalaryNotReceived: '200' });

    expect(mutationSpy).not.toHaveBeenCalled();
  });

  it('should track mutation through context trackMutation', async () => {
    const { result } = renderHook(
      () =>
        useSaveField({
          formValues: defaultFormValues,
        }),
      {
        wrapper: TestComponent,
      },
    );

    result.current({ adoption: '500' });

    await waitFor(() => expect(mockTrackMutation).toHaveBeenCalled());
  });

  it('should calculate total correctly with multiple field updates', async () => {
    const formValuesWithMultipleAmounts: CompleteFormValues = {
      ...defaultFormValues,
      currentYearSalaryNotReceived: '100',
      adoption: '200',
      seminary: '300',
    };

    const { result } = renderHook(
      () =>
        useSaveField({
          formValues: formValuesWithMultipleAmounts,
        }),
      {
        wrapper: TestComponent,
      },
    );

    // Update one field - total should include existing values plus new value
    result.current({ movingExpense: '400' });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateAdditionalSalaryRequest',
        {
          id: 'request-id',
          attributes: {
            movingExpense: '400',
            // Total: 100 + 200 + 300 + 400 = 1000
            totalAdditionalSalaryRequested: 1000,
          },
        },
      ),
    );
  });
});
