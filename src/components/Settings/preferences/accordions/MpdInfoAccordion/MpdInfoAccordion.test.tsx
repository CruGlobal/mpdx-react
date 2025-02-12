import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import theme from 'src/theme';
import { MpdInfoAccordion } from './MpdInfoAccordion';

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
  activeMpdMonthlyGoal: number | null;
  activeMpdFinishAt: string | null;
  activeMpdStartAt: string | null;
  expandedAccordion: PreferenceAccordion | null;
}

const Components: React.FC<ComponentsProps> = ({
  activeMpdMonthlyGoal,
  activeMpdStartAt,
  activeMpdFinishAt,
  expandedAccordion,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider onCall={mutationSpy}>
            <MpdInfoAccordion
              handleAccordionChange={handleAccordionChange}
              expandedAccordion={expandedAccordion}
              activeMpdMonthlyGoal={activeMpdMonthlyGoal}
              activeMpdFinishAt={activeMpdFinishAt}
              activeMpdStartAt={activeMpdStartAt}
              currency={'USD'}
              accountListId={accountListId}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'MPD Info';

describe('MpdInfoAccordion', () => {
  afterEach(() => {
    mutationSpy.mockClear();
  });
  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components
        activeMpdStartAt={null}
        activeMpdFinishAt={null}
        activeMpdMonthlyGoal={100}
        expandedAccordion={null}
      />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByRole('spinbutton')).not.toBeInTheDocument();
  });
  it('should render accordion open and field should have a value', async () => {
    const { getByRole, getAllByRole } = render(
      <Components
        activeMpdStartAt={'2024-01-16'}
        activeMpdFinishAt={'2024-03-16'}
        activeMpdMonthlyGoal={20000}
        expandedAccordion={PreferenceAccordion.MpdInfo}
      />,
    );

    const inputGoal = getByRole('spinbutton', { name: label });
    const inputStart = getAllByRole('textbox')[0];
    const inputEnd = getAllByRole('textbox')[1];
    const button = getByRole('button', { name: 'Save' });

    expect(inputGoal).toBeInTheDocument();
    expect(inputGoal).toHaveValue(20000);

    expect(inputStart).toHaveValue('01/16/2024');
    expect(inputEnd).toHaveValue('03/16/2024');
    expect(button).not.toBeDisabled();
  });

  it('should always be valid even when the form is null', async () => {
    const { getByRole } = render(
      <Components
        activeMpdStartAt={null}
        activeMpdFinishAt={null}
        activeMpdMonthlyGoal={null}
        expandedAccordion={PreferenceAccordion.MpdInfo}
      />,
    );

    const input = getByRole('spinbutton', { name: label });
    const button = getByRole('button', { name: 'Save' });

    expect(input).toBeValid();
    expect(button).not.toBeDisabled();
  });

  it('Saves the input', async () => {
    const { getByRole, getByText, getAllByRole } = render(
      <Components
        activeMpdStartAt={'2011-02-22'}
        activeMpdFinishAt={'2011-12-01'}
        activeMpdMonthlyGoal={1000}
        expandedAccordion={PreferenceAccordion.MpdInfo}
      />,
    );
    const inputStart = getAllByRole('textbox')[0];
    const inputEnd = getAllByRole('textbox')[1];
    const goalInput = getByRole('spinbutton', { name: label });
    const button = getByRole('button', { name: 'Save' });

    userEvent.clear(goalInput);
    userEvent.click(goalInput);
    userEvent.type(goalInput, '3333');

    userEvent.click(inputStart);
    userEvent.click(getByText('15'));
    const dateOkayButton = await waitFor(() => getByText('OK'));
    userEvent.click(dateOkayButton);

    userEvent.click(inputEnd);
    await waitFor(() => userEvent.click(getByText('Clear')));

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
                  activeMpdStartAt: '2011-02-15',
                  activeMpdFinishAt: null,
                  activeMpdMonthlyGoal: 3333,
                },
              },
            },
          },
        },
      ]);
    });
  });
});
