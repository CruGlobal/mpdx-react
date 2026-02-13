import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormikProvider, useFormik } from 'formik';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import * as yup from 'yup';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import { amount, phoneNumber } from 'src/lib/yupHelpers';
import theme from 'src/theme';
import { PageEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from '../Shared/CompleteForm.mock';
import { fieldConfig } from '../Shared/useAdditionalSalaryRequestForm';
import { RequestPage } from './RequestPage';

jest.mock('../Shared/AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../Shared/AdditionalSalaryRequestContext',
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

const mockPush = jest.fn();
const mockHandleDeleteRequest = jest.fn().mockResolvedValue(undefined);

const mockSteps = [
  {
    title: 'About this Form',
    completed: false,
    active: true,
    activeForm: 'About this Form',
  },
  {
    title: 'Complete the Form',
    completed: false,
    active: false,
    activeForm: 'Complete the Form',
  },
  {
    title: 'Receipt',
    completed: false,
    active: false,
    activeForm: 'Receipt',
  },
];

const defaultMockContextValue = {
  staffAccountId: 'staff-account-1',
  staffAccountIdLoading: false,
  steps: mockSteps,
  currentIndex: 0,
  currentStep: AdditionalSalaryRequestSectionEnum.AboutForm,
  handleNextStep: jest.fn(),
  handlePreviousStep: jest.fn(),
  goToStep: jest.fn(),
  isDrawerOpen: true,
  toggleDrawer: jest.fn(),
  requestData: null,
  requestError: undefined,
  pageType: PageEnum.New,
  setPageType: jest.fn(),
  handleDeleteRequest: mockHandleDeleteRequest,
  requestId: 'test-request-id',
  user: {
    id: '1',
    staffInfo: {
      id: 'staff-1',
      firstName: 'John',
      lastName: 'Doe',
      preferredName: 'Doe, John',
      personNumber: '00123456',
      emailAddress: 'john.doe@example.com',
    },
  },
  spouse: undefined,
  salaryInfo: undefined,
  isInternational: false,
  isMutating: false,
  trackMutation: jest.fn((promise) => promise),
  traditional403bPercentage: 0,
  roth403bPercentage: 0,
  isNewAsr: false,
  setIsNewAsr: jest.fn(),
};

const router = {
  query: { accountListId: 'account-list-1' },
  isReady: true,
  push: mockPush,
};

const validationSchema = yup.object({
  ...Object.fromEntries(
    fieldConfig.map(({ key, label }) => [
      key,
      amount(label, (key: string) => key),
    ]),
  ),
  deductTaxDeferredPercent: yup.boolean(),
  phoneNumber: phoneNumber(i18n.t).required(
    i18n.t('Phone Number is required.'),
  ),
  emailAddress: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  totalAdditionalSalaryRequested: yup.number(),
  additionalInfo: yup.string(),
});

interface TestFormikWrapperProps {
  children: React.ReactNode;
  initialValues?: CompleteFormValues;
}

const TestFormikWrapper: React.FC<TestFormikWrapperProps> = ({
  children,
  initialValues = defaultCompleteFormValues,
}) => {
  const formik = useFormik<CompleteFormValues>({
    initialValues,
    validationSchema,
    onSubmit: jest.fn(),
    enableReinitialize: true,
  });

  const formikWithSchema = { ...formik, validationSchema };

  return <FormikProvider value={formikWithSchema}>{children}</FormikProvider>;
};

interface TestWrapperProps {
  initialValues?: CompleteFormValues;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ initialValues }) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <I18nextProvider i18n={i18n}>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <TestFormikWrapper initialValues={initialValues}>
              <RequestPage />
            </TestFormikWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </I18nextProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('RequestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdditionalSalaryRequest.mockReturnValue(
      defaultMockContextValue as unknown as ReturnType<
        typeof useAdditionalSalaryRequest
      >,
    );
  });

  it('should load on complete form step', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { findByRole } = render(<TestWrapper />);

    expect(
      await findByRole('heading', { name: 'Complete the Form' }),
    ).toBeInTheDocument();
  });

  it('renders the sidebar with title and steps', () => {
    const { getByRole, getAllByText } = render(<TestWrapper />);

    expect(
      getByRole('heading', { name: 'Additional Salary Request', level: 6 }),
    ).toBeInTheDocument();
    expect(getAllByText('About this Form').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Complete the Form').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Receipt').length).toBeGreaterThanOrEqual(1);
  });

  it('shows continue button and hides back button on first form page', () => {
    const { getByRole, queryByRole } = render(<TestWrapper />);

    expect(getByRole('button', { name: /continue/i })).toBeInTheDocument();
    expect(queryByRole('button', { name: /^back$/i })).not.toBeInTheDocument();
  });

  it('shows back button on second form page', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByRole } = render(<TestWrapper />);

    expect(getByRole('button', { name: /^back$/i })).toBeInTheDocument();
  });

  it('hides direction buttons on review page', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 2,
      currentStep: AdditionalSalaryRequestSectionEnum.Receipt,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { queryByRole } = render(<TestWrapper />);

    expect(
      queryByRole('button', { name: /continue/i }),
    ).not.toBeInTheDocument();
    expect(queryByRole('button', { name: /^back$/i })).not.toBeInTheDocument();
  });

  it('shows submit button on last form page in New mode', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
      pageType: PageEnum.New,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByRole } = render(<TestWrapper />);
    expect(getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('shows Summary component in View mode instead of form', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
      pageType: PageEnum.View,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByRole, queryByRole } = render(<TestWrapper />);

    // View mode shows Summary with "Back to Status" button, not direction buttons
    expect(
      getByRole('button', { name: /back to status/i }),
    ).toBeInTheDocument();
    expect(queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
    expect(
      queryByRole('button', { name: /continue/i }),
    ).not.toBeInTheDocument();
  });

  it('calls handleDeleteRequest when discard is clicked', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByRole } = render(<TestWrapper />);

    const discardButton = getByRole('button', { name: /discard/i });
    userEvent.click(discardButton);

    const confirmButton = getByRole('button', { name: /yes, discard/i });
    userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockHandleDeleteRequest).toHaveBeenCalledWith(
        'test-request-id',
        false,
      );
    });
  });

  it('shows back button and calls setPageType when status is pending', () => {
    const mockSetPageType = jest.fn();
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
      pageType: PageEnum.Edit,
      setPageType: mockSetPageType,
      requestData: {
        latestAdditionalSalaryRequest: {
          status: 'PENDING',
          calculations: {
            currentSalaryCap: 50000,
            staffAccountBalance: 0,
          },
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByRole } = render(<TestWrapper />);

    const backButton = getByRole('button', { name: /back to dashboard/i });
    userEvent.click(backButton);

    expect(mockSetPageType).toHaveBeenCalledWith(PageEnum.Reset);
  });

  it('shows submit modal when submit clicked on new page', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
      pageType: PageEnum.New,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const validFormValues: CompleteFormValues = {
      ...defaultCompleteFormValues,
      phoneNumber: '123-456-7890',
      emailAddress: 'test@example.com',
    };

    const { getByRole, getByText } = render(
      <TestWrapper initialValues={validFormValues} />,
    );

    const submitButton = getByRole('button', { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        getByText('Are you ready to submit your Additional Salary Request?'),
      ).toBeInTheDocument();
    });

    expect(
      getByText('You are submitting your Additional Salary Request.'),
    ).toBeInTheDocument();
    expect(
      getByText('Your request will be sent to payroll.'),
    ).toBeInTheDocument();
  });

  it('shows submit modal when submit clicked on edit page', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
      pageType: PageEnum.Edit,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const validFormValues: CompleteFormValues = {
      ...defaultCompleteFormValues,
      phoneNumber: '123-456-7890',
      emailAddress: 'test@example.com',
    };

    const { getByRole, getByText } = render(
      <TestWrapper initialValues={validFormValues} />,
    );

    const submitButton = getByRole('button', { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        getByText(
          'Are you ready to submit your updated Additional Salary Request?',
        ),
      ).toBeInTheDocument();
    });

    expect(
      getByText(
        'You are submitting changes to your Additional Salary Request.',
      ),
    ).toBeInTheDocument();
    expect(
      getByText('Your updated request will be sent to payroll.'),
    ).toBeInTheDocument();
  });

  it('shows submit modal when submit clicked with single user exceeding cap', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
      pageType: PageEnum.New,
      requestData: {
        latestAdditionalSalaryRequest: {
          calculations: {
            currentSalaryCap: 50,
          },
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const validFormValues: CompleteFormValues = {
      ...defaultCompleteFormValues,
      currentYearSalaryNotReceived: '1000',
      phoneNumber: '123-456-7890',
      emailAddress: 'test@example.com',
      additionalInfo: 'Test additional info for exceeds cap',
    };

    const { getByRole, getByText } = render(
      <TestWrapper initialValues={validFormValues} />,
    );

    const submitButton = getByRole('button', { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        getByText(/your request requires additional approval./i),
      ).toBeInTheDocument();
    });

    expect(
      getByText(/your request causes your total requested salary to exceed/i),
    ).toBeInTheDocument();
    expect(
      getByText(/please complete the approval process section/i),
    ).toBeInTheDocument();
  });

  it('shows submit modal when submit clicked with married user exceeding cap and spouse under cap', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
      pageType: PageEnum.New,
      spouse: {
        currentSalary: { grossSalaryAmount: 40000 },
        staffInfo: {
          firstName: 'Jane',
          lastName: 'Doe',
        },
      },
      requestData: {
        latestAdditionalSalaryRequest: {
          calculations: {
            currentSalaryCap: 500,
            combinedCap: 100000,
          },
          spouseCalculations: {
            currentSalaryCap: 500,
            pendingAsrAmount: 100,
          },
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const validFormValues: CompleteFormValues = {
      ...defaultCompleteFormValues,
      currentYearSalaryNotReceived: '1000',
      phoneNumber: '123-456-7890',
      emailAddress: 'test@example.com',
      additionalInfo: 'Test additional info for exceeds cap',
    };

    const { getByRole, getByText, getAllByText } = render(
      <TestWrapper initialValues={validFormValues} />,
    );

    const submitButton = getByRole('button', { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        getByText(
          /your total additional salary request exceeds your remaining allowable salary/i,
        ),
      ).toBeInTheDocument();
    });

    expect(
      getAllByText(/please make adjustments to your request to continue/i),
    ).toHaveLength(2);
    expect(
      getByText(/you may make a separate request up to Jane's/i),
    ).toBeInTheDocument();
  });

  it('shows submit modal when submit clicked with married user exceeding cap and spouse over cap', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
      pageType: PageEnum.New,
      spouse: {
        currentSalary: { grossSalaryAmount: 40000 },
        staffInfo: {
          firstName: 'Jane',
          lastName: 'Doe',
        },
      },
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

    const validFormValues: CompleteFormValues = {
      ...defaultCompleteFormValues,
      currentYearSalaryNotReceived: '1000',
      phoneNumber: '123-456-7890',
      emailAddress: 'test@example.com',
      additionalInfo: 'Test additional info for exceeds cap',
    };

    const { getByRole, getByText } = render(
      <TestWrapper initialValues={validFormValues} />,
    );

    const submitButton = getByRole('button', { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        getByText(/your request requires additional approval./i),
      ).toBeInTheDocument();
    });

    expect(
      getByText(/your request causes your total requested salary to exceed/i),
    ).toBeInTheDocument();
    expect(
      getByText(/please complete the approval process section/i),
    ).toBeInTheDocument();
  });

  it('calls createNewRequest and handleNextStep when Continue is clicked on first page', async () => {
    const mockHandleNextStep = jest.fn();
    const mutationSpy = jest.fn();

    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      handleNextStep: mockHandleNextStep,
      requestData: { latestAdditionalSalaryRequest: null },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <I18nextProvider i18n={i18n}>
            <TestRouter router={router}>
              <GqlMockedProvider
                mocks={{
                  CreateAdditionalSalaryRequest: {
                    createAdditionalSalaryRequest: {
                      additionalSalaryRequest: { id: 'new-request-id' },
                    },
                  },
                }}
                onCall={mutationSpy}
              >
                <TestFormikWrapper>
                  <RequestPage />
                </TestFormikWrapper>
              </GqlMockedProvider>
            </TestRouter>
          </I18nextProvider>
        </SnackbarProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'CreateAdditionalSalaryRequest',
      );
      expect(mockHandleNextStep).toHaveBeenCalled();
    });
  });

  it('does calls handleNextStep when createNewRequest fails', async () => {
    const mockHandleNextStep = jest.fn();

    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      handleNextStep: mockHandleNextStep,
      requestData: { latestAdditionalSalaryRequest: null },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <I18nextProvider i18n={i18n}>
            <TestRouter router={router}>
              <GqlMockedProvider
                mocks={{
                  CreateAdditionalSalaryRequest: {
                    createAdditionalSalaryRequest: null,
                  },
                }}
              >
                <TestFormikWrapper>
                  <RequestPage />
                </TestFormikWrapper>
              </GqlMockedProvider>
            </TestRouter>
          </I18nextProvider>
        </SnackbarProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(mockHandleNextStep).toHaveBeenCalled();
    });
  });

  it('does not use overrideNext on non-first pages', async () => {
    const mutationSpy = jest.fn();

    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
      pageType: PageEnum.Edit,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <I18nextProvider i18n={i18n}>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
                <TestFormikWrapper>
                  <RequestPage />
                </TestFormikWrapper>
              </GqlMockedProvider>
            </TestRouter>
          </I18nextProvider>
        </SnackbarProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mutationSpy).not.toHaveGraphqlOperation(
        'CreateAdditionalSalaryRequest',
      );
    });
  });

  it('hides back href on About this Form step in New mode', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 0,
      currentStep: AdditionalSalaryRequestSectionEnum.AboutForm,
      pageType: PageEnum.New,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { queryByRole } = render(<TestWrapper />);

    const backLink = queryByRole('link', { name: /back to dashboard/i });
    expect(backLink).not.toBeInTheDocument();
  });
});
