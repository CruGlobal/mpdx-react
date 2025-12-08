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
import theme from 'src/theme';
import { UpdateMinistryHousingAllowanceRequestMutation } from '../../../MinisterHousingAllowance.generated';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../../../Shared/Context/MinisterHousingAllowanceContext';
import { FairRentalValue } from './FairRentalValue';

const submit = jest.fn();
const mutationSpy = jest.fn();

const mockSchema = {
  validateSyncAt: jest.fn((_fieldName, _values) => {
    return null;
  }),
} as unknown as yup.Schema;

interface TestComponentProps {
  contextValue: Partial<ContextType>;
}

const TestComponent: React.FC<TestComponentProps> = ({ contextValue }) => (
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
              <FairRentalValue schema={mockSchema} />
            </Formik>
          </MinisterHousingAllowanceContext.Provider>
        </TestRouter>
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('FairRentalValue', () => {
  it('renders the component', () => {
    const { getByText, getByRole } = render(
      <TestComponent contextValue={{ pageType: PageEnum.New }} />,
    );

    expect(getByRole('table')).toBeInTheDocument();
    expect(
      getByText('Fair Rental Value', { selector: '.MuiCardHeader-title' }),
    ).toBeInTheDocument();

    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();

    expect(
      getByText(/monthly market rental value of your home/i),
    ).toBeInTheDocument();
    expect(getByText(/monthly value for furniture/i)).toBeInTheDocument();
    expect(getByText(/average monthly utility costs/i)).toBeInTheDocument();
  });

  it('should add text fields 1-3 and calculate annual value correctly', async () => {
    const { getByRole, getByText } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.New,
            requestData: {
              id: 'request-id',
              requestAttributes: {
                rentalValue: null,
                furnitureCostsOne: null,
                avgUtilityOne: null,
              },
            },
          } as unknown as ContextType
        }
      />,
    );

    const row1 = getByRole('row', {
      name: /monthly market rental value of your home/i,
    });
    const input1 = within(row1).getByPlaceholderText(/\$0/i);

    const row2 = getByRole('row', { name: /monthly value for furniture/i });
    const input2 = within(row2).getByPlaceholderText(/\$0/i);

    const row3 = getByRole('row', {
      name: /average monthly utility costs/i,
    });
    const input3 = within(row3).getByPlaceholderText(/\$0/i);

    await userEvent.type(input1, '1000');
    await userEvent.type(input2, '200');
    await userEvent.type(input3, '300');
    userEvent.tab();

    expect(input1).toHaveDisplayValue('$1,000.00');
    expect(input2).toHaveDisplayValue('$200.00');
    expect(input3).toHaveDisplayValue('$300.00');

    expect(getByText('$1,500.00')).toBeInTheDocument();
    expect(getByText('$18,000.00')).toBeInTheDocument();
  });

  describe('isPrint behavior', () => {
    it('should disable text fields when on view page', () => {
      const { getByRole } = render(
        <TestComponent contextValue={{ pageType: PageEnum.View }} />,
      );

      const row = getByRole('row', {
        name: /monthly market rental value of your home/i,
      });
      const input = within(row).getByRole('textbox');

      expect(input).toBeDisabled();
    });
  });
});
