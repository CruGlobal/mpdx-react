import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { UpdatePersonalPreferencesDocument } from '../UpdatePersonalPreferences.generated';
import { CurrencyAccordion } from './CurrencyAccordion';

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
  currency: string;
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({ currency, expandedPanel }) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider
          onCall={mutationSpy}
          mocks={{
            LoadConstants: {
              constant: {
                pledgeCurrency: [
                  {
                    code: 'CAD',
                    codeSymbolString: 'CAD ($)',
                    name: 'Canadian Dollar',
                  },
                  {
                    code: 'USD',
                    codeSymbolString: 'USD ($)',
                    name: 'US Dollar',
                  },
                  {
                    code: 'EUR',
                    codeSymbolString: 'EUR (€)',
                    name: 'Euro',
                  },
                  {
                    code: 'CHE',
                    codeSymbolString: 'CHE (CHE)',
                    name: 'WIR Euro',
                  },
                ],
              },
            },
          }}
        >
          <CurrencyAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            currency={currency}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const errorMock: MockedResponse = {
  request: {
    query: UpdatePersonalPreferencesDocument,
  },
  error: { name: 'error', message: 'Error loading data.  Try again.' },
};

const label = 'Default Currency';

describe('CurrencyAccordion', () => {
  afterEach(() => {
    mutationSpy.mockClear();
  });
  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components currency={'USD'} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByRole('combobox', { name: label })).not.toBeInTheDocument();
  });

  it('should set the save button to disabled when the form is invalid', async () => {
    const value = ''; //value is required

    const { getByRole } = render(
      <Components currency={value} expandedPanel={label} />,
    );

    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('Changes and saves the input', async () => {
    const { getByRole, getByText } = render(
      <Components currency={'USD'} expandedPanel={label} />,
    );
    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => input.blur());
    expect(getByText('USD')).toBeInTheDocument();
    await waitFor(() => expect(input).toHaveValue('US Dollar - USD ($)'));
    expect(button).not.toBeDisabled();

    userEvent.type(input, 'EUR');
    userEvent.click(getByText('Euro - EUR (€)'));
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
                  settings: {
                    currency: 'EUR',
                  },
                },
              },
            },
          },
        },
      ]);
    });
  });

  it('Should render the error state', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <MockedProvider mocks={[errorMock]}>
              <CurrencyAccordion
                handleAccordionChange={handleAccordionChange}
                expandedPanel={label}
                currency={'USD'}
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
      expect(mockEnqueue).toHaveBeenCalledWith('Saving failed.', {
        variant: 'error',
      });
    });
  });
});
