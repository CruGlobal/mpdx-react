import { ThemeProvider } from '@mui/material/styles';
import { renderHook, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/HrTools/Shared/CalculationReports/Shared/sharedTypes';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
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
    const { result } = renderHook(() => useSaveField(), {
      wrapper: TestComponent,
    });

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

  it('should not call mutation when requestId is missing', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      requestData: null,
    });

    const { result } = renderHook(() => useSaveField(), {
      wrapper: TestComponent,
    });

    await result.current({ currentYearSalaryNotReceived: 200 });

    expect(mutationSpy).not.toHaveBeenCalled();
  });

  it('should track mutation through context trackMutation', async () => {
    const { result } = renderHook(() => useSaveField(), {
      wrapper: TestComponent,
    });

    result.current({ adoption: 500 });

    await waitFor(() => expect(mockTrackMutation).toHaveBeenCalled());
  });
});
