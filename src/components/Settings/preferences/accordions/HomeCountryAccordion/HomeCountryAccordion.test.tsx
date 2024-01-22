import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { HomeCountryAccordion } from './HomeCountryAccordion';

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
  homeCountry: string;
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({
  homeCountry,
  expandedPanel,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <HomeCountryAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            loading={false}
            homeCountry={homeCountry}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Home Country';

describe('HomeCountryAccordion', () => {
  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components homeCountry={'USD'} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByRole('combobox')).not.toBeInTheDocument();
  });
  it('should render accordion open and the input should have a value', async () => {
    const { getByText, getByRole } = render(
      <Components homeCountry={'DE'} expandedPanel={label} />,
    );

    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    expect(getByText('Germany')).toBeInTheDocument();
    expect(getByRole('combobox')).toBeInTheDocument();

    await waitFor(() => {
      expect(input).toHaveValue('Germany');
      expect(button).not.toBeDisabled();
    });
  });

  it('should set the save button to disabled when the form is invalid', async () => {
    const value = ''; //value is required

    const { getByRole } = render(
      <Components homeCountry={value} expandedPanel={label} />,
    );

    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('Saves the input', async () => {
    const { getByRole } = render(
      <Components homeCountry={'US'} expandedPanel={label} />,
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
                  settings: {
                    homeCountry: 'US',
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
