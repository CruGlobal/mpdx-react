import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import theme from 'src/theme';
import { UpdatePersonalPreferencesDocument } from '../UpdatePersonalPreferences.generated';
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
const handleSetupChange = jest.fn();
const mutationSpy = jest.fn();

const countries = [
  { name: 'United States', code: 'US' },
  { name: 'Albania', code: 'AL' },
];

interface ComponentsProps {
  homeCountry: string;
  expandedAccordion: PreferenceAccordion | null;
}

const Components: React.FC<ComponentsProps> = ({
  homeCountry,
  expandedAccordion,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <HomeCountryAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={expandedAccordion}
            homeCountry={homeCountry}
            accountListId={accountListId}
            countries={countries}
            handleSetupChange={handleSetupChange}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Home Country';

const errorMock: MockedResponse = {
  request: {
    query: UpdatePersonalPreferencesDocument,
  },
  error: { name: 'error', message: 'Error loading data.  Try again.' },
};

describe('HomeCountryAccordion', () => {
  afterEach(() => {
    mutationSpy.mockClear();
  });
  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components homeCountry={'US'} expandedAccordion={null} />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('allows saving a blank value (None)', async () => {
    const value = ''; //value is not required

    const { getByRole } = render(
      <Components
        homeCountry={value}
        expandedAccordion={PreferenceAccordion.HomeCountry}
      />,
    );

    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('Changes and saves the input', async () => {
    const { getByRole, getByText } = render(
      <Components
        homeCountry={'US'}
        expandedAccordion={PreferenceAccordion.HomeCountry}
      />,
    );
    const button = getByRole('button', { name: 'Save' });
    const input = getByRole('combobox');

    expect(getByText('United States')).toBeInTheDocument();
    await waitFor(() => expect(input).toHaveValue('United States'));

    userEvent.click(input);
    userEvent.click(getByText('Albania'));
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
                    homeCountry: 'AL',
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
              <HomeCountryAccordion
                handleAccordionChange={handleAccordionChange}
                expandedAccordion={PreferenceAccordion.HomeCountry}
                homeCountry={'USA'}
                accountListId={accountListId}
                countries={countries}
                handleSetupChange={handleSetupChange}
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
