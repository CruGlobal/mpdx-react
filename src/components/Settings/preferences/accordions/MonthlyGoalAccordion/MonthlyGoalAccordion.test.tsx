import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
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
const mutationSpy = jest.fn();

interface ComponentsProps {
  monthlyGoal: number | null;
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({
  monthlyGoal,
  expandedPanel,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <MonthlyGoalAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            loading={false}
            monthlyGoal={monthlyGoal}
            currency={'USD'}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Monthly Goal';

describe('MonthlyGoalAccordion', () => {
  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components monthlyGoal={100} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByRole('textbox')).not.toBeInTheDocument();
  });
  it('should render accordion open and textfield should have a value', () => {
    const { getByRole } = render(
      <Components monthlyGoal={20000} expandedPanel={label} />,
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
      <Components monthlyGoal={value} expandedPanel={label} />,
    );

    const input = getByRole('spinbutton', { name: label });
    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(input).not.toBeValid();
      expect(getByText('Monthly Goal is required')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it('Saves the input', async () => {
    const { getByRole } = render(
      <Components monthlyGoal={1000} expandedPanel={label} />,
    );
    const button = getByRole('button', { name: 'Save' });

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
                    monthlyGoal: 1000,
                  },
                },
              },
            },
          },
        },
      ]);
    });
  });
});
