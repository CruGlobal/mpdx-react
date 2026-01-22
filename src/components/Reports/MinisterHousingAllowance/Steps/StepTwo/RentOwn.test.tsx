import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { MhaRentOrOwnEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { UpdateMinistryHousingAllowanceRequestMutation } from '../../MinisterHousingAllowance.generated';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../../Shared/Context/MinisterHousingAllowanceContext';
import { RentOwn } from './RentOwn';

const submit = jest.fn();
const mutationSpy = jest.fn();
const updateMutation = jest.fn();
const setHasCalcValues = jest.fn();
const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

interface TestComponentProps {
  contextValue: Partial<ContextType>;
}

const TestComponent: React.FC<TestComponentProps> = ({ contextValue }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <SnackbarProvider>
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
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('RentOwn', () => {
  it('renders form and options for new page', async () => {
    const { getByRole, getByText, findAllByRole, findByRole } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.New,
            updateMutation,
            setHasCalcValues,
            hasCalcValues: true,
            requestData: { id: 'request-id' },
          } as unknown as ContextType
        }
      />,
    );

    expect(
      await findByRole('heading', { name: 'Rent or Own?' }),
    ).toBeInTheDocument();

    expect(getByText('Rent')).toBeInTheDocument();
    expect(getByText('Own')).toBeInTheDocument();

    expect(await findAllByRole('radio', { checked: false })).toHaveLength(2);
    await userEvent.click(getByText('Rent'));

    await waitFor(() =>
      expect(updateMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            requestAttributes: {
              rentOrOwn: MhaRentOrOwnEnum.Rent,
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
            requestId: 'request-id',
          },
        },
      }),
    );

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.stringContaining('All inputs have been cleared successfully'),
        { variant: 'success' },
      );
    });

    expect(getByRole('radio', { name: 'Rent' })).toBeChecked();
  });

  it('renders form and options for edit page', async () => {
    const { getByRole, getByText } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.Edit,
            requestData: { id: 'request-id' },
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

  it('should show discard modal when Discard is clicked', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.New,
          } as unknown as ContextType
        }
      />,
    );

    const discard = await findByRole('button', { name: /discard/i });

    userEvent.click(discard);

    await waitFor(() => {
      expect(
        getByRole('heading', {
          name: 'Do you want to discard?',
        }),
      ).toBeInTheDocument();
    });
  });
});
