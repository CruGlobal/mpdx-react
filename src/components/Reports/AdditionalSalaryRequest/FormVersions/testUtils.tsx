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
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from '../Shared/CompleteForm.mock';
import { fieldConfig } from '../Shared/useAdditionalSalaryRequestForm';

export const mockUser = {
  staffInfo: {
    preferredName: 'Doe, John',
    personNumber: '00123456',
    emailAddress: 'john.doe@example.com',
  },
  currentSalary: {
    grossSalaryAmount: 40000,
  },
};

export const defaultMockContextValue = {
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

export const router = {
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
  emailAddress: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
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

export interface RenderFormComponentProps {
  initialValues?: CompleteFormValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextOverrides?: Record<string, any>;
}

export const setupMockContext = () => {
  const mockUseAdditionalSalaryRequest =
    useAdditionalSalaryRequest as jest.MockedFunction<
      typeof useAdditionalSalaryRequest
    >;
  return mockUseAdditionalSalaryRequest;
};

export const createRenderFormComponent =
  (
    FormComponent: React.ComponentType,
    mockUseAdditionalSalaryRequest: jest.MockedFunction<
      typeof useAdditionalSalaryRequest
    >,
  ) =>
  ({ initialValues, contextOverrides = {} }: RenderFormComponentProps = {}) => {
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
                <FormComponent />
              </TestFormikWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </I18nextProvider>
      </ThemeProvider>,
    );
  };
