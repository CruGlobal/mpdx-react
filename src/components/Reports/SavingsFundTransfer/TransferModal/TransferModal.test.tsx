import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { StaffSavingFundProvider } from '../../StaffSavingFund/StaffSavingFundContext';
import {
  CreateRecurringTransferMutation,
  CreateTransferMutation,
  UpdateRecurringTransferMutation,
} from '../TransferMutations.generated';
import { UpdatedAtProvider } from '../UpdatedAtContext/UpdateAtContext';
import {
  ScheduleEnum,
  TransferModalData,
  TransferTypeEnum,
  fundsMock,
} from '../mockData';
import { TransferModal } from './TransferModal';

const accountListId = 'abc';
const router = {
  query: { accountListId },
  isReady: true,
};

const handleClose = jest.fn();
const mutationSpy = jest.fn();
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

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: () => true, // force desktop mode
  };
});

const transferDefaultData: TransferModalData['transfer'] = {
  transferFrom: 'transferFrom',
  transferTo: '',
  amount: 0,
  schedule: ScheduleEnum.OneTime,
  status: undefined,
  endDate: null,
  note: '',
};

interface ComponentsProps {
  transfer?: TransferModalData['transfer'];
  type?: TransferTypeEnum;
}

const Components = ({
  transfer = transferDefaultData,
  type,
}: ComponentsProps) => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <TestRouter router={router}>
          <GqlMockedProvider<{
            createRecurringTransfer: CreateRecurringTransferMutation;
            createTransfer: CreateTransferMutation;
            updateRecurringTransfer: UpdateRecurringTransferMutation;
          }>
            onCall={({ operation }) =>
              mutationSpy({
                operationName: operation.operationName,
                variables: operation.variables,
              })
            }
          >
            <StaffSavingFundProvider>
              <UpdatedAtProvider>
                <TransferModal
                  data={{
                    type,
                    transfer,
                  }}
                  funds={fundsMock}
                  handleClose={handleClose}
                />
              </UpdatedAtProvider>
            </StaffSavingFundProvider>
          </GqlMockedProvider>
        </TestRouter>
      </LocalizationProvider>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('TransferModal', () => {
  it('should render the modal with correct inputs', () => {
    const { getByRole, getByText } = render(<Components />);

    expect(getByText('New Fund Transfer')).toBeInTheDocument();
    expect(
      getByRole('combobox', { name: /from account/i }),
    ).toBeInTheDocument();
    expect(getByRole('combobox', { name: /to account/i })).toBeInTheDocument();
    expect(getByRole('radio', { name: /one time/i })).toBeChecked();
    expect(
      getByRole('textbox', { name: /transfer date/i }),
    ).toBeInTheDocument();
    expect(getByRole('spinbutton', { name: /amount/i })).toBeInTheDocument();
  });

  it('should close modal when cancel button is clicked', () => {
    const { getByRole } = render(<Components />);

    userEvent.click(getByRole('button', { name: /cancel/i }));

    expect(handleClose).toHaveBeenCalled();
  });

  describe('Handle submit and validation', () => {
    it('should show validation errors for required fields', async () => {
      const { getByRole, findByText } = render(<Components />);

      const toAccount = getByRole('combobox', { name: /to account/i });
      const amountField = getByRole('spinbutton', { name: /amount/i });

      userEvent.click(toAccount);
      userEvent.tab();

      userEvent.click(amountField);
      userEvent.clear(amountField);
      userEvent.tab();

      userEvent.click(getByRole('button', { name: /submit/i }));

      expect(await findByText('To account is required')).toBeInTheDocument();
      expect(await findByText('Amount is required')).toBeInTheDocument();
    });

    it('should validate amount is greater than $0.01', async () => {
      const { getByRole, findByText } = render(<Components />);

      const amountField = getByRole('spinbutton', { name: /amount/i });

      userEvent.clear(amountField);
      userEvent.type(amountField, '-100');
      userEvent.tab();

      const fromAccount = getByRole('combobox', { name: /from account/i });
      const toAccount = getByRole('combobox', { name: /to account/i });

      userEvent.click(fromAccount);
      userEvent.click(getByRole('option', { name: /staff account/i }));
      userEvent.click(toAccount);
      userEvent.click(getByRole('option', { name: /staff savings/i }));

      userEvent.click(getByRole('button', { name: /submit/i }));

      expect(
        await findByText('Amount must be at least $0.01'),
      ).toBeInTheDocument();
    });

    it('should validate end date is after transfer date for recurring transfers', async () => {
      const { getByRole, findByLabelText, getByLabelText, findByText } = render(
        <Components />,
      );

      userEvent.click(getByRole('radio', { name: /monthly/i }));
      expect(getByRole('radio', { name: /monthly/i })).toBeChecked();

      expect(await findByLabelText(/end date/i)).toBeInTheDocument();

      const transferDate = getByLabelText(/transfer date/i);
      const endDate = getByLabelText(/end date/i);

      userEvent.clear(transferDate);
      userEvent.type(transferDate, '12/01/2024');
      expect(transferDate).toHaveValue('12/01/2024');
      userEvent.tab();

      userEvent.clear(endDate);
      userEvent.type(endDate, '11/01/2024');
      expect(endDate).toHaveValue('11/01/2024');

      userEvent.tab();

      expect(
        await findByText('End date must be after transfer date'),
      ).toBeInTheDocument();
    });

    it('should submit form with valid data', async () => {
      const { getByRole } = render(<Components />);

      const fromAccount = getByRole('combobox', { name: /from account/i });
      const toAccount = getByRole('combobox', { name: /to account/i });
      const amountField = getByRole('spinbutton', { name: /amount/i });

      userEvent.click(fromAccount);
      userEvent.click(getByRole('option', { name: /staff account/i }));

      userEvent.click(toAccount);
      userEvent.click(getByRole('option', { name: /staff savings/i }));

      userEvent.clear(amountField);
      userEvent.type(amountField, '100');

      userEvent.click(getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Transfer created successfully',
          {
            variant: 'success',
          },
        );
      });
    });

    it('should handle form submission successfully', async () => {
      const { getByRole } = render(<Components />);

      const fromAccount = getByRole('combobox', { name: /from account/i });
      const toAccount = getByRole('combobox', { name: /to account/i });
      const amountField = getByRole('spinbutton', { name: /amount/i });
      const submitButton = getByRole('button', { name: /submit/i });

      userEvent.click(fromAccount);
      userEvent.click(getByRole('option', { name: /staff account/i }));

      userEvent.click(toAccount);
      userEvent.click(getByRole('option', { name: /staff savings/i }));

      userEvent.clear(amountField);
      userEvent.type(amountField, '100');

      userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Transfer created successfully',
          {
            variant: 'success',
          },
        );
      });
    });
  });

  describe('Inputs', () => {
    it('should populate initial values from data prop', () => {
      const dataWithValues: TransferModalData['transfer'] = {
        transferFrom: '70056dcb-1a0f-4279-b710-928bcdff811a',
        transferTo: '408caf15-cdfd-41d1-8778-aa42a6561b85',
        amount: 500,
        schedule: ScheduleEnum.Monthly,
        status: undefined,
        endDate: null,
        note: 'Test note',
      };

      const { getByRole, getByDisplayValue, getByLabelText } = render(
        <Components transfer={dataWithValues} type={TransferTypeEnum.Edit} />,
      );

      const fromAccountInput = getByRole('combobox', {
        name: /from account/i,
      }).parentElement?.querySelector('input[name="transferFrom"]');
      const toAccountInput = getByRole('combobox', {
        name: /to account/i,
      }).parentElement?.querySelector('input[name="transferTo"]');

      expect(fromAccountInput).toHaveValue(
        '70056dcb-1a0f-4279-b710-928bcdff811a',
      );
      expect(toAccountInput).toHaveValue(
        '408caf15-cdfd-41d1-8778-aa42a6561b85',
      );

      expect(getByDisplayValue('500')).toBeInTheDocument();
      expect(getByRole('radio', { name: /monthly/i })).toBeChecked();
      expect(getByLabelText(/end date/i)).toHaveValue('');
    });

    it('should validate that from and to accounts are different', async () => {
      const { getByRole, queryByRole, getAllByRole } = render(<Components />);

      const [fromAccount, toAccount] = getAllByRole('combobox');

      userEvent.click(fromAccount);
      expect(
        getByRole('option', { name: /staff account/i }),
      ).toBeInTheDocument();
      userEvent.click(getByRole('option', { name: /staff account/i }));

      userEvent.click(toAccount);
      await waitFor(() =>
        expect(
          queryByRole('option', { name: /staff account/i }),
        ).not.toBeInTheDocument(),
      );

      userEvent.click(getByRole('option', { name: /staff savings/i }));
      userEvent.click(getByRole('button', { name: /submit/i }));
    });

    it('should swap accounts when swap button is clicked', async () => {
      const { getByRole, getByTestId } = render(<Components />);

      const icon = getByTestId('SwapHorizIcon');
      const swapButton = icon.closest('button');

      expect(swapButton).toBeDisabled();

      const fromAccount = getByRole('combobox', { name: /from account/i });
      const toAccount = getByRole('combobox', { name: /to account/i });

      userEvent.click(fromAccount);
      userEvent.click(getByRole('option', { name: /staff account/i }));

      userEvent.click(toAccount);
      userEvent.click(getByRole('option', { name: /staff savings/i }));

      await waitFor(() => {
        expect(swapButton).not.toBeDisabled();
      });

      userEvent.click(swapButton as HTMLButtonElement);

      await waitFor(() => {
        expect(fromAccount).toHaveTextContent('Staff Savings');
        expect(toAccount).toHaveTextContent('Staff Account');
      });
    });

    it('should show/hide end date based on schedule selection', async () => {
      const { getByRole, queryByRole, getByLabelText } = render(<Components />);

      expect(
        queryByRole('textbox', { name: /end date/i }),
      ).not.toBeInTheDocument();

      userEvent.click(getByRole('radio', { name: /monthly/i }));

      await waitFor(() =>
        expect(getByLabelText(/end date/i)).toBeInTheDocument(),
      );

      userEvent.click(getByRole('radio', { name: /annually/i }));

      await waitFor(() =>
        expect(getByLabelText(/end date/i)).toBeInTheDocument(),
      );

      userEvent.click(getByRole('radio', { name: /one time/i }));

      await waitFor(() =>
        expect(
          queryByRole('textbox', { name: /end date/i }),
        ).not.toBeInTheDocument(),
      );
    });

    it('should show error message when monthly schedule is selected', async () => {
      const { getByRole, getByLabelText, findByText } = render(<Components />);

      userEvent.click(getByRole('radio', { name: /monthly/i }));
      expect(getByRole('radio', { name: /monthly/i })).toBeChecked();

      expect(getByLabelText(/transfer date/i)).toBeInTheDocument();

      expect(
        await findByText(
          'Recurring transfers must start at least one day in the future',
        ),
      ).toBeInTheDocument();
    });

    it('should show information box when monthly is selected', async () => {
      const { getByRole, findByRole } = render(<Components />);

      const monthly = getByRole('radio', { name: /monthly/i });

      userEvent.click(monthly);
      expect(monthly).toBeChecked();

      const alert = await findByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(
        within(alert).getByText(
          'Recurring transfers will appear after the first scheduled payment is processed tomorrow.',
        ),
      ).toBeInTheDocument();
    });

    it('should show error message when amount will exceed available balance', async () => {
      const { getByRole, findByText } = render(<Components />);

      const fromAccount = getByRole('combobox', { name: /from account/i });
      const toAccount = getByRole('combobox', { name: /to account/i });

      userEvent.click(fromAccount);
      userEvent.click(getByRole('option', { name: /staff account/i }));

      userEvent.click(toAccount);
      userEvent.click(getByRole('option', { name: /staff savings/i }));

      const amountField = getByRole('spinbutton', { name: /amount/i });

      userEvent.clear(amountField);
      userEvent.type(amountField, '20000');
      userEvent.tab();

      expect(
        await findByText(
          'This amount will cause your account balance to exceed the deficit limit',
        ),
      ).toBeInTheDocument();
    });

    it('should show proper currency symbol in amount field', () => {
      const { getByText } = render(<Components />);

      expect(getByText('$')).toBeInTheDocument();
    });

    it('should handle different schedule types', async () => {
      const { getByRole } = render(<Components />);

      expect(getByRole('radio', { name: /one time/i })).toBeChecked();

      userEvent.click(getByRole('radio', { name: /monthly/i }));
      await waitFor(() => {
        expect(getByRole('radio', { name: /monthly/i })).toBeChecked();
      });

      userEvent.click(getByRole('radio', { name: /annually/i }));
      await waitFor(() => {
        expect(getByRole('radio', { name: /annually/i })).toBeChecked();
      });
    });
  });

  describe('Mutations', () => {
    it('should create a one-time transfer', async () => {
      const { getByRole } = render(<Components />);

      const fromAccount = getByRole('combobox', { name: /from account/i });
      const toAccount = getByRole('combobox', { name: /to account/i });
      const amountField = getByRole('spinbutton', { name: /amount/i });
      const submitButton = getByRole('button', { name: /submit/i });

      userEvent.click(fromAccount);
      userEvent.click(getByRole('option', { name: /staff account/i }));

      userEvent.click(toAccount);
      userEvent.click(getByRole('option', { name: /staff savings/i }));

      userEvent.clear(amountField);
      userEvent.type(amountField, '100');

      userEvent.click(submitButton);

      await waitFor(() => {
        expect(mutationSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            operationName: 'CreateTransfer',
            variables: {
              amount: 100,
              sourceFundTypeName: 'Staff Account',
              destinationFundTypeName: 'Staff Savings',
              description: '',
            },
          }),
        );
      });
    });

    it('should create a recurring transfer', async () => {
      const { getByRole, getByLabelText } = render(<Components />);

      const fromAccount = getByRole('combobox', { name: /from account/i });
      const toAccount = getByRole('combobox', { name: /to account/i });
      const amountField = getByRole('spinbutton', { name: /amount/i });
      const submitButton = getByRole('button', { name: /submit/i });

      userEvent.click(fromAccount);
      userEvent.click(getByRole('option', { name: /staff account/i }));

      userEvent.click(toAccount);
      userEvent.click(getByRole('option', { name: /staff savings/i }));

      userEvent.clear(amountField);
      userEvent.type(amountField, '100');

      userEvent.click(getByRole('radio', { name: /monthly/i }));

      const transferDate = getByLabelText(/transfer date/i);
      const endDate = getByLabelText(/end date/i);

      userEvent.clear(transferDate);
      userEvent.type(transferDate, '12/01/2024');
      expect(transferDate).toHaveValue('12/01/2024');
      userEvent.tab();

      userEvent.clear(endDate);
      userEvent.type(endDate, '12/01/2025');
      expect(endDate).toHaveValue('12/01/2025');

      userEvent.tab();

      userEvent.click(submitButton);

      await waitFor(() => {
        expect(mutationSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            operationName: 'CreateRecurringTransfer',
            variables: {
              amount: 100,
              sourceFundTypeName: 'Staff Account',
              destinationFundTypeName: 'Staff Savings',
              recurringStart: '2024-12-01T00:00:00.000+00:00',
              recurringEnd: '2025-12-01T00:00:00.000+00:00',
            },
          }),
        );
      });
    });

    it('should update a transfer', async () => {
      const dataWithValues: TransferModalData['transfer'] = {
        id: 'transfer-id',
        transferFrom: 'Primary',
        transferTo: 'Savings',
        amount: 500,
        schedule: ScheduleEnum.Monthly,
        transferDate: DateTime.fromISO('2024-11-01'),
        endDate: DateTime.fromISO('2025-11-01'),
        note: 'Test note',
        recurringId: 'recurring-id',
      };

      const { getByRole, getByLabelText } = render(
        <Components transfer={dataWithValues} type={TransferTypeEnum.Edit} />,
      );

      const amountField = getByRole('spinbutton', { name: /amount/i });
      const submitButton = getByRole('button', { name: /submit/i });

      userEvent.clear(amountField);
      userEvent.type(amountField, '600');

      const transferDate = getByLabelText(/transfer date/i);
      const endDate = getByLabelText(/end date/i);

      userEvent.clear(transferDate);
      userEvent.type(transferDate, '12/01/2024');
      expect(transferDate).toHaveValue('12/01/2024');
      userEvent.tab();

      userEvent.clear(endDate);
      userEvent.type(endDate, '12/01/2025');
      expect(endDate).toHaveValue('12/01/2025');

      userEvent.tab();

      userEvent.click(submitButton);

      await waitFor(() => {
        expect(mutationSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            operationName: 'UpdateRecurringTransfer',
            variables: {
              id: 'recurring-id',
              amount: 600,
              recurringStart: '2024-12-01T00:00:00.000+00:00',
              recurringEnd: '2025-12-01T00:00:00.000+00:00',
            },
          }),
        );
      });

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Transfer updated successfully',
          {
            variant: 'success',
          },
        );
      });
    });
  });

  describe('Edit mode', () => {
    const dataWithValues: TransferModalData['transfer'] = {
      id: '2',
      transferFrom: 'Primary',
      transferTo: 'Savings',
      amount: 500,
      schedule: ScheduleEnum.Monthly,
      transferDate: DateTime.fromISO('2024-11-01'),
      endDate: DateTime.fromISO('2025-11-01'),
      note: 'Test note',
    };

    it('should show error message when transfer date is before original start date', async () => {
      const { getByLabelText, findByText } = render(
        <Components transfer={dataWithValues} type={TransferTypeEnum.Edit} />,
      );

      const transferDate = getByLabelText(/transfer date/i);

      userEvent.clear(transferDate);
      userEvent.type(transferDate, '10/01/2024');
      expect(transferDate).toHaveValue('10/01/2024');
      userEvent.tab();

      expect(
        await findByText('Transfer date cannot be earlier than Nov 01, 2024'),
      ).toBeInTheDocument();
    });

    it('should disable specific fields', () => {
      const { getByText, getByRole } = render(
        <Components transfer={dataWithValues} type={TransferTypeEnum.Edit} />,
      );

      expect(getByText('Edit Fund Transfer')).toBeInTheDocument();

      const fromAccountInput = getByRole('combobox', {
        name: /from account/i,
      }).parentElement?.querySelector('input[name="transferFrom"]');
      const toAccountInput = getByRole('combobox', {
        name: /to account/i,
      }).parentElement?.querySelector('input[name="transferTo"]');

      expect(fromAccountInput).toHaveValue('Primary');
      expect(fromAccountInput).toBeDisabled();
      expect(toAccountInput).toHaveValue('Savings');
      expect(toAccountInput).toBeDisabled();

      expect(getByRole('radio', { name: /monthly/i })).toBeDisabled();
    });
  });
});
