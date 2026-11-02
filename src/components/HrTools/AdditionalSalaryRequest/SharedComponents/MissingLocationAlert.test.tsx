import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import {
  AdditionalSalaryRequestContext,
  AdditionalSalaryRequestType,
} from '../Shared/AdditionalSalaryRequestContext';
import { UpdateUserGeographicLocationMutation } from '../UpdateUserGeographicLocation.generated';
import { MissingLocationAlert } from './MissingLocationAlert';

const missingLocationText =
  "Your cap may be inaccurate because your location isn't set.";

const userDefault = {
  staffInfo: {
    city: 'New Braunfels',
    state: 'TX',
  },
};

type ComponentProps = {
  calculations?: Partial<
    NonNullable<AdditionalSalaryRequestType['calculations']>
  > | null;
  user?: DeepPartial<AdditionalSalaryRequestType['user']>;
  hcmLoading?: boolean;
  onCall?: jest.Mock;
};

const renderComponent = ({
  calculations = { currentSalaryCap: 75000, geographicLocation: null },
  user = userDefault,
  hcmLoading = false,
  onCall = jest.fn(),
}: ComponentProps = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          UpdateUserGeographicLocation: UpdateUserGeographicLocationMutation;
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
        }>
          mocks={{
            UpdateUserGeographicLocation: {
              updateUserGeographicLocation: {
                geographicLocation: 'Orlando, FL',
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
              {
                calculations,
                user,
                hcmLoading,
              } as unknown as AdditionalSalaryRequestType
            }
          >
            <MissingLocationAlert />
          </AdditionalSalaryRequestContext.Provider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

const saveLocation = async ({
  findByRole,
  getByRole,
}: ReturnType<typeof renderComponent>) => {
  userEvent.click(await findByRole('button', { name: 'Set Location' }));
  await waitFor(() => expect(getByRole('combobox')).toBeEnabled());
  userEvent.click(getByRole('combobox'));
  userEvent.click(await findByRole('option', { name: 'Orlando, FL' }));
  userEvent.click(getByRole('button', { name: 'Save' }));
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

  it('saves the location from the modal', async () => {
    const onCall = jest.fn();
    const utils = renderComponent({ onCall });

    await saveLocation(utils);

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('UpdateUserGeographicLocation', {
        geographicLocation: 'Orlando, FL',
      }),
    );
  });

  it('hides the alert when the location is set', () => {
    const { queryByRole } = renderComponent({
      calculations: {
        currentSalaryCap: 75000,
        geographicLocation: 'Orlando, FL',
      },
    });

    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('hides the alert when the location is set to None', () => {
    const { queryByRole } = renderComponent({
      calculations: { currentSalaryCap: 75000, geographicLocation: 'None' },
    });

    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('waits for HCM before showing the alert', () => {
    const { queryByRole } = renderComponent({ hcmLoading: true });

    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('hides the alert when there are no calculations yet', () => {
    const { queryByRole } = renderComponent({ calculations: null });

    expect(queryByRole('alert')).not.toBeInTheDocument();
  });
});
