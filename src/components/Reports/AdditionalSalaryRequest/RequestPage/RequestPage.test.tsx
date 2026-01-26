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
import { amount } from 'src/lib/yupHelpers';
import theme from 'src/theme';
import { PageEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { defaultCompleteFormValues } from '../CompleteForm/CompleteForm.mock';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
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

const mockHandleDeleteRequest = jest.fn();

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
  steps: mockSteps,
  currentIndex: 0,
  currentStep: AdditionalSalaryRequestSectionEnum.AboutForm,
  handleNextStep: jest.fn(),
  handlePreviousStep: jest.fn(),
  isDrawerOpen: true,
  toggleDrawer: jest.fn(),
  requestsData: null,
  requestData: null,
  requestsError: undefined,
  pageType: PageEnum.New,
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
  isMutating: false,
  trackMutation: jest.fn(),
};

const router = {
  query: { accountListId: 'account-list-1' },
  isReady: true,
};

const validationSchema = yup.object({
  ...Object.fromEntries(
    fieldConfig.map(({ key, label }) => [
      key,
      amount(label, (key: string) => key),
    ]),
  ),
  deductTwelvePercent: yup.boolean(),
  phoneNumber: yup
    .string()
    .required('Telephone number is required')
    .matches(/^[\d\s\-\(\)\+]+$/, 'Please enter a valid telephone number'),
});

interface TestFormikWrapperProps {
  children: React.ReactNode;
}

const TestFormikWrapper: React.FC<TestFormikWrapperProps> = ({ children }) => {
  const formik = useFormik<CompleteFormValues>({
    initialValues: defaultCompleteFormValues,
    validationSchema,
    onSubmit: jest.fn(),
    enableReinitialize: true,
  });

  const formikWithSchema = { ...formik, validationSchema };

  return <FormikProvider value={formikWithSchema}>{children}</FormikProvider>;
};

const TestWrapper: React.FC = () => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <I18nextProvider i18n={i18n}>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <TestFormikWrapper>
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

  it('renders the sidebar with title and steps', () => {
    const { getByRole, getAllByText } = render(<TestWrapper />);

    expect(
      getByRole('heading', { name: 'Additional Salary Request', level: 6 }),
    ).toBeInTheDocument();
    expect(getAllByText('About this Form').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Complete the Form').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Receipt').length).toBeGreaterThanOrEqual(1);
  });

  it('renders NoStaffAccount when staffAccountId is missing', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      staffAccountId: null,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByText, getByRole } = render(<TestWrapper />);

    expect(getByText('Access to this feature is limited.')).toBeInTheDocument();
    expect(
      getByRole('link', { name: 'Back to Dashboard' }),
    ).toBeInTheDocument();
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

  it('shows submit button on last form page except for View mode', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
      pageType: PageEnum.New,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByRole, rerender } = render(<TestWrapper />);
    expect(getByRole('button', { name: /submit/i })).toBeInTheDocument();

    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...defaultMockContextValue,
      currentIndex: 1,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
      pageType: PageEnum.View,
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    rerender(<TestWrapper />);
    expect(getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('calls handleDeleteRequest when cancel is clicked', async () => {
    const { getByRole } = render(<TestWrapper />);

    const cancelButton = getByRole('button', { name: /cancel/i });
    userEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockHandleDeleteRequest).toHaveBeenCalledWith('test-request-id');
    });
  });

  it('has correct back href to ASR landing page', () => {
    const { getByRole } = render(<TestWrapper />);

    const backLink = getByRole('link', { name: /back to dashboard/i });
    expect(backLink).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/additionalSalaryRequest',
    );
  });
});
