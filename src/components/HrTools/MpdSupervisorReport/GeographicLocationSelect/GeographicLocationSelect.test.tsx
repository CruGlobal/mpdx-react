import React from 'react';
import { InMemoryCache, gql } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import { createCache } from 'src/lib/apollo/cache';
import theme from 'src/theme';
import { GeographicLocationSelect } from './GeographicLocationSelect';
import { UpdateStaffGeographicLocationMutation } from './UpdateStaffGeographicLocation.generated';

const personNumber = '10000001';
const firstName = 'John';

const geographicConstants = {
  constant: {
    mpdGoalBenefitsConstants: [{ id: 'benefits-1' }],
    mpdGoalGeographicConstants: [
      { location: 'None', percentageMultiplier: 0 },
      { location: 'Orlando, FL', percentageMultiplier: 0.06 },
      { location: 'New York, NY', percentageMultiplier: 0.12 },
    ],
    mpdGoalMiscConstants: [],
  },
};

const managedStaffFragment = gql`
  fragment TestManagedStaff on MpdManagedStaff {
    personNumber
    geographicLocation
    newStaffMonthlySalary
  }
`;

interface TestComponentProps {
  geographicLocation?: string | null;
  onSaved?: jest.Mock;
  onCall?: jest.Mock;
  cache?: InMemoryCache;
  constants?: typeof geographicConstants;
}

const renderSelect = ({
  geographicLocation = 'Orlando, FL',
  onSaved = jest.fn(),
  onCall,
  cache,
  constants = geographicConstants,
}: TestComponentProps = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
          UpdateStaffGeographicLocation: UpdateStaffGeographicLocationMutation;
        }>
          cache={cache}
          mocks={{
            GoalCalculatorConstants: constants,
            UpdateStaffGeographicLocation: {
              updateManagedStaffGeographicLocation: {
                geographicLocation: 'New York, NY',
                newStaffMonthlySalary: 3000,
              },
            },
          }}
          onCall={onCall}
        >
          <GeographicLocationSelect
            firstName={firstName}
            personNumber={personNumber}
            geographicLocation={geographicLocation}
            onSaved={onSaved}
          />
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

describe('GeographicLocationSelect', () => {
  it('labels each location with its multiplier', async () => {
    const { findByRole, getByRole } = renderSelect();
    const input = await findByRole('combobox', { name: 'Geographic Location' });
    await waitFor(() => expect(input).not.toBeDisabled());

    userEvent.click(getByRole('button', { name: 'Open' }));

    expect(
      await findByRole('option', { name: 'Orlando, FL (6%)' }),
    ).toBeInTheDocument();
    expect(
      getByRole('option', { name: 'New York, NY (12%)' }),
    ).toBeInTheDocument();
    expect(getByRole('option', { name: 'None' })).toBeInTheDocument();
  });

  it('enables Save once a different location is chosen', async () => {
    const { findByRole, getByRole } = renderSelect();
    const input = await findByRole('combobox', { name: 'Geographic Location' });
    await waitFor(() => expect(input).not.toBeDisabled());
    expect(getByRole('button', { name: 'Save' })).toBeDisabled();

    userEvent.type(input, 'New York');
    userEvent.click(await findByRole('option', { name: 'New York, NY (12%)' }));

    expect(getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('saves the chosen location for the person number', async () => {
    const mutationSpy = jest.fn();
    const { findByRole, getByRole } = renderSelect({ onCall: mutationSpy });
    const input = await findByRole('combobox', { name: 'Geographic Location' });
    await waitFor(() => expect(input).not.toBeDisabled());

    userEvent.type(input, 'New York');
    userEvent.click(await findByRole('option', { name: 'New York, NY (12%)' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateStaffGeographicLocation',
        {
          input: {
            personNumber: '10000001',
            geographicLocation: 'New York, NY',
          },
        },
      ),
    );
  });

  it('reports the recalculated salary and confirms the save', async () => {
    const onSaved = jest.fn();
    const { findByRole, findByText, getByRole } = renderSelect({ onSaved });
    const input = await findByRole('combobox', { name: 'Geographic Location' });
    await waitFor(() => expect(input).not.toBeDisabled());

    userEvent.type(input, 'New York');
    userEvent.click(await findByRole('option', { name: 'New York, NY (12%)' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith('New York, NY', 3000),
    );
    expect(await findByText('Saved successfully')).toBeInTheDocument();
  });

  it('shows a spinner on the save button while saving', async () => {
    const { findByRole, getByRole } = renderSelect();
    const input = await findByRole('combobox', { name: 'Geographic Location' });
    await waitFor(() => expect(input).not.toBeDisabled());

    userEvent.type(input, 'New York');
    userEvent.click(await findByRole('option', { name: 'New York, NY (12%)' }));

    const saveButton = getByRole('button', { name: 'Save' });
    userEvent.click(saveButton);

    await waitFor(() =>
      expect(saveButton).toHaveAttribute('aria-busy', 'true'),
    );
    expect(saveButton).toHaveTextContent('Saving...');
    expect(within(saveButton).getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() =>
      expect(saveButton).not.toHaveAttribute('aria-busy', 'true'),
    );
  });

  it('patches the cached staff member with the saved values', async () => {
    const cache = createCache();
    const managedStaffFragmentQuery = {
      id: cache.identify({ __typename: 'MpdManagedStaff', personNumber }),
      fragment: managedStaffFragment,
    };
    cache.writeFragment({
      ...managedStaffFragmentQuery,
      data: {
        __typename: 'MpdManagedStaff',
        personNumber,
        geographicLocation: 'Orlando, FL',
        newStaffMonthlySalary: 2500,
      },
    });

    const { findByRole, getByRole } = renderSelect({ cache });
    const input = await findByRole('combobox', { name: 'Geographic Location' });
    await waitFor(() => expect(input).not.toBeDisabled());

    userEvent.type(input, 'New York');
    userEvent.click(await findByRole('option', { name: 'New York, NY (12%)' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(cache.readFragment(managedStaffFragmentQuery)).toMatchObject({
        geographicLocation: 'New York, NY',
        newStaffMonthlySalary: 3000,
      }),
    );
  });

  it('blocks editing when the year has no seeded constants', async () => {
    const { findByRole, findByText, getByRole } = renderSelect({
      constants: {
        constant: {
          ...geographicConstants.constant,
          mpdGoalBenefitsConstants: [],
        },
      },
    });

    expect(
      await findByText(/Geographic locations are not available for this year/),
    ).toBeInTheDocument();
    expect(
      await findByRole('combobox', { name: 'Geographic Location' }),
    ).toBeDisabled();
    expect(getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('warns by name when the employee has no location set', async () => {
    const { findByText } = renderSelect({ geographicLocation: null });
    expect(
      await findByText(/No geographic location is set for John/),
    ).toBeInTheDocument();
  });

  it('asks for a city by name when the location is None', async () => {
    const { findByText } = renderSelect({ geographicLocation: 'None' });
    expect(
      await findByText(/Please select a city if John lives near one/),
    ).toBeInTheDocument();
  });

  it('shows no alert when a city is set', async () => {
    const { findByRole, queryByRole } = renderSelect();
    await findByRole('combobox', { name: 'Geographic Location' });
    expect(queryByRole('alert')).not.toBeInTheDocument();
  });
});
