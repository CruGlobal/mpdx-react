import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import theme from 'src/theme';
import { HourToSendNotificationsAccordion } from './HourToSendNotificationsAccordion';

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
  hourToSendNotifications: number | null;
  expandedAccordion: PreferenceAccordion | null;
}

const Components: React.FC<ComponentsProps> = ({
  hourToSendNotifications,
  expandedAccordion,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <HourToSendNotificationsAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={expandedAccordion}
            hourToSendNotifications={hourToSendNotifications}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Hour To Send Notifications';

describe('HourToSendNotificationsAccordion', () => {
  afterEach(() => {
    mutationSpy.mockClear();
  });
  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components hourToSendNotifications={0} expandedAccordion={null} />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('should always have the save button enabled. null will set to Immediately', async () => {
    const { getByRole, getByText } = render(
      <Components
        hourToSendNotifications={null}
        expandedAccordion={PreferenceAccordion.HourToSendNotifications}
      />,
    );

    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(getByText('Immediately')).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  it('changes and saves the input', async () => {
    const { getByRole, getByText } = render(
      <Components
        hourToSendNotifications={null}
        expandedAccordion={PreferenceAccordion.HourToSendNotifications}
      />,
    );
    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    userEvent.click(input);
    userEvent.type(input, '5');
    await waitFor(() => userEvent.click(getByText('5:00 AM')));
    userEvent.click(button);

    await waitFor(() => {
      expect(mutationSpy.mock.lastCall).toMatchObject([
        {
          operation: {
            operationName: 'UpdatePersonalPreferences',
            variables: {
              input: {
                attributes: {
                  hourToSendNotifications: 5,
                },
              },
            },
          },
        },
      ]);
    });
  });
});
