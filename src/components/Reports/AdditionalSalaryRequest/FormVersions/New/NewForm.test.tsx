import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { FormikProvider, useFormik } from 'formik';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import * as yup from 'yup';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import { amount } from 'src/lib/yupHelpers';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequestSectionEnum } from '../../AdditionalSalaryRequestHelper';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { fieldConfig } from '../../Shared/useAdditionalSalaryRequestForm';
import { NewForm } from './NewForm';

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

const mockUser = {
  id: '1',
  staffInfo: {
    id: 'staff-1',
    firstName: 'John',
    lastName: 'Doe',
    preferredName: 'Doe, John',
    personNumber: '00123456',
    emailAddress: 'john.doe@example.com',
  },
};

const mockSpouse = {
  id: '2',
  staffInfo: {
    id: 'staff-2',
    firstName: 'Jane',
    lastName: 'Doe',
    preferredName: 'Doe, Jane',
    personNumber: '00123457',
    emailAddress: 'jane.doe@example.com',
  },
};

const defaultMockContextValue = {
  staffAccountId: 'staff-account-1',
  steps: [],
  currentIndex: 1,
  currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
  handleNextStep: jest.fn(),
  handlePreviousStep: jest.fn(),
  isDrawerOpen: true,
  toggleDrawer: jest.fn(),
  requestsData: null,
  requestData: {
    additionalSalaryRequest: {
      id: 'test-request-id',
      calculations: {
        currentSalaryCap: 50000,
        staffAccountBalance: 20000,
      },
    },
  },
  requestsError: undefined,
  pageType: undefined,
  handleDeleteRequest: jest.fn(),
  requestId: 'test-request-id',
  user: mockUser,
  spouse: mockSpouse,
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
  initialValues?: CompleteFormValues;
}

const TestFormikWrapper: React.FC<TestFormikWrapperProps> = ({
  children,
  initialValues,
}) => {
  const formik = useFormik<CompleteFormValues>({
    initialValues: initialValues || defaultCompleteFormValues,
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

const TestWrapper: React.FC<TestWrapperProps> = ({
  initialValues = defaultCompleteFormValues,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <I18nextProvider i18n={i18n}>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <TestFormikWrapper initialValues={initialValues}>
              <NewForm />
            </TestFormikWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </I18nextProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('CompleteForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdditionalSalaryRequest.mockReturnValue(
      defaultMockContextValue as unknown as ReturnType<
        typeof useAdditionalSalaryRequest
      >,
    );
  });

  describe('rendering', () => {
    it('renders the section title', () => {
      const { getByText } = render(<TestWrapper />);

      expect(getByText('Complete the Form')).toBeInTheDocument();
    });

    it('renders user name and account number', () => {
      const { getByText } = render(<TestWrapper />);

      expect(getByText('Doe, John')).toBeInTheDocument();
      expect(getByText('00123456')).toBeInTheDocument();
    });

    it('renders instructional text and notes', () => {
      const { getByText, getAllByText } = render(<TestWrapper />);

      expect(
        getByText(/Please enter the desired dollar amounts/i),
      ).toBeInTheDocument();
      // There are multiple "Note:" elements in the form
      expect(getAllByText('Note:').length).toBeGreaterThanOrEqual(1);
      expect(
        getByText(/If the above information is correct/i),
      ).toBeInTheDocument();
    });
  });

  describe('financial calculations', () => {
    it('displays correct account balances from request data', () => {
      const { getByTestId } = render(<TestWrapper />);

      // staffAccountBalance is 20000
      expect(getByTestId('amount-one')).toHaveTextContent('$20,000.00');
      // currentSalaryCap (50000) - staffAccountBalance (20000) = 30000
      expect(getByTestId('amount-two')).toHaveTextContent('$30,000.00');
    });

    it('handles missing calculations data gracefully', () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...defaultMockContextValue,
        requestData: {
          additionalSalaryRequest: {
            id: 'test-id',
            calculations: undefined,
          },
        },
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

      const { getByTestId } = render(<TestWrapper />);

      expect(getByTestId('amount-one')).toHaveTextContent('$0.00');
      expect(getByTestId('amount-two')).toHaveTextContent('$0.00');
    });
  });

  describe('user information', () => {
    it('handles missing user name gracefully', () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...defaultMockContextValue,
        user: {
          id: '1',
          staffInfo: {
            id: 'staff-1',
            firstName: '',
            lastName: '',
            preferredName: '',
            personNumber: '00123456',
            emailAddress: 'test@example.com',
          },
        },
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

      const { queryByText } = render(<TestWrapper />);

      expect(queryByText('Doe, John')).not.toBeInTheDocument();
    });

    it('handles undefined user gracefully', () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...defaultMockContextValue,
        user: undefined,
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

      const { container } = render(<TestWrapper />);

      expect(container).toBeInTheDocument();
    });
  });

  describe('child components', () => {
    it('renders all form sections', () => {
      const { getByText, getAllByText } = render(<TestWrapper />);

      expect(
        getByText('Additional Salary Request', {
          selector: '.MuiCardHeader-title',
        }),
      ).toBeInTheDocument();
      expect(
        getByText('403(b) Deduction', { selector: '.MuiCardHeader-title' }),
      ).toBeInTheDocument();
      expect(
        getAllByText('Net Additional Salary').length,
      ).toBeGreaterThanOrEqual(1);
    });

    it('renders ContactInformation with email and phone fields', () => {
      const { getByText } = render(<TestWrapper />);

      expect(getByText('Email Address')).toBeInTheDocument();
      expect(getByText('Telephone Number')).toBeInTheDocument();
      expect(getByText('john.doe@example.com')).toBeInTheDocument();
    });
  });

  describe('validation alert', () => {
    it('does not show alert initially', () => {
      const { queryByRole } = render(<TestWrapper />);

      expect(queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('different steps', () => {
    it('displays correct header for AboutForm step', () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...defaultMockContextValue,
        currentIndex: 0,
        currentStep: AdditionalSalaryRequestSectionEnum.AboutForm,
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

      const { getByText } = render(<TestWrapper />);

      expect(getByText('About this Form')).toBeInTheDocument();
    });

    it('displays correct header for Receipt step', () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...defaultMockContextValue,
        currentIndex: 2,
        currentStep: AdditionalSalaryRequestSectionEnum.Receipt,
      } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

      const { getByText } = render(<TestWrapper />);

      expect(getByText('Receipt')).toBeInTheDocument();
    });
  });
});
