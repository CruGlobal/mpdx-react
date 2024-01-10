import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
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

const label = 'Account Name';
const inputTestId = 'input' + label.replace(/\s/g, '');

describe('AccountNameAccordion', () => {
  it('should render accordion closed', () => {
    const { getByText, queryByTestId } = render(
      <Components name={"Pedro Perez's Account"} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByTestId(inputTestId)).not.toBeInTheDocument();
  });
  it('should render accordion open and textfield should have a value', () => {
    const { queryByTestId, getByRole } = render(
      <Components name={"Pedro Perez's Account"} expandedPanel={label} />,
    );

    const input = getByRole('textbox');
    const button = getByRole('button', { name: 'Save' });

    expect(queryByTestId(inputTestId)).toBeInTheDocument();
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
});
