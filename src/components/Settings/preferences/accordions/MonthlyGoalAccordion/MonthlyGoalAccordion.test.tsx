import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import theme from 'src/theme';
import { MachineCalculatedGoalQuery } from './MachineCalculatedGoal.generated';
import { MonthlyGoalAccordion } from './MonthlyGoalAccordion';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
  isReady: true,
};

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

const handleAccordionChange = jest.fn();
const handleSetupChange = jest.fn();
const mutationSpy = jest.fn();

interface ComponentsProps {
  monthlyGoal: number | null;
  monthlyGoalUpdatedAt?: string | null;
  machineCalculatedGoal?: number;
  machineCalculatedGoalCurrency?: string | null;
  expandedAccordion: PreferenceAccordion | null;
}

const Components: React.FC<ComponentsProps> = ({
  monthlyGoal,
  monthlyGoalUpdatedAt = null,
  machineCalculatedGoal,
  machineCalculatedGoalCurrency = 'USD',
  expandedAccordion,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          MachineCalculatedGoal: MachineCalculatedGoalQuery;
        }>
          mocks={{
            MachineCalculatedGoal: {
              accountList: {
                healthIndicatorData: machineCalculatedGoal
                  ? { machineCalculatedGoal, machineCalculatedGoalCurrency }
                  : null,
              },
            },
          }}
          onCall={mutationSpy}
        >
          <MonthlyGoalAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={expandedAccordion}
            monthlyGoal={monthlyGoal}
            monthlyGoalUpdatedAt={monthlyGoalUpdatedAt}
            currency={'USD'}
            accountListId={accountListId}
            handleSetupChange={handleSetupChange}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Monthly Goal';

describe('MonthlyGoalAccordion', () => {
  afterEach(() => {
    mutationSpy.mockClear();
  });

  describe('closed', () => {
    it('renders label and hides the textbox', () => {
      const { getByText, queryByRole } = render(
        <Components monthlyGoal={100} expandedAccordion={null} />,
      );

      expect(getByText(label)).toBeInTheDocument();
      expect(queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('renders goal without updated date', () => {
      const { getByTestId } = render(
        <Components
          monthlyGoal={100}
          monthlyGoalUpdatedAt={null}
          expandedAccordion={null}
        />,
      );

      expect(getByTestId('AccordionSummaryValue')).toHaveTextContent('$100');
    });

    it('renders goal and updated date', () => {
      const { getByTestId } = render(
        <Components
          monthlyGoal={100}
          monthlyGoalUpdatedAt="2024-01-01T00:00:00"
          expandedAccordion={null}
        />,
      );

      expect(getByTestId('AccordionSummaryValue')).toHaveTextContent(
        '$100 (last updated Jan 1, 2024)',
      );
    });

    it('renders too low warning', async () => {
      const { getByTestId } = render(
        <Components
          monthlyGoal={100}
          machineCalculatedGoal={1000}
          expandedAccordion={null}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('AccordionSummaryValue')).toHaveTextContent(
          '$100 (below machine-calculated support goal)',
        ),
      );
    });

    it('hides too low warning when currencies do not match', async () => {
      const { getByTestId } = render(
        <Components
          monthlyGoal={100}
          machineCalculatedGoal={1000}
          machineCalculatedGoalCurrency="EUR"
          expandedAccordion={null}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('AccordionSummaryValue')).not.toHaveTextContent(
          /below machine-calculated support goal/,
        ),
      );
    });

    it('renders calculated goal', async () => {
      const { getByTestId } = render(
        <Components
          monthlyGoal={null}
          machineCalculatedGoal={1000}
          machineCalculatedGoalCurrency="EUR"
          expandedAccordion={null}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('AccordionSummaryValue')).toHaveTextContent(
          '€1,000 (estimated)',
        ),
      );
    });

    it('renders calculated goal without currency', async () => {
      const { getByTestId } = render(
        <Components
          monthlyGoal={null}
          machineCalculatedGoal={1000}
          machineCalculatedGoalCurrency={null}
          expandedAccordion={null}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('AccordionSummaryValue')).toHaveTextContent(
          '1,000 (estimated)',
        ),
      );
    });

    it('renders only goal when calculated goal is missing', async () => {
      const { getByTestId } = render(
        <Components monthlyGoal={100} expandedAccordion={null} />,
      );

      await waitFor(() =>
        expect(getByTestId('AccordionSummaryValue')).toHaveTextContent('$100'),
      );
    });

    it('renders nothing when goal and calculated goal are missing', async () => {
      const { queryByTestId } = render(
        <Components monthlyGoal={null} expandedAccordion={null} />,
      );

      await waitFor(() =>
        expect(queryByTestId('AccordionSummaryValue')).not.toBeInTheDocument(),
      );
    });
  });

  it('should render accordion open and textfield should have a value', () => {
    const { getByRole } = render(
      <Components
        monthlyGoal={20000}
        expandedAccordion={PreferenceAccordion.MonthlyGoal}
      />,
    );

    const input = getByRole('spinbutton', { name: label });
    const button = getByRole('button', { name: 'Save' });

    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(20000);
    expect(button).not.toBeDisabled();
  });

  it('should set the save button to disabled when the form is invalid', async () => {
    const value = null; //value is required

    const { getByRole, getByText } = render(
      <Components
        monthlyGoal={value}
        expandedAccordion={PreferenceAccordion.MonthlyGoal}
      />,
    );

    const input = getByRole('spinbutton', { name: label });
    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(input).not.toBeValid();
      expect(getByText('Monthly Goal is required')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it('Changes and saves the input', async () => {
    const { getByRole } = render(
      <Components
        monthlyGoal={1000}
        expandedAccordion={PreferenceAccordion.MonthlyGoal}
      />,
    );
    const input = getByRole('spinbutton', { name: label });
    const button = getByRole('button', { name: 'Save' });

    userEvent.clear(input);
    userEvent.click(input);
    userEvent.type(input, '500');
    userEvent.click(button);

    await waitFor(() => {
      expect(mutationSpy.mock.lastCall).toMatchObject([
        {
          operation: {
            operationName: 'UpdateAccountPreferences',
            variables: {
              input: {
                id: accountListId,
                attributes: {
                  settings: {
                    monthlyGoal: 500,
                  },
                },
              },
            },
          },
        },
      ]);
    });
  });

  describe('calculated goal', () => {
    it('resets goal to calculated goal', async () => {
      const { getByRole, findByText } = render(
        <Components
          monthlyGoal={1000}
          machineCalculatedGoal={1500}
          machineCalculatedGoalCurrency="EUR"
          expandedAccordion={PreferenceAccordion.MonthlyGoal}
        />,
      );

      expect(
        await findByText(
          /Based on the past year, NetSuite estimates that you need at least €1,500 of monthly support./,
        ),
      ).toBeInTheDocument();

      const resetButton = getByRole('button', { name: /Reset/ });
      userEvent.click(resetButton);

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences', {
          input: {
            id: accountListId,
            attributes: {
              settings: {
                monthlyGoal: null,
              },
            },
          },
        }),
      );
    });

    it('hides reset button if goal is null', async () => {
      const { findByText, queryByRole } = render(
        <Components
          monthlyGoal={null}
          machineCalculatedGoal={1000}
          expandedAccordion={PreferenceAccordion.MonthlyGoal}
        />,
      );

      expect(
        await findByText(
          /Based on the past year, NetSuite estimates that you need at least \$1,000 of monthly support./,
        ),
      ).toBeInTheDocument();
      expect(queryByRole('button', { name: /Reset/ })).not.toBeInTheDocument();
    });
  });
});
