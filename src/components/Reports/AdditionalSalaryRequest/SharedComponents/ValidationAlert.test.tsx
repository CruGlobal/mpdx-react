import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { FormikProvider, useFormik } from 'formik';
import { I18nextProvider } from 'react-i18next';
import * as yup from 'yup';
import i18n from 'src/lib/i18n';
import { amount } from 'src/lib/yupHelpers';
import theme from 'src/theme';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { defaultCompleteFormValues } from '../Shared/CompleteForm.mock';
import { fieldConfig } from '../Shared/useAdditionalSalaryRequestForm';
import { ValidationAlert } from './ValidationAlert';

// Mock max values matching what salaryInfo would return for US-based staff
const mockMaxValues: Record<string, number> = {
  maxAdoptionUss: 15000,
  maxAutoPurchaseUss: 50000,
  maxCollegeUss: 50000,
  maxHousingDownPaymentUss: 50000,
};

const createValidationSchema = () =>
  yup.object({
    ...Object.fromEntries(
      fieldConfig.map(({ key, label, salaryInfoUssKey }) => {
        let schema = amount(label, (key: string) => key);
        const max = salaryInfoUssKey
          ? mockMaxValues[salaryInfoUssKey]
          : undefined;
        if (max) {
          schema = schema.max(max, `Exceeds $${max.toLocaleString()} limit`);
        }
        return [key, schema];
      }),
    ),
    deductTwelvePercent: yup.boolean(),
    phoneNumber: yup.string().required('Telephone number is required'),
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
}

const renderComponent = ({
  initialValues,
  submitOnMount = false,
}: RenderOptions = {}) =>
  render(
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

describe('ValidationAlert', () => {
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
});
