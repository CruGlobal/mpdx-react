import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { GoalCalculatorConstantsDocument } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { UpdateAccountPreferencesDocument } from '../UpdateAccountPreferences.generated';
import { GeographicLocationAccordion } from './GeographicLocationAccordion';

const label = 'Geographic Location';
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

const geographicConstants = [
  { location: 'Chicago, IL', percentageMultiplier: 0.1 },
  { location: 'Los Angeles, CA', percentageMultiplier: 0.15 },
];

interface ComponentsProps {
  geographicLocation: string;
  expandedAccordion: PreferenceAccordion | null;
}

const Components: React.FC<ComponentsProps> = ({
  geographicLocation,
  expandedAccordion,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider
          mocks={{
            GoalCalculatorConstants: {
              constant: {
                mpdGoalGeographicConstants: geographicConstants,
              },
            },
          }}
          onCall={mutationSpy}
        >
          <GeographicLocationAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={expandedAccordion}
            geographicLocation={geographicLocation}
            accountListId={accountListId}
            handleSetupChange={handleSetupChange}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const errorMocks: MockedResponse[] = [
  {
    request: {
      query: GoalCalculatorConstantsDocument,
      variables: { year: null },
    },
    result: {
      data: {
        constant: {
          mpdGoalBenefitsConstants: [],
          mpdGoalGeographicConstants: [],
          mpdGoalMiscConstants: [],
        },
      },
    },
  },
  {
    request: {
      query: UpdateAccountPreferencesDocument,
    },
    error: { name: 'error', message: 'Error loading data.  Try again.' },
  },
];

describe('GeographicLocationAccordion', () => {
  afterEach(() => {
    mutationSpy.mockClear();
  });

  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components
        geographicLocation={'Chicago, IL'}
        expandedAccordion={null}
      />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('allows saving a blank value', async () => {
    const value = '';

    const { getByRole } = render(
      <Components
        geographicLocation={value}
        expandedAccordion={PreferenceAccordion.GeographicLocation}
      />,
    );

    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('changes and saves the input', async () => {
    const { getByRole, getByText } = render(
      <Components
        geographicLocation={'Chicago, IL'}
        expandedAccordion={PreferenceAccordion.GeographicLocation}
      />,
    );
    const button = getByRole('button', { name: 'Save' });
    const input = getByRole('combobox');

    await waitFor(() => expect(input).toHaveValue('Chicago, IL'));

    userEvent.click(input);
    userEvent.click(getByText('Los Angeles, CA'));
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
                    geographicLocation: 'Los Angeles, CA',
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
            <MockedProvider mocks={errorMocks}>
              <GeographicLocationAccordion
                handleAccordionChange={handleAccordionChange}
                expandedAccordion={PreferenceAccordion.GeographicLocation}
                geographicLocation={'Chicago, IL'}
                accountListId={accountListId}
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
