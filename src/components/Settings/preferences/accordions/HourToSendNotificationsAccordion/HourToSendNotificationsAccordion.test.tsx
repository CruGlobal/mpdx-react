import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
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
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({
  hourToSendNotifications,
  expandedPanel,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider
          onCall={mutationSpy}
          mocks={{
            LoadConstants: {
              constant: {
                times: [
                  {
                    key: 0,
                    value: '12:00 AM',
                  },
                  {
                    key: 20,
                    value: '8:00 PM',
                  },
                  {
                    key: null,
                    value: 'Immediately',
                  },
                ],
              },
            },
          }}
        >
          <HourToSendNotificationsAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            loading={false}
            hourToSendNotifications={hourToSendNotifications}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Hour To Send Notifications';
const inputTestId = 'input' + label.replace(/\s/g, '');

describe('HourToSendNotificationsAccordion', () => {
  it('should render accordion closed', () => {
    const { getByText, queryByTestId } = render(
      <Components hourToSendNotifications={0} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByTestId(inputTestId)).not.toBeInTheDocument();
  });
  it('should render accordion open and the input should have a value', async () => {
    const { getByText, getByRole, queryByTestId } = render(
      <Components hourToSendNotifications={20} expandedPanel={label} />,
    );

    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(getByText('8:00 PM')).toBeInTheDocument();
      expect(queryByTestId(inputTestId)).toBeInTheDocument();
      expect(input).toHaveValue('8:00 PM');
      expect(button).not.toBeDisabled();
    });
  });

  it('should always have the save button enabled. null will set to Immediately', async () => {
    const { getByRole, getByText } = render(
      <Components hourToSendNotifications={null} expandedPanel={label} />,
    );

    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(getByText('Immediately')).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  it('Saves the input', async () => {
    const { getByRole } = render(
      <Components hourToSendNotifications={null} expandedPanel={label} />,
    );
    const button = getByRole('button', { name: 'Save' });

    userEvent.click(button);

    await waitFor(() => {
      expect(mutationSpy.mock.lastCall).toMatchObject([
        {
          operation: {
            operationName: 'UpdatePersonalPreferences',
            variables: {
              input: {
                attributes: {
                  hourToSendNotifications: null,
                },
              },
            },
          },
        },
      ]);
    });
  });
});
