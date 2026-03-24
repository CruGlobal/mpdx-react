import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, useFormikContext } from 'formik';
import { SnackbarProvider } from 'notistack';
import * as yup from 'yup';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { UpdateMinistryHousingAllowanceRequestMutation } from '../../MinisterHousingAllowance.generated';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../Context/MinisterHousingAllowanceContext';
import { AutosaveCustomTextField } from './AutosaveCustomTextField';

const submit = jest.fn();
const mutationSpy = jest.fn();
const trackMutation = jest.fn();

const defaultSchema = yup.object({
  mortgageOrRentPayment: yup.number().required('Mortgage Payment is required'),
  avgUtilityOne: yup.number().nullable(),
  avgUtilityTwo: yup.number().nullable(),
});

interface TestComponentProps {
  fieldName?: keyof import('../../Steps/StepThree/Calculation').CalculationFormValues &
    string;
  additionalSaveFields?: Array<
    keyof import('../../Steps/StepThree/Calculation').CalculationFormValues &
      string
  >;
  requestAttributes?: Record<string, unknown>;
  showFormValues?: boolean;
}

const FormValuesDisplay: React.FC = () => {
  const { values } = useFormikContext();
  return <div data-testid="form-values">{JSON.stringify(values)}</div>;
};

const TestComponent: React.FC<TestComponentProps> = ({
  fieldName = 'mortgageOrRentPayment',
  additionalSaveFields,
  requestAttributes = { mortgageOrRentPayment: null },
  showFormValues = false,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <GqlMockedProvider<{
        UpdateMinistryHousingAllowanceRequest: UpdateMinistryHousingAllowanceRequestMutation;
      }>
        onCall={mutationSpy}
      >
        <MinisterHousingAllowanceContext.Provider
          value={
            {
              pageType: PageEnum.New,
              trackMutation,
              requestData: {
                id: 'request-id',
                requestAttributes,
              },
            } as unknown as ContextType
          }
        >
          <Formik initialValues={{}} onSubmit={submit}>
            <>
              <AutosaveCustomTextField
                fieldName={fieldName}
                additionalSaveFields={additionalSaveFields}
                schema={defaultSchema}
              />
              {showFormValues && <FormValuesDisplay />}
            </>
          </Formik>
        </MinisterHousingAllowanceContext.Provider>
      </GqlMockedProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('AutosaveCustomTextField', () => {
  it('initializes with no errors', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox');
    await waitFor(() => expect(input).toHaveValue(''));

    expect(input).toHaveAccessibleDescription('');
  });

  it('shows validation error on invalid input', async () => {
    const { getByRole, getByText } = render(<TestComponent />);

    const input = getByRole('textbox');
    await userEvent.type(input, 'invalid');
    await userEvent.tab();

    await waitFor(() =>
      expect(getByText('Mortgage Payment is required')).toBeInTheDocument(),
    );
  });

  it('saves valid input on blur', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox');
    await userEvent.type(input, '1500');
    input.blur();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateMinistryHousingAllowanceRequest',
        {
          input: {
            requestId: 'request-id',
            requestAttributes: {
              mortgageOrRentPayment: 1500,
            },
          },
        },
      ),
    );

    await waitFor(() => expect(input).toHaveValue('$1,500.00'));
  });

  it('saves null value', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox');
    await userEvent.type(input, '1500');
    await userEvent.clear(input);
    await userEvent.tab();

    await waitFor(() => expect(input).toHaveValue(''));
  });

  it('saves to additional fields alongside the primary field', async () => {
    const { getByRole } = render(
      <TestComponent
        fieldName="avgUtilityOne"
        additionalSaveFields={['avgUtilityTwo']}
        requestAttributes={{ avgUtilityOne: null, avgUtilityTwo: null }}
      />,
    );

    const input = getByRole('textbox');
    userEvent.type(input, '200');
    input.blur();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateMinistryHousingAllowanceRequest',
        {
          input: {
            requestId: 'request-id',
            requestAttributes: {
              avgUtilityOne: 200,
              avgUtilityTwo: 200,
            },
          },
        },
      ),
    );
  });

  it('updates Formik values for additional fields when typing', async () => {
    const { getByRole, getByTestId } = render(
      <TestComponent
        fieldName="avgUtilityOne"
        additionalSaveFields={['avgUtilityTwo']}
        requestAttributes={{ avgUtilityOne: null, avgUtilityTwo: null }}
        showFormValues
      />,
    );

    const input = getByRole('textbox');
    await userEvent.type(input, '200');

    await waitFor(() => {
      const formValues = JSON.parse(getByTestId('form-values').textContent!);
      expect(formValues.avgUtilityOne).toBe(200);
      expect(formValues.avgUtilityTwo).toBe(200);
    });
  });

  it('saves null to all fields when additional fields are specified and input is cleared', async () => {
    const { getByRole } = render(
      <TestComponent
        fieldName="avgUtilityOne"
        additionalSaveFields={['avgUtilityTwo']}
        requestAttributes={{ avgUtilityOne: 100, avgUtilityTwo: 100 }}
      />,
    );

    const input = getByRole('textbox');
    userEvent.clear(input);
    userEvent.tab();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateMinistryHousingAllowanceRequest',
        {
          input: {
            requestId: 'request-id',
            requestAttributes: {
              avgUtilityOne: null,
              avgUtilityTwo: null,
            },
          },
        },
      ),
    );
  });
});
