import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
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

const defaultSchema = yup.object({
  mortgageOrRentPayment: yup.number().required('Mortgage Payment is required'),
});

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      UpdateMinistryHousingAllowanceRequest: UpdateMinistryHousingAllowanceRequestMutation;
    }>
      onCall={mutationSpy}
    >
      <MinisterHousingAllowanceContext.Provider
        value={
          {
            pageType: PageEnum.New,
            requestData: {
              id: 'request-id',
              requestAttributes: { mortgageOrRentPayment: null },
            },
          } as unknown as ContextType
        }
      >
        <Formik initialValues={{}} onSubmit={submit}>
          <AutosaveCustomTextField
            fieldName="mortgageOrRentPayment"
            schema={defaultSchema}
          />
        </Formik>
      </MinisterHousingAllowanceContext.Provider>
    </GqlMockedProvider>
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
});
