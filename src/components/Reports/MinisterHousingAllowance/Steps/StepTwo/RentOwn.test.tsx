import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { UpdateMinistryHousingAllowanceRequestMutation } from '../../MinisterHousingAllowance.generated';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../../Shared/Context/MinisterHousingAllowanceContext';
import { mockMHARequest } from '../../mockData';
import { RentOwn } from './RentOwn';

const submit = jest.fn();
const mutationSpy = jest.fn();
const updateMutation = jest.fn();
const setHasCalcValues = jest.fn();

interface TestComponentProps {
  contextValue: Partial<ContextType>;
}

const TestComponent: React.FC<TestComponentProps> = ({ contextValue }) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter>
        <GqlMockedProvider<{
          UpdateMinistryHousingAllowanceRequest: UpdateMinistryHousingAllowanceRequestMutation;
        }>
          onCall={mutationSpy}
        >
          <Formik initialValues={{}} onSubmit={submit}>
            <MinisterHousingAllowanceContext.Provider
              value={contextValue as ContextType}
            >
              <RentOwn />
            </MinisterHousingAllowanceContext.Provider>
          </Formik>
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('RentOwn', () => {
  it('renders form and options for new page', async () => {
    const { getByRole, getByText, findAllByRole } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.New,
            updateMutation,
            setHasCalcValues,
            requestData: mockMHARequest,
            userEligibleForMHA: true,
          } as unknown as ContextType
        }
      />,
    );

    expect(getByRole('heading', { name: 'Rent or Own?' })).toBeInTheDocument();

    expect(getByText('Rent')).toBeInTheDocument();
    expect(getByText('Own')).toBeInTheDocument();

    expect(await findAllByRole('radio', { checked: false })).toHaveLength(2);
    userEvent.click(getByText('Rent'));

    await waitFor(() =>
      expect(updateMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            requestAttributes: {
              rentOrOwn: 'RENT',
              rentalValue: null,
              furnitureCostsOne: null,
              avgUtilityOne: null,
              mortgageOrRentPayment: null,
              furnitureCostsTwo: null,
              repairCosts: null,
              avgUtilityTwo: null,
              unexpectedExpenses: null,
              overallAmount: null,
              iUnderstandMhaPolicy: null,
            },
            requestId: '1',
          },
        },
      }),
    );

    expect(getByRole('radio', { name: 'Rent' })).toBeChecked();
  });

  it('renders form and options for edit page', async () => {
    const { getByRole, getByText } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.Edit,
            requestData: mockMHARequest,
          } as unknown as ContextType
        }
      />,
    );

    expect(getByRole('heading', { name: 'Rent or Own?' })).toBeInTheDocument();
    expect(
      getByText(/if this has changed from your previous submission/i),
    ).toBeInTheDocument();

    expect(getByRole('radio', { name: 'Rent' })).not.toBeChecked();
    expect(getByRole('radio', { name: 'Own' })).not.toBeChecked();
  });

  describe('Update Request Eligibility', () => {
    it('should allow update mutation when user is eligible', async () => {
      const { getByText } = render(
        <TestComponent
          contextValue={{
            pageType: PageEnum.New,
            updateMutation,
            setHasCalcValues,
            requestData: mockMHARequest,
            userEligibleForMHA: true,
          }}
        />,
      );

      await userEvent.click(getByText('Rent'));

      await waitFor(() =>
        expect(updateMutation).toHaveBeenCalledWith({
          variables: {
            input: {
              requestAttributes: {
                rentOrOwn: 'RENT',
                rentalValue: null,
                furnitureCostsOne: null,
                avgUtilityOne: null,
                mortgageOrRentPayment: null,
                furnitureCostsTwo: null,
                repairCosts: null,
                avgUtilityTwo: null,
                unexpectedExpenses: null,
                overallAmount: null,
                iUnderstandMhaPolicy: null,
              },
              requestId: '1',
            },
          },
        }),
      );
    });

    it('should block update mutation when user is not eligible', async () => {
      const { getByText } = render(
        <TestComponent
          contextValue={{
            pageType: PageEnum.New,
            updateMutation,
            setHasCalcValues,
            requestData: mockMHARequest,
            userEligibleForMHA: false,
          }}
        />,
      );

      await userEvent.click(getByText('Rent'));

      // Wait a moment to ensure the mutation would have been called if it was going to be
      await waitFor(() => {
        expect(updateMutation).not.toHaveBeenCalled();
      });
    });
  });
});
