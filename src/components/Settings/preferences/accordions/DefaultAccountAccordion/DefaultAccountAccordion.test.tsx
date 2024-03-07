import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { DefaultAccountAccordion } from './DefaultAccountAccordion';

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

const mockData = {
  user: {
    id: '1',
    defaultAccountList: '1',
    preferences: {
      id: '1',
      timeZone: 'us',
      localeDisplay: 'us',
      locale: 'en-US',
      hourToSendNotifications: 9,
    },
  },
  accountList: {
    name: 'Pedro Pérez',
    id: 'cbe2fe56-1525-4aee-8320-1ca7ccf09703',
  },
  accountLists: {
    nodes: [
      {
        name: 'Pedro Pérez',
        id: 'cbe2fe56-1525-4aee-8320-1ca7ccf09703',
      },
      {
        name: 'TTM | Clark Kent | MPD Coach',
        id: 'c1029414-992c-4aae-8b89-528c7737e499',
      },
    ],
  },
};

interface ComponentsProps {
  defaultAccountList: string;
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({
  defaultAccountList,
  expandedPanel,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <DefaultAccountAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            data={mockData}
            accountListId={accountListId}
            defaultAccountList={defaultAccountList}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Default Account';

describe('Default Account Accordion', () => {
  afterEach(() => {
    mutationSpy.mockClear();
  });
  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components
        defaultAccountList={'cbe2fe56-1525-4aee-8320-1ca7ccf09703'}
        expandedPanel=""
      />,
    );
    const input = queryByRole('combobox');

    expect(getByText(label)).toBeInTheDocument();
    expect(input).not.toBeInTheDocument();
  });

  it('should set the save button to disabled when the form is invalid', async () => {
    const value = ''; //value is required

    const { getByRole } = render(
      <Components defaultAccountList={value} expandedPanel={label} />,
    );

    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('Saves the input', async () => {
    const { getByRole, getByText } = render(
      <Components
        defaultAccountList={'cbe2fe56-1525-4aee-8320-1ca7ccf09703'}
        expandedPanel={label}
      />,
    );
    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => expect(input).toHaveValue('Pedro Pérez'));

    userEvent.type(input, 'Clark');
    userEvent.click(getByText('TTM | Clark Kent | MPD Coach'));
    userEvent.click(button);

    await waitFor(() => {
      expect(mutationSpy.mock.lastCall).toMatchObject([
        {
          operation: {
            operationName: 'UpdateUserDefaultAccount',
            variables: {
              input: {
                attributes: {
                  defaultAccountList: 'c1029414-992c-4aae-8b89-528c7737e499',
                },
              },
            },
          },
        },
      ]);
    });
  });
});
