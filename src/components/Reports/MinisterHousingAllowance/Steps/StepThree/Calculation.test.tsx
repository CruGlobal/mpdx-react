import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { MhaRentOrOwnEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import {
  DeleteMinistryHousingAllowanceRequestMutation,
  SubmitMinistryHousingAllowanceRequestMutation,
  UpdateMinistryHousingAllowanceRequestMutation,
} from '../../MinisterHousingAllowance.generated';
import {
  ContextType,
  MinisterHousingAllowanceContext,
  MinisterHousingAllowanceProvider,
} from '../../Shared/Context/MinisterHousingAllowanceContext';
import { mockMHARequest } from '../../mockData';
import { Calculation } from './Calculation';

const submit = jest.fn();
const mutationSpy = jest.fn();
const mockPush = jest.fn();
const setHasCalcValues = jest.fn();
const updateMutation = jest.fn();
const handleNextStep = jest.fn();
const mockEnqueue = jest.fn();
const trackMutation = jest.fn();

const defaultContext: ContextType = {
  steps: [],
  currentIndex: 0,
  percentComplete: 0,
  handleNextStep,
  handlePreviousStep: jest.fn(),
  pageType: PageEnum.New,
  hasCalcValues: false,
  setHasCalcValues,
  isDrawerOpen: false,
  toggleDrawer: jest.fn(),
  setIsDrawerOpen: jest.fn(),
  setIsComplete: jest.fn(),
  isMarried: false,
  preferredName: '',
  spousePreferredName: '',
  userEligibleForMHA: false,
  spouseEligibleForMHA: false,
  handleDiscard: jest.fn(),
  loading: false,
  deleteRequestMutation: jest.fn(),
  updateMutation,
  isMutating: false,
  trackMutation,
};

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
  contextValue: ContextType;
  boardApprovedAt?: string | null;
  availableDate?: string | null;
  rentOrOwn?: MhaRentOrOwnEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  contextValue,
  boardApprovedAt = '2024-06-15',
  availableDate = '2024-07-01',
  rentOrOwn = MhaRentOrOwnEnum.Own,
}) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          UpdateMinistryHousingAllowanceRequest: UpdateMinistryHousingAllowanceRequestMutation;
          SubmitMinistryHousingAllowanceRequest: SubmitMinistryHousingAllowanceRequestMutation;
        }>
          onCall={mutationSpy}
        >
          <Formik initialValues={{}} onSubmit={submit}>
            <MinisterHousingAllowanceContext.Provider value={contextValue}>
              <Calculation
                boardApprovedAt={boardApprovedAt}
                availableDate={availableDate}
                rentOrOwn={rentOrOwn}
              />
            </MinisterHousingAllowanceContext.Provider>
          </Formik>
        </GqlMockedProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('Calculation', () => {
  it('renders the component', async () => {
    const { getByText, getByRole, findByRole } = render(
      <TestComponent contextValue={defaultContext} />,
    );

    expect(
      await findByRole('heading', { name: 'Calculate Your MHA Request' }),
    ).toBeInTheDocument();
    expect(
      getByText(/please enter dollar amounts for each category below/i),
    ).toBeInTheDocument();

    expect(
      getByRole('checkbox', { name: /i understand that my approved/i }),
    ).toBeInTheDocument();

    expect(getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should show validation error when inputs are invalid', async () => {
    const { findByText, getByRole, findByRole, getByText } = render(
      <TestComponent
        contextValue={{
          ...defaultContext,
          requestData: {
            ...mockMHARequest,
            id: 'request-id',
          },
        }}
      />,
    );

    const row = await findByRole('row', {
      name: /average monthly amount for unexpected/i,
    });
    const input = within(row).getByPlaceholderText(/\$0/i);

    userEvent.type(input, '100');
    expect(input).toHaveValue('100');
    userEvent.clear(input);
    expect(input).toHaveValue('');

    input.focus();
    userEvent.tab();

    expect(await findByText('Required field.')).toBeInTheDocument();

    const submitButton = getByRole('button', { name: /submit/i });

    userEvent.click(submitButton);

    expect(await findByRole('alert')).toBeInTheDocument();
    expect(
      getByText('Please enter a value for all required fields.'),
    ).toBeInTheDocument();
  });

  it('should show validation error when checkbox is not checked', async () => {
    const { findByText, findByRole, getByText } = render(
      <TestComponent contextValue={defaultContext} />,
    );

    const submitButton = await findByRole('button', { name: /submit/i });

    userEvent.click(submitButton);

    expect(
      await findByText('This box must be checked to continue.'),
    ).toBeInTheDocument();

    expect(await findByRole('alert')).toBeInTheDocument();
    expect(
      getByText(
        'Please check the box above if you understand how this was calculated.',
      ),
    ).toBeInTheDocument();
  });

  it('shows validation errors when email and phone are invalid', async () => {
    const { getByRole, findByText, findByRole } = render(
      <TestComponent
        contextValue={{
          ...defaultContext,
          requestData: {
            ...mockMHARequest,
            id: 'request-id',
            requestAttributes: {
              ...mockMHARequest.requestAttributes,
              phoneNumber: '1234567890',
              emailAddress: 'john.doe@cru.org',
            },
          },
        }}
      />,
    );

    const phone = await findByRole('textbox', { name: 'Telephone Number' });
    const email = getByRole('textbox', { name: 'Email' });

    expect(phone).toHaveValue('1234567890');
    expect(email).toHaveValue('john.doe@cru.org');

    userEvent.clear(phone);
    userEvent.tab();
    expect(await findByText('Phone Number is required.')).toBeInTheDocument();

    userEvent.clear(email);
    userEvent.tab();
    expect(await findByText('Email is required.')).toBeInTheDocument();

    userEvent.type(phone, 'abc');
    userEvent.tab();
    expect(await findByText('Invalid phone number')).toBeInTheDocument();

    userEvent.type(email, 'invalid-email');
    userEvent.tab();
    expect(await findByText('Invalid email address.')).toBeInTheDocument();
  });

  it('shows validation error when input is 0', async () => {
    const { findByRole, findByText } = render(
      <TestComponent
        contextValue={{
          ...defaultContext,
          requestData: {
            ...mockMHARequest,
            id: 'request-id',
          },
        }}
      />,
    );

    const row = await findByRole('row', {
      name: /average monthly amount for unexpected/i,
    });
    const input = within(row).getByPlaceholderText(/\$0/i);

    userEvent.type(input, '0');

    input.focus();
    userEvent.tab();

    expect(input).toHaveValue('$0.00');

    expect(await findByText('Must be greater than $0.')).toBeInTheDocument();
  });

  it('shows confirmation modal when submit is clicked', async () => {
    const { getByRole, getByText, findByRole } = render(
      <TestComponent
        contextValue={{
          ...defaultContext,
          requestData: {
            ...mockMHARequest,
            id: 'request-id',
            requestAttributes: {
              ...mockMHARequest.requestAttributes,
              iUnderstandMhaPolicy: false,
              phoneNumber: '1234567890',
              emailAddress: 'john.doe@cru.org',
            },
          },
        }}
        rentOrOwn={MhaRentOrOwnEnum.Rent}
      />,
    );

    const row1 = await findByRole('row', {
      name: /monthly rent/i,
    });
    const input1 = within(row1).getByPlaceholderText(/\$0/i);

    const row2 = getByRole('row', { name: /monthly value for furniture/i });
    const input2 = within(row2).getByPlaceholderText(/\$0/i);

    const row3 = getByRole('row', {
      name: /estimated monthly cost of repairs/i,
    });
    const input3 = within(row3).getByPlaceholderText(/\$0/i);

    const row4 = getByRole('row', {
      name: /average monthly utility costs/i,
    });
    const input4 = within(row4).getByPlaceholderText(/\$0/i);

    const row5 = getByRole('row', {
      name: /average monthly amount for unexpected/i,
    });
    const input5 = within(row5).getByPlaceholderText(/\$0/i);

    userEvent.type(input1, '1000');
    userEvent.type(input2, '200');
    userEvent.type(input3, '300');
    userEvent.type(input4, '400');
    userEvent.type(input5, '500');
    const checkbox = getByRole('checkbox', {
      name: /i understand that my approved/i,
    });
    userEvent.click(checkbox);

    const submitButton = getByRole('button', { name: /submit/i });

    userEvent.click(submitButton);
    expect(await findByRole('dialog')).toBeInTheDocument();

    expect(
      getByRole('heading', {
        name: 'Are you ready to submit your MHA Request?',
      }),
    ).toBeInTheDocument();
    expect(
      getByText(/you are submitting your mha request for board approval/i),
    ).toBeInTheDocument();

    expect(getByRole('button', { name: /go back/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /yes, continue/i })).toBeInTheDocument();

    expect(mutationSpy).not.toHaveGraphqlOperation(
      'SubmitMinistryHousingAllowanceRequest',
    );

    const confirmButton = getByRole('button', { name: /yes, continue/i });

    userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalledTimes(6);
    });

    expect(mutationSpy).toHaveGraphqlOperation(
      'SubmitMinistryHousingAllowanceRequest',
      {
        input: {
          requestId: 'request-id',
        },
      },
    );

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.stringContaining('MHA request submitted successfully.'),
        { variant: 'success' },
      );
    });
  }, 10000);

  it('should show discard modal when Discard is clicked', async () => {
    const { getByRole, findByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            push: mockPush,
            query: { accountListId: 'account-list-1' },
          }}
        >
          <SnackbarProvider>
            <GqlMockedProvider<{
              DeleteMinistryHousingAllowanceRequest: DeleteMinistryHousingAllowanceRequestMutation;
            }>
              onCall={mutationSpy}
            >
              <MinisterHousingAllowanceProvider
                requestId="request-id"
                type={PageEnum.New}
              >
                <Formik initialValues={{}} onSubmit={submit}>
                  <Calculation
                    boardApprovedAt={'2024-06-15'}
                    availableDate={'2024-07-01'}
                    rentOrOwn={MhaRentOrOwnEnum.Own}
                  />
                </Formik>
              </MinisterHousingAllowanceProvider>
            </GqlMockedProvider>
          </SnackbarProvider>
        </TestRouter>
      </ThemeProvider>,
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

    const confirmDiscard = getByRole('button', { name: /yes, discard/i });
    userEvent.click(confirmDiscard);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'DeleteMinistryHousingAllowanceRequest',
        {
          input: {
            requestId: 'request-id',
          },
        },
      );
    });

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.stringContaining('Request discarded successfully.'),
        { variant: 'success' },
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        `/accountLists/account-list-1/reports/housingAllowance`,
      );
    });
  });

  it('should change text when dates are null', () => {
    const { getByText } = render(
      <TestComponent
        contextValue={defaultContext}
        boardApprovedAt={null}
        availableDate={null}
      />,
    );

    expect(
      getByText(
        /the board will review this number and you will receive notice of your approval./i,
      ),
    ).toBeInTheDocument();
  });

  it('should update checkbox value when clicked', async () => {
    const { findByRole } = render(
      <TestComponent
        contextValue={{
          ...defaultContext,
          requestData: {
            ...mockMHARequest,
            id: 'request-id',
            requestAttributes: {
              ...mockMHARequest.requestAttributes,
              iUnderstandMhaPolicy: false,
            },
          },
        }}
      />,
    );

    const checkbox = await findByRole('checkbox', {
      name: /i understand that my approved/i,
    });
    expect(checkbox).not.toBeChecked();

    userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    await waitFor(() =>
      expect(updateMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            requestId: 'request-id',
            requestAttributes: {
              iUnderstandMhaPolicy: true,
            },
          },
        },
      }),
    );
  });

  it('should display correct totals when returning to the step with saved values', async () => {
    const { findByText, findAllByText } = render(
      <TestComponent
        contextValue={{
          ...defaultContext,
          requestData: {
            ...mockMHARequest,
            requestAttributes: {
              ...mockMHARequest.requestAttributes,
              mortgageOrRentPayment: 1000,
              furnitureCostsTwo: 200,
              repairCosts: 150,
              avgUtilityTwo: 300,
              unexpectedExpenses: 100,
            },
          },
        }}
        rentOrOwn={MhaRentOrOwnEnum.Rent}
      />,
    );

    // Total Monthly Cost
    expect(await findByText('$1,750.00')).toBeInTheDocument();
    // Annual Cost (Cost of Home and Request Summary Card)
    expect(await findAllByText('$21,000.00')).toHaveLength(2);
  });

  describe('isViewPage behavior', () => {
    it('renders view only mode', async () => {
      const { findByRole, queryByRole, getByText } = render(
        <TestComponent
          contextValue={{
            ...defaultContext,
            pageType: PageEnum.View,
          }}
        />,
      );

      expect(
        await findByRole('heading', { name: 'Your MHA Request' }),
      ).toBeInTheDocument();

      expect(getByText('Personal Contact Information')).toBeInTheDocument();

      expect(
        queryByRole('button', { name: /continue/i }),
      ).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
      expect(queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });
});
