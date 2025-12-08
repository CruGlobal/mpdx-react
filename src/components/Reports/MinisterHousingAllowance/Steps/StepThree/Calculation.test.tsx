import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
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
import { Calculation } from './Calculation';

const submit = jest.fn();
const mutationSpy = jest.fn();
const setHasCalcValues = jest.fn();
const setIsPrint = jest.fn();
const updateMutation = jest.fn();

interface TestComponentProps {
  contextValue: Partial<ContextType>;
  boardApprovalDate?: string | null;
  availableDate?: string | null;
  rentOrOwn?: MhaRentOrOwnEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  contextValue,
  boardApprovalDate = '2024-06-15',
  availableDate = '2024-07-01',
  rentOrOwn = MhaRentOrOwnEnum.Own,
}) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
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
              <Calculation
                boardApprovalDate={boardApprovalDate}
                availableDate={availableDate}
                rentOrOwn={rentOrOwn}
              />
            </MinisterHousingAllowanceContext.Provider>
          </Formik>
        </GqlMockedProvider>
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('Calculation', () => {
  it('renders the component', () => {
    const { getByText, getByRole } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.New,
            setHasCalcValues,
            setIsPrint,
          } as unknown as ContextType
        }
      />,
    );

    expect(
      getByRole('heading', { name: 'Calculate Your MHA Request' }),
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
        contextValue={
          {
            pageType: PageEnum.New,
            setHasCalcValues,
            setIsPrint,
            requestData: {
              id: 'request-id',
              requestAttributes: {
                unexpectedCosts: null,
              },
            },
          } as unknown as ContextType
        }
      />,
    );

    const row = getByRole('row', {
      name: /average monthly amount for unexpected/i,
    });
    const input = within(row).getByPlaceholderText(/enter amount/i);

    await userEvent.type(input, '100');
    expect(input).toHaveValue('100');
    await userEvent.clear(input);
    expect(input).toHaveValue('');

    input.focus();
    await userEvent.tab();

    expect(await findByText('Required field.')).toBeInTheDocument();

    const submitButton = getByRole('button', { name: /submit/i });

    await userEvent.click(submitButton);

    expect(await findByRole('alert')).toBeInTheDocument();
    expect(
      getByText('Please enter a value for all required fields.'),
    ).toBeInTheDocument();
  });

  it('should show validation error when checkbox is not checked', async () => {
    const { findByText, getByRole, getByText, findByRole } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.New,
            setHasCalcValues,
            setIsPrint,
          } as unknown as ContextType
        }
      />,
    );

    const submitButton = getByRole('button', { name: /submit/i });

    await userEvent.click(submitButton);

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

  it('shows validation errors when inputs are invalid', async () => {
    const { getByRole, findByText } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.New,
            setHasCalcValues,
            setIsPrint,
            requestData: {
              id: 'request-id',
              requestAttributes: {
                phoneNumber: '1234567890',
                emailAddress: 'john.doe@cru.org',
              },
            },
          } as unknown as ContextType
        }
      />,
    );

    const phone = getByRole('textbox', { name: 'Telephone Number' });
    const email = getByRole('textbox', { name: 'Email' });

    expect(phone).toHaveValue('1234567890');
    expect(email).toHaveValue('john.doe@cru.org');

    await userEvent.clear(phone);
    await userEvent.tab();
    expect(await findByText('Phone Number is required.')).toBeInTheDocument();

    await userEvent.clear(email);
    await userEvent.tab();
    expect(await findByText('Email is required.')).toBeInTheDocument();

    await userEvent.type(phone, 'abc');
    await userEvent.tab();
    expect(await findByText('Invalid phone number.')).toBeInTheDocument();

    await userEvent.type(email, 'invalid-email');
    await userEvent.tab();
    expect(await findByText('Invalid email address.')).toBeInTheDocument();
  });

  it('shows confirmation modal when submit is clicked', async () => {
    const { getByRole, getByText, findByRole } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.New,
            setHasCalcValues,
            setIsPrint,
            updateMutation,
            requestData: {
              id: 'request-id',
              requestAttributes: {
                mortgageOrRentPayment: null,
                furnitureValue: null,
                repairCosts: null,
                utilityCosts: null,
                unexpectedCosts: null,
                iUnderstandMhaPolicy: false,
                phoneNumber: '1234567890',
                emailAddress: 'john.doe@cru.org',
              },
            },
          } as unknown as ContextType
        }
        rentOrOwn={MhaRentOrOwnEnum.Rent}
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
    await userEvent.type(input2, '200');
    await userEvent.type(input3, '300');
    await userEvent.type(input4, '400');
    await userEvent.type(input5, '500');

    const checkbox = getByRole('checkbox', {
      name: /i understand that my approved/i,
    });
    await userEvent.click(checkbox);

    const submitButton = getByRole('button', { name: /submit/i });

    await userEvent.click(submitButton);

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
  });

  it('should change text when dates are null', () => {
    const { getByText } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.New,
            setHasCalcValues,
            setIsPrint,
          } as unknown as ContextType
        }
        boardApprovalDate={null}
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
    const { getByRole } = render(
      <TestComponent
        contextValue={
          {
            pageType: PageEnum.New,
            setHasCalcValues,
            setIsPrint,
            updateMutation,
            requestData: {
              id: 'request-id',
              requestAttributes: {
                iUnderstandMhaPolicy: false,
              },
            },
          } as unknown as ContextType
        }
      />,
    );

    const checkbox = getByRole('checkbox', {
      name: /i understand that my approved/i,
    });
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
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

  describe('isViewPage behavior', () => {
    it('renders view only mode', () => {
      const { getByRole, queryByRole, getByText } = render(
        <TestComponent
          contextValue={
            {
              pageType: PageEnum.View,
              setHasCalcValues,
              setIsPrint,
            } as unknown as ContextType
          }
        />,
      );

      expect(
        getByRole('heading', { name: 'Your MHA Request' }),
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
