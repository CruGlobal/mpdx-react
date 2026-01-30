import { ThemeProvider } from '@emotion/react';
import { FormikProvider, useFormik } from 'formik';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import * as yup from 'yup';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import { amount } from 'src/lib/yupHelpers';
import theme from 'src/theme';
import { CompleteFormValues } from './AdditionalSalaryRequest';
import { AdditionalSalaryRequestProvider } from './Shared/AdditionalSalaryRequestContext';
import { fieldConfig } from './Shared/useAdditionalSalaryRequestForm';
// ...existing code...

interface AdditionalSalaryRequestTestWrapperProps {
  children?: React.ReactNode;
  initialValues?: CompleteFormValues;
  pageType?: 'new' | 'edit' | 'view';
  deductionPercentage?: number;
  onCall?: jest.Mock;
  mockPush?: jest.Mock;
}

const defaultInitialValues: CompleteFormValues = {
  currentYearSalaryNotReceived: '0',
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
  deductTwelvePercent: false,
  phoneNumber: '',
  emailAddress: '',
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

const TestFormikWrapper: React.FC<{
  children: React.ReactNode;
  initialValues?: CompleteFormValues;
}> = ({ children, initialValues }) => {
  const formik = useFormik<CompleteFormValues>({
    initialValues: initialValues || defaultInitialValues,
    validationSchema,
    onSubmit: () => {},
    enableReinitialize: true,
  });

  // Add validationSchema to formik context so autosave fields can access it
  const formikWithSchema = { ...formik, validationSchema };

  return <FormikProvider value={formikWithSchema}>{children}</FormikProvider>;
};

export const AdditionalSalaryRequestTestWrapper: React.FC<
  AdditionalSalaryRequestTestWrapperProps
> = ({
  children,
  initialValues,
  pageType = 'new',
  deductionPercentage = 0,
  onCall,
  mockPush,
}) => {
  const requestValues = initialValues || defaultInitialValues;

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <I18nextProvider i18n={i18n}>
          <TestRouter
            router={{
              query: {
                accountListId: 'account-list-1',
                mode: pageType,
              },
              push: mockPush,
            }}
          >
            <GqlMockedProvider
              mocks={{
                AdditionalSalaryRequest: {
                  additionalSalaryRequest: {
                    id: 'test-request-id',
                    ...Object.fromEntries(
                      Object.entries(requestValues)
                        .filter(
                          ([key]) => key !== 'traditional403bContribution',
                        )
                        .map(([key, value]) =>
                          typeof value === 'string' &&
                          key !== 'phoneNumber' &&
                          key !== 'emailAddress'
                            ? [key, parseFloat(value) || 0]
                            : [key, value],
                        ),
                    ),
                    traditional403bContribution: deductionPercentage,
                  },
                },
              }}
              onCall={onCall}
            >
              <AdditionalSalaryRequestProvider requestId="test-request-id">
                <TestFormikWrapper initialValues={initialValues}>
                  {children}
                </TestFormikWrapper>
              </AdditionalSalaryRequestProvider>
            </GqlMockedProvider>
          </TestRouter>
        </I18nextProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};
