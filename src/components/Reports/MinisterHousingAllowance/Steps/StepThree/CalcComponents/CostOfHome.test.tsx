import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import * as yup from 'yup';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { MhaRentOrOwnEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { UpdateMinistryHousingAllowanceRequestMutation } from '../../../MinisterHousingAllowance.generated';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../../../Shared/Context/MinisterHousingAllowanceContext';
import { CostOfHome } from './CostOfHome';

const submit = jest.fn();
const mutationSpy = jest.fn();

const mockSchema = {
  validateSyncAt: jest.fn((_fieldName, _values) => {
    return null;
  }),
} as unknown as yup.Schema;

interface TestComponentProps {
  contextValue: Partial<ContextType>;
  rentOrOwn?: MhaRentOrOwnEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  rentOrOwn,
  contextValue,
}) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider<{
        UpdateMinistryHousingAllowanceRequest: UpdateMinistryHousingAllowanceRequestMutation;
      }>
        onCall={mutationSpy}
      >
        <TestRouter>
          <MinisterHousingAllowanceContext.Provider
            value={contextValue as ContextType}
          >
            <Formik initialValues={{}} onSubmit={submit}>
              <CostOfHome schema={mockSchema} rentOrOwn={rentOrOwn} />
            </Formik>
          </MinisterHousingAllowanceContext.Provider>
        </TestRouter>
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('CostOfHome', () => {
  it('renders the component for own', () => {
    const { getByText, getByRole } = render(
      <TestComponent
        rentOrOwn={MhaRentOrOwnEnum.Own}
        contextValue={{ pageType: PageEnum.New }}
      />,
    );

    expect(getByRole('table')).toBeInTheDocument();
    expect(
      getByText('Cost of Providing a Home', {
        selector: '.MuiCardHeader-title',
      }),
    ).toBeInTheDocument();

    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();

    expect(getByText(/monthly mortgage payment, taxes/i)).toBeInTheDocument();
    expect(getByText(/monthly value for furniture/i)).toBeInTheDocument();
    expect(getByText(/estimated monthly cost of repairs/i)).toBeInTheDocument();
  });

  it('renders the component for rent', () => {
    const { getByText, getByRole, queryByText } = render(
      <TestComponent
        rentOrOwn={MhaRentOrOwnEnum.Rent}
        contextValue={{ pageType: PageEnum.New }}
      />,
    );

    expect(getByRole('table')).toBeInTheDocument();
    expect(
      getByText('Cost of Providing a Home', {
        selector: '.MuiCardHeader-title',
      }),
    ).toBeInTheDocument();

    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();

    expect(getByText(/monthly rent/i)).toBeInTheDocument();
    expect(
      queryByText(/monthly mortgage payment, taxes/i),
    ).not.toBeInTheDocument();
  });

  it('should add text fields 1-5 and calculate annual value correctly', async () => {
    const { getByRole, getByText } = render(
      <TestComponent
        rentOrOwn={MhaRentOrOwnEnum.Rent}
        contextValue={
          {
            pageType: PageEnum.New,
            requestData: {
              id: 'request-id',
              requestAttributes: {
                mortgageOrRentPayment: null,
                furnitureCostsTwo: null,
                repairCosts: null,
                avgUtilityTwo: null,
                unexpectedExpenses: null,
              },
            },
          } as unknown as ContextType
        }
      />,
    );

    const row1 = getByRole('row', {
      name: /monthly rent/i,
    });
    const input1 = within(row1).getByPlaceholderText(/enter amount/i);

    const row2 = getByRole('row', { name: /monthly value for furniture/i });
    const input2 = within(row2).getByPlaceholderText(/enter amount/i);

    const row3 = getByRole('row', {
      name: /estimated monthly cost of repairs/i,
    });
    const input3 = within(row3).getByPlaceholderText(/enter amount/i);

    const row4 = getByRole('row', {
      name: /average monthly utility costs/i,
    });
    const input4 = within(row4).getByPlaceholderText(/enter amount/i);

    const row5 = getByRole('row', {
      name: /average monthly amount for unexpected/i,
    });
    const input5 = within(row5).getByPlaceholderText(/enter amount/i);

    await userEvent.type(input1, '1000');
    userEvent.tab();

    await userEvent.type(input2, '200');
    await userEvent.type(input3, '300');
    await userEvent.type(input4, '400');
    await userEvent.type(input5, '500');
    userEvent.tab();

    expect(input1).toHaveDisplayValue('$1,000.00');
    expect(input2).toHaveDisplayValue('$200.00');
    expect(input3).toHaveDisplayValue('$300.00');
    expect(input4).toHaveDisplayValue('$400.00');
    expect(input5).toHaveDisplayValue('$500.00');

    expect(getByText('$2,400.00')).toBeInTheDocument();
    expect(getByText('$28,800.00')).toBeInTheDocument();
  });

  describe('isPrint behavior', () => {
    it('should disable text fields when on view page', () => {
      const { getByRole } = render(
        <TestComponent
          rentOrOwn={MhaRentOrOwnEnum.Own}
          contextValue={{ pageType: PageEnum.View }}
        />,
      );

      const row = getByRole('row', {
        name: /estimated monthly cost of repairs/i,
      });
      const input = within(row).getByRole('textbox');

      expect(input).toBeDisabled();
    });
  });
});
