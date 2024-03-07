import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { TimeZoneAccordion } from './TimeZoneAccordion';

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
const label = 'Time Zone';

const timeZones = [
  {
    key: 'Hawaii',
    value: '(GMT-10:00) Hawaii',
  },
  {
    key: 'Eastern Time (US & Canada)',
    value: '(GMT-05:00) Eastern Time (US & Canada)',
  },
];

interface ComponentsProps {
  timeZone: string;
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({ timeZone, expandedPanel }) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <TimeZoneAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            timeZone={timeZone}
            timeZones={timeZones}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('TimeZoneAccordion', () => {
  afterEach(() => {
    mutationSpy.mockClear();
  });
  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components timeZone={'USD'} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('should set the save button to disabled when the form is invalid', async () => {
    const value = ''; //value is required

    const { getByRole } = render(
      <Components timeZone={value} expandedPanel={label} />,
    );

    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('changes and saves the input', async () => {
    const { getByRole, getByText } = render(
      <Components
        timeZone={'Eastern Time (US & Canada)'}
        expandedPanel={label}
      />,
    );
    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    expect(
      getByText('(GMT-05:00) Eastern Time (US & Canada)'),
    ).toBeInTheDocument();
    expect(input).toBeInTheDocument();

    expect(input).toHaveValue('(GMT-05:00) Eastern Time (US & Canada)');
    expect(button).not.toBeDisabled();

    userEvent.click(input);
    userEvent.click(getByText('(GMT-10:00) Hawaii'));
    userEvent.click(button);

    await waitFor(() => {
      expect(mutationSpy.mock.lastCall).toMatchObject([
        {
          operation: {
            operationName: 'UpdatePersonalPreferences',
            variables: {
              input: {
                attributes: {
                  timeZone: 'Hawaii',
                },
              },
            },
          },
        },
      ]);
    });
  });
});
