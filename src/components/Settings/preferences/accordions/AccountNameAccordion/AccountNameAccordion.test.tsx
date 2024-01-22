import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { UpdateAccountPreferencesDocument } from '../UpdateAccountPreferences.generated';
import { AccountNameAccordion } from './AccountNameAccordion';

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
  name: string;
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({ name, expandedPanel }) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <AccountNameAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            loading={false}
            name={name}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const errorMock: MockedResponse = {
  request: {
    query: UpdateAccountPreferencesDocument,
  },
  error: { name: 'error', message: 'Error loading data.  Try again.' },
};

const label = 'Account Name';

describe('AccountNameAccordion', () => {
  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components name={"Pedro Perez's Account"} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByRole('textbox')).not.toBeInTheDocument();
  });
  it('should render accordion open and textfield should have a value', () => {
    const { getByRole } = render(
      <Components name={"Pedro Perez's Account"} expandedPanel={label} />,
    );

    const input = getByRole('textbox');
    const button = getByRole('button', { name: 'Save' });

    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Pedro Perez's Account");
    expect(button).not.toBeDisabled();
  });

  it('should set the save button to disabled when the form is invalid', async () => {
    const name = ''; //name is required

    const { getByRole, getByText } = render(
      <Components name={name} expandedPanel={label} />,
    );

    const input = getByRole('textbox');
    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(input).not.toBeValid();
      expect(getByText('Account Name is required')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it('Saves the input', async () => {
    const { getByRole } = render(
      <Components name={'Test Account'} expandedPanel={label} />,
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
                  id: accountListId,
                  name: 'Test Account',
                },
              },
            },
          },
        },
      ]);
    });
  });
  it('Should render the error state', async () => {
    const { getByRole, queryByTestId } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <MockedProvider mocks={[errorMock]}>
              <AccountNameAccordion
                handleAccordionChange={handleAccordionChange}
                expandedPanel={label}
                loading={false}
                name={'Test Account'}
                accountListId={accountListId}
              />
            </MockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    const button = getByRole('button', { name: 'Save' });

    userEvent.click(button);

    await waitFor(() => {
      expect(queryByTestId('LoadingAccountName')).not.toBeInTheDocument();
      expect(mockEnqueue).toHaveBeenCalledWith('Saving failed.', {
        variant: 'error',
      });
    });
  });
});
