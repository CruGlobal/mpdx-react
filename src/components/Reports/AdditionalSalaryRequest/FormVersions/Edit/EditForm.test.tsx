import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { FormikProvider, useFormik } from 'formik';
import { I18nextProvider } from 'react-i18next';
import * as yup from 'yup';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import { amount } from 'src/lib/yupHelpers';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { fieldConfig } from '../../Shared/useAdditionalSalaryRequestForm';
import { EditForm } from './EditForm';

jest.mock('../../Shared/AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../../Shared/AdditionalSalaryRequestContext',
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
  staffInfo: {
    preferredName: 'Doe, John',
    personNumber: '00123456',
    emailAddress: 'john.doe@example.com',
  },
};

const defaultMockContextValue = {
  requestData: {
    additionalSalaryRequest: {
      phoneNumber: '555-123-4567',
      traditional403bContribution: 0.12,
      calculations: {
        currentSalaryCap: 100000,
        staffAccountBalance: 40000,
        maxAmountAndReason: { amount: 100000 },
        predictedYearIncome: 50000,
        pendingAsrAmount: 5000,
      },
    },
  },
  user: mockUser,
};

const router = {
  query: { accountListId: 'account-list-1' },
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
  initialValues = defaultCompleteFormValues,
}) => {
  const formik = useFormik<CompleteFormValues>({
    initialValues,
    validationSchema,
    onSubmit: () => {},
    enableReinitialize: true,
  });

  const formikWithSchema = { ...formik, validationSchema };

  return <FormikProvider value={formikWithSchema}>{children}</FormikProvider>;
};

interface RenderComponentProps {
  initialValues?: CompleteFormValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextOverrides?: Record<string, any>;
}

const renderComponent = ({
  initialValues,
  contextOverrides = {},
}: RenderComponentProps = {}) => {
  mockUseAdditionalSalaryRequest.mockReturnValue({
    ...defaultMockContextValue,
    ...contextOverrides,
  } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

  return render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <TestFormikWrapper initialValues={initialValues}>
              <EditForm />
            </TestFormikWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </I18nextProvider>
    </ThemeProvider>,
  );
};

describe('EditForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page with user info and navigation', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText('Edit Your Request')).toBeInTheDocument();
    expect(getByText('Doe, John')).toBeInTheDocument();
    expect(getByText('00123456')).toBeInTheDocument();

    const backButton = getByRole('link', { name: /back to status/i });
    expect(backButton).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/additionalSalaryRequest',
    );
  });

  it('displays financial balances from context', () => {
    const { getByTestId } = renderComponent();

    // staffAccountBalance: 40000
    expect(getByTestId('amount-one')).toHaveTextContent('$40,000.00');
    // currentSalaryCap (100000) - staffAccountBalance (40000) = 60000
    expect(getByTestId('amount-two')).toHaveTextContent('$60,000.00');
  });

  it('handles missing calculations gracefully', () => {
    const { getByTestId } = renderComponent({
      contextOverrides: {
        requestData: {
          additionalSalaryRequest: {
            calculations: undefined,
          },
        },
      },
    });

    expect(getByTestId('amount-one')).toHaveTextContent('$0.00');
    expect(getByTestId('amount-two')).toHaveTextContent('$0.00');
  });

  it('renders all child components', () => {
    const { getByText, getAllByText } = renderComponent();

    expect(
      getByText('Additional Salary Request', {
        selector: '.MuiCardHeader-title',
      }),
    ).toBeInTheDocument();
    expect(
      getByText('403(b) Deduction', { selector: '.MuiCardHeader-title' }),
    ).toBeInTheDocument();
    expect(getAllByText('Net Additional Salary').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(getByText('Telephone Number')).toBeInTheDocument();
    expect(getByText('Email Address')).toBeInTheDocument();
    expect(getByText('Total Annual Salary')).toBeInTheDocument();
  });

  it('handles missing user gracefully', () => {
    const { container } = renderComponent({
      contextOverrides: {
        user: undefined,
      },
    });

    expect(container).toBeInTheDocument();
  });
});
