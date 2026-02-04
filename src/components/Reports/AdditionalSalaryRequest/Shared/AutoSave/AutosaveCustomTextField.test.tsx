import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { UpdateAdditionalSalaryRequestMutation } from '../../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../../AdditionalSalaryRequestHelper';
import {
  AdditionalSalaryRequestType,
  useAdditionalSalaryRequest,
} from '../AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from '../CompleteForm.mock';
import { AutosaveCustomTextField } from './AutosaveCustomTextField';

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

const defaultSchema = yup.object({
  currentYearSalaryNotReceived: yup
    .number()
    .required('Current year salary is required'),
});

const defaultMockContextValue: AdditionalSalaryRequestType = {
  staffAccountId: 'staff-account-1',
  staffAccountIdLoading: false,
  steps: [],
  currentIndex: 1,
  currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
  handleNextStep: jest.fn(),
  handlePreviousStep: jest.fn(),
  isDrawerOpen: true,
  toggleDrawer: jest.fn(),
  requestData: {
    latestAdditionalSalaryRequest: {
      id: 'request-id',
      currentYearSalaryNotReceived: null,
      calculations: {
        currentSalaryCap: 50000,
        staffAccountBalance: 20000,
      },
    },
  } as AdditionalSalaryRequestType['requestData'],
  loading: false,
  requestError: undefined,
  pageType: PageEnum.New,
  handleDeleteRequest: jest.fn(),
  requestId: 'request-id',
  user: undefined,
  spouse: undefined,
  salaryInfo: undefined,
  isInternational: false,
  isMutating: false,
  trackMutation: mockTrackMutation,
};

interface TestComponentProps {
  contextOverrides?: Partial<AdditionalSalaryRequestType>;
  initialValues?: Partial<CompleteFormValues>;
}

const TestFormikWrapper: React.FC<{
  children: React.ReactNode;
  initialValues?: Partial<CompleteFormValues>;
}> = ({ children, initialValues }) => {
  const formik = useFormik<CompleteFormValues>({
    initialValues: { ...defaultCompleteFormValues, ...initialValues },
    validationSchema: defaultSchema,
    onSubmit: () => {},
    enableReinitialize: true,
  });

  // Add validationSchema to formik context so autosave fields can access it
  const formikWithSchema = { ...formik, validationSchema: defaultSchema };

  return <FormikProvider value={formikWithSchema}>{children}</FormikProvider>;
};

const TestComponent: React.FC<TestComponentProps> = ({
  contextOverrides = {},
  initialValues,
}) => {
  const contextValue = { ...defaultMockContextValue, ...contextOverrides };
  mockUseAdditionalSalaryRequest.mockReturnValue(contextValue);

  return (
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        UpdateAdditionalSalaryRequest: UpdateAdditionalSalaryRequestMutation;
      }>
        onCall={mutationSpy}
      >
        <TestFormikWrapper initialValues={initialValues}>
          <AutosaveCustomTextField fieldName="currentYearSalaryNotReceived" />
        </TestFormikWrapper>
      </GqlMockedProvider>
    </ThemeProvider>
  );
};

describe('AutosaveCustomTextField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with no errors', async () => {
    const { getByRole } = render(
      <TestComponent
        initialValues={{ currentYearSalaryNotReceived: undefined }}
      />,
    );

    const input = getByRole('textbox');
    await waitFor(() => expect(input).toHaveValue(''));

    expect(input).toHaveAccessibleDescription('');
  });

  it('shows validation error on invalid input', async () => {
    const { getByRole, getByText } = render(
      <TestComponent
        initialValues={{ currentYearSalaryNotReceived: undefined }}
      />,
    );

    const input = getByRole('textbox');
    userEvent.type(input, 'invalid');
    userEvent.tab();

    await waitFor(() =>
      expect(getByText('Current year salary is required')).toBeInTheDocument(),
    );
  });

  it('saves valid input on blur', async () => {
    const { getByRole } = render(
      <TestComponent
        initialValues={{ currentYearSalaryNotReceived: undefined }}
      />,
    );

    const input = getByRole('textbox');
    userEvent.type(input, '1500');
    input.blur();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateAdditionalSalaryRequest',
        {
          id: 'request-id',
          attributes: {
            currentYearSalaryNotReceived: 1500,
            totalAdditionalSalaryRequested: 1500,
          },
        },
      ),
    );

    await waitFor(() => expect(input).toHaveValue('$1,500.00'));
  });

  it('saves null value', async () => {
    const { getByRole } = render(
      <TestComponent
        initialValues={{ currentYearSalaryNotReceived: undefined }}
      />,
    );

    const input = getByRole('textbox');
    userEvent.type(input, '1500');
    userEvent.clear(input);
    userEvent.tab();

    await waitFor(() => expect(input).toHaveValue(''));
  });

  it('is disabled when pageType is View', async () => {
    const { getByRole } = render(
      <TestComponent contextOverrides={{ pageType: PageEnum.View }} />,
    );

    const input = getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('is disabled when requestData is missing', async () => {
    const { getByRole } = render(
      <TestComponent contextOverrides={{ requestData: undefined }} />,
    );

    const input = getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
