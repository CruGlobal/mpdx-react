import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import {
  AdditionalSalaryRequestContext,
  AdditionalSalaryRequestType,
} from '../Shared/AdditionalSalaryRequestContext';
import { MissingLocationAlert } from './MissingLocationAlert';

const missingLocationText =
  "Your cap may be inaccurate because your location isn't set.";
const oneTimeUsedText =
  "You've already used your one-time location update, so please submit a new Salary Calculation Form to set your location.";
const preferenceKey = 'location_set_from_asr';

const userDefault = {
  staffInfo: {
    city: 'New Braunfels',
    state: 'TX',
  },
};

type ComponentProps = {
  calculations?: object | null;
  user?: object;
  locationSetFromAsr?: boolean;
  onCall?: jest.Mock;
};

const renderComponent = ({
  calculations = { currentSalaryCap: 75000, geographicLocation: null },
  user = userDefault,
  locationSetFromAsr = false,
  onCall = jest.fn(),
}: ComponentProps = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          UserOption: UserOptionQuery;
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
        }>
          mocks={{
            UserOption: {
              userOption: {
                key: preferenceKey,
                value: String(locationSetFromAsr),
              },
            },
            GoalCalculatorConstants: {
              constant: {
                mpdGoalBenefitsConstants: [{ id: 'benefits-1' }],
                mpdGoalGeographicConstants: [
                  { location: 'None', percentageMultiplier: 0 },
                  { location: 'Orlando, FL', percentageMultiplier: 0.06 },
                ],
                mpdGoalMiscConstants: [],
              },
            },
          }}
          onCall={onCall}
        >
          <AdditionalSalaryRequestContext.Provider
            value={
              { calculations, user } as unknown as AdditionalSalaryRequestType
            }
          >
            <MissingLocationAlert />
          </AdditionalSalaryRequestContext.Provider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

const waitForPreference = async (onCall: jest.Mock) => {
  await waitFor(() => expect(onCall).toHaveGraphqlOperation('UserOption'));
  await act(async () => {});
};

describe('MissingLocationAlert', () => {
  it('shows the alert with the HCM city and state when the location is missing', async () => {
    const { findByRole, getByRole } = renderComponent();

    const alert = await findByRole('alert');
    expect(alert).toHaveTextContent(missingLocationText);
    expect(alert).toHaveTextContent(
      'We see that you live in New Braunfels, TX. Please set your location so your cap is accurate.',
    );
    expect(getByRole('button', { name: 'Set Location' })).toBeInTheDocument();
  });

  it('leaves out where the user lives when HCM has no city or state', async () => {
    const { findByRole } = renderComponent({
      user: { staffInfo: { city: null, state: null } },
    });

    const alert = await findByRole('alert');
    expect(alert).toHaveTextContent(missingLocationText);
    expect(alert).not.toHaveTextContent('We see that you live in');
  });

  it('shows only the parts of the HCM location that exist', async () => {
    const { findByRole } = renderComponent({
      user: { staffInfo: { city: null, state: 'TX' } },
    });

    expect(await findByRole('alert')).toHaveTextContent(
      'We see that you live in TX.',
    );
  });

  it('opens the location modal from the Set Location button', async () => {
    const { findByRole, getByRole, queryByRole } = renderComponent();

    userEvent.click(await findByRole('button', { name: 'Set Location' }));

    expect(getByRole('heading', { name: 'Set Your Location' })).toBeVisible();
    expect(queryByRole('dialog')).toBeInTheDocument();
  });

  it('remembers that the one-time update was used after saving', async () => {
    const onCall = jest.fn();
    const { findByRole, getByRole } = renderComponent({ onCall });

    userEvent.click(await findByRole('button', { name: 'Set Location' }));
    await waitFor(() => expect(getByRole('combobox')).toBeEnabled());
    userEvent.click(getByRole('combobox'));
    userEvent.click(await findByRole('option', { name: 'Orlando, FL' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('UpdateUserOption', {
        key: preferenceKey,
        value: 'true',
      }),
    );
  });

  it('points to the Salary Calculation Form once the one-time update is used', async () => {
    const { findByRole, queryByRole } = renderComponent({
      locationSetFromAsr: true,
    });

    expect(queryByRole('alert')).not.toBeInTheDocument();

    const alert = await findByRole('alert');
    expect(alert).toHaveTextContent(missingLocationText);
    expect(alert).toHaveTextContent(oneTimeUsedText);
    expect(alert).not.toHaveTextContent('We see that you live in');
    expect(
      queryByRole('button', { name: 'Set Location' }),
    ).not.toBeInTheDocument();
  });

  it('hides the alert when the location is set', async () => {
    const onCall = jest.fn();
    const { queryByRole } = renderComponent({
      calculations: {
        currentSalaryCap: 75000,
        geographicLocation: 'Orlando, FL',
      },
      onCall,
    });

    await waitForPreference(onCall);

    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('hides the alert when there are no calculations yet', async () => {
    const onCall = jest.fn();
    const { queryByRole } = renderComponent({
      calculations: null,
      onCall,
    });

    await waitForPreference(onCall);

    expect(queryByRole('alert')).not.toBeInTheDocument();
  });
});
