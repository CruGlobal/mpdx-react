import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { FormikProvider, useFormik } from 'formik';
import { I18nextProvider } from 'react-i18next';
import * as yup from 'yup';
import i18n from 'src/lib/i18n';
import { amount, phoneNumber } from 'src/lib/yupHelpers';
import theme from 'src/theme';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from '../Shared/CompleteForm.mock';
import { fieldConfig } from '../Shared/useAdditionalSalaryRequestForm';
import { ValidationAlert } from './ValidationAlert';

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

const mockSalaryInfo = {
  maxAdoptionUss: 15000,
  maxAdoptionInt: 15000,
  maxAutoPurchaseUss: 50000,
  maxAutoPurchaseInt: 50000,
  maxCollegeUss: 50000,
  maxCollegeInt: 50000,
  maxHousingDownPaymentUss: 50000,
  maxHousingDownPaymentInt: 50000,
};

const createValidationSchema = () =>
  yup.object({
    ...Object.fromEntries(
      fieldConfig.map(({ key, label, salaryInfoUssKey }) => {
        let schema = amount(label, (k: string) => k);
        const max = salaryInfoUssKey
          ? (mockSalaryInfo[salaryInfoUssKey as keyof typeof mockSalaryInfo] as
              | number
              | undefined)
          : undefined;
        if (max) {
          schema = schema.max(max, `Exceeds limit`);
        }
        return [key, schema];
      }),
    ),
    deductTaxDeferredPercent: yup.boolean(),
    phoneNumber: phoneNumber(i18n.t).required(
      i18n.t('Phone Number is required.'),
    ),
    emailAddress: yup.string(),
    totalAdditionalSalaryRequested: yup
      .number()
      .test(
        'total-within-remaining-allowable-salary',
        'Exceeds account balance.',
        function (value) {
          const remainingAllowableSalary = 17500.0;
          return (value || 0) <= remainingAllowableSalary;
        },
      ),
  });

interface TestWrapperProps {
  children: React.ReactNode;
  initialValues?: CompleteFormValues;
  submitOnMount?: boolean;
}

const TestFormikWrapper: React.FC<TestWrapperProps> = ({
  children,
  initialValues = defaultCompleteFormValues,
  submitOnMount = false,
}) => {
  const formik = useFormik<CompleteFormValues>({
    initialValues,
    validationSchema: createValidationSchema(),
    onSubmit: () => {},
    enableReinitialize: true,
    validateOnMount: submitOnMount,
  });

  useEffect(() => {
    if (submitOnMount) {
      formik.submitForm();
    }
  }, [formik.submitForm]);

  return <FormikProvider value={formik}>{children}</FormikProvider>;
};

interface RenderOptions {
  initialValues?: CompleteFormValues;
  submitOnMount?: boolean;
  salaryInfo?: typeof mockSalaryInfo | null;
  isInternational?: boolean;
}

const renderComponent = ({
  initialValues,
  submitOnMount = false,
  salaryInfo = mockSalaryInfo,
  isInternational = false,
}: RenderOptions = {}) => {
  mockUseAdditionalSalaryRequest.mockReturnValue({
    salaryInfo,
    isInternational,
  } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

  return render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <TestFormikWrapper
          initialValues={initialValues}
          submitOnMount={submitOnMount}
        >
          <ValidationAlert />
        </TestFormikWrapper>
      </I18nextProvider>
    </ThemeProvider>,
  );
};

describe('ValidationAlert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when form has not been submitted', () => {
    const { queryByRole } = renderComponent();

    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders nothing when form is valid and submitted', async () => {
    const validValues: CompleteFormValues = {
      ...defaultCompleteFormValues,
      phoneNumber: '555-1234',
    };

    const { queryByRole, findByRole } = renderComponent({
      initialValues: validValues,
      submitOnMount: true,
    });

    await expect(
      findByRole('alert', undefined, { timeout: 500 }),
    ).rejects.toThrow();
    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows alert with missing fields message after invalid submission', async () => {
    const { findByRole, findByText } = renderComponent({
      submitOnMount: true,
    });

    const alert = await findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(
      await findByText('Your form is missing information.'),
    ).toBeInTheDocument();
    expect(
      await findByText('Please enter a value for all required fields.'),
    ).toBeInTheDocument();
  });

  it('shows exceeding limit message when field exceeds max', async () => {
    const valuesExceedingAdoption: CompleteFormValues = {
      ...defaultCompleteFormValues,
      phoneNumber: '555-1234',
      adoption: '20000', // max is 15000
    };

    const { findByRole, findByText } = renderComponent({
      initialValues: valuesExceedingAdoption,
      submitOnMount: true,
    });

    await findByRole('alert');
    expect(
      await findByText(/The following fields exceed their limits/),
    ).toBeInTheDocument();
  });

  it('shows exceeding limit for housing down payment', async () => {
    const valuesExceedingHousing: CompleteFormValues = {
      ...defaultCompleteFormValues,
      phoneNumber: '555-1234',
      housingDownPayment: '60000', // max is 50000
    };

    const { findByRole, findByText } = renderComponent({
      initialValues: valuesExceedingHousing,
      submitOnMount: true,
    });

    await findByRole('alert');
    expect(
      await findByText(/The following fields exceed their limits/),
    ).toBeInTheDocument();
  });

  it('does not show exceeding limit when salaryInfo is undefined', async () => {
    const valuesExceedingAdoption: CompleteFormValues = {
      ...defaultCompleteFormValues,
      // phoneNumber is empty so form is invalid, triggering the alert
      adoption: '20000',
    };

    const { findByRole, queryByText } = renderComponent({
      initialValues: valuesExceedingAdoption,
      submitOnMount: true,
      salaryInfo: null,
    });

    await findByRole('alert');
    expect(
      queryByText(/The following fields exceed their limits/),
    ).not.toBeInTheDocument();
  });

  it('shows total additional salary requested error when applicable', async () => {
    const { findByRole, findByText } = renderComponent({
      initialValues: {
        ...defaultCompleteFormValues,
        phoneNumber: '555-1234',
        totalAdditionalSalaryRequested: '1000000',
      },
      submitOnMount: true,
    });

    await findByRole('alert');
    expect(
      await findByText(
        'Your total additional salary requested exceeds your account balance.',
      ),
    ).toBeInTheDocument();
  });
});
