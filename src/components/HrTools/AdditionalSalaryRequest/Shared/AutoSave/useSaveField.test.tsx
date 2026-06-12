import { ThemeProvider } from '@mui/material/styles';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/HrTools/Shared/CalculationReports/Shared/sharedTypes';
import { ElectionType403bEnum } from 'src/graphql/types.generated';
import { createCache } from 'src/lib/apollo/cache';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { UpdateAdditionalSalaryRequestMutation } from '../../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../../AdditionalSalaryRequestHelper';
import {
  AdditionalSalaryRequestType,
  getFieldConfig,
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

const mockTrackMutation = jest.fn((mutation) => mutation);

const defaultFormValues: CompleteFormValues = {
  currentYearSalaryNotReceived: '0',
  previousYearSalaryNotReceived: '0',
  additionalSalaryWithinMax: '0',
  adoption: '0',
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
  electionType403b: ElectionType403bEnum.None,
  phoneNumber: '',
  emailAddress: '',
  totalAdditionalSalaryRequested: '0',
  additionalInfo: '',
};

const defaultMockContextValue: AdditionalSalaryRequestType = {
  staffAccountId: 'staff-account-1',
  staffAccountIdLoading: false,
  steps: [],
  currentIndex: 1,
  currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
  handleNextStep: jest.fn(),
  handlePreviousStep: jest.fn(),
  goToStep: jest.fn(),
  isDrawerOpen: true,
  toggleDrawer: jest.fn(),
  requestData: {
    latestAdditionalSalaryRequest: {
      __typename: 'AdditionalSalaryRequest',
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
  setPageType: jest.fn(),
  pendingPrint: false,
  setPendingPrint: jest.fn(),
  handleDeleteRequest: jest.fn(),
  requestId: 'request-id',
  user: undefined,
  spouse: undefined,
  salaryInfo: undefined,
  isInternational: false,
  isMutating: false,
  trackMutation: mockTrackMutation,
  traditional403bPercentage: 0,
  roth403bPercentage: 0,
  isNewAsr: false,
  setIsNewAsr: jest.fn(),
  isSpouse: false,
  hasSpouse: false,
  isPending: false,
  isApproved: false,
  fieldConfig: getFieldConfig(i18n.t),
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

  it('should update additional salary request with new attributes', async () => {
    const { result } = renderHook(
      () => useSaveField({ formValues: defaultFormValues }),
      {
        wrapper: TestComponent,
      },
    );

    result.current({ currentYearSalaryNotReceived: 200 });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateAdditionalSalaryRequest',
        {
          id: 'request-id',
          attributes: {
            currentYearSalaryNotReceived: 200,
          },
        },
      ),
    );
  });

  it('should not send a client-calculated total to the server', async () => {
    const { result } = renderHook(
      () => useSaveField({ formValues: defaultFormValues }),
      {
        wrapper: TestComponent,
      },
    );

    result.current({ currentYearSalaryNotReceived: 200 });

    await waitFor(() => expect(mutationSpy).toHaveBeenCalled());

    const updateCall = mutationSpy.mock.calls.find(
      (call: { operation: { operationName: string } }[]) =>
        call[0]?.operation?.operationName === 'UpdateAdditionalSalaryRequest',
    );
    expect(updateCall).toBeDefined();
    // The total is computed server-side now — it must not be in the variables
    expect(updateCall[0].operation.variables.attributes).not.toHaveProperty(
      'totalAdditionalSalaryRequested',
    );
  });

  it('optimistically writes the client-calculated total to the cache before the server responds', async () => {
    const cache = createCache();

    const { result } = renderHook(
      () => useSaveField({ formValues: defaultFormValues }),
      {
        wrapper: ({ children }: { children: React.ReactElement }) => (
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{
              UpdateAdditionalSalaryRequest: UpdateAdditionalSalaryRequestMutation;
            }>
              cache={cache}
              onCall={mutationSpy}
            >
              {children}
            </GqlMockedProvider>
          </ThemeProvider>
        ),
      },
    );

    let optimistic: { totalAdditionalSalaryRequested?: number } | undefined;
    await act(async () => {
      const pending = result.current({ currentYearSalaryNotReceived: 200 });
      optimistic = cache.extract(true)[
        'AdditionalSalaryRequest:request-id'
      ] as {
        totalAdditionalSalaryRequested?: number;
      };
      await pending;
    });

    expect(optimistic?.totalAdditionalSalaryRequested).toBe(200);
  });

  it('should not call mutation when requestId is missing', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      requestData: null,
    });

    const { result } = renderHook(
      () => useSaveField({ formValues: defaultFormValues }),
      {
        wrapper: TestComponent,
      },
    );

    await result.current({ currentYearSalaryNotReceived: 200 });

    expect(mutationSpy).not.toHaveBeenCalled();
  });

  it('should track mutation through context trackMutation', async () => {
    const { result } = renderHook(
      () => useSaveField({ formValues: defaultFormValues }),
      {
        wrapper: TestComponent,
      },
    );

    result.current({ adoption: 500 });

    await waitFor(() => expect(mockTrackMutation).toHaveBeenCalled());
  });
});
