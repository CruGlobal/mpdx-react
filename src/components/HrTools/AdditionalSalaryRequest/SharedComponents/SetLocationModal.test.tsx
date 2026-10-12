import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import {
  AdditionalSalaryRequestQuery,
  useAdditionalSalaryRequestQuery,
} from '../AdditionalSalaryRequest.generated';
import { UpdateUserGeographicLocationMutation } from '../UpdateUserGeographicLocation.generated';
import { SetLocationModal } from './SetLocationModal';

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

const ActiveRequestQuery: React.FC = () => {
  useAdditionalSalaryRequestQuery();
  return null;
};

interface TestComponentProps {
  handleClose?: jest.Mock;
  onCall?: jest.Mock;
  saveFails?: boolean;
  refetchFails?: boolean;
  constants?: typeof geographicConstants;
}

const renderModal = ({
  handleClose = jest.fn(),
  onCall = jest.fn(),
  saveFails = false,
  refetchFails = false,
  constants = geographicConstants,
}: TestComponentProps = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
          UpdateUserGeographicLocation: UpdateUserGeographicLocationMutation;
          AdditionalSalaryRequest: AdditionalSalaryRequestQuery;
        }>
          mocks={{
            GoalCalculatorConstants: constants,
            ...(refetchFails && {
              AdditionalSalaryRequest: {
                latestAdditionalSalaryRequest: (() => {
                  throw new Error('SAA is unavailable');
                }) as never,
              },
            }),
            ...(saveFails && {
              UpdateUserGeographicLocation: {
                updateUserGeographicLocation: (() => {
                  throw new Error('Not a recognized geographic location');
                }) as never,
              },
            }),
          }}
          onCall={onCall}
        >
          <>
            <ActiveRequestQuery />
            <SetLocationModal handleClose={handleClose} />
          </>
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  );

const chooseLocation = async (
  { findByRole, getByRole }: ReturnType<typeof renderModal>,
  location: string,
) => {
  await waitFor(() => expect(getByRole('combobox')).toBeEnabled());
  userEvent.click(getByRole('combobox'));
  userEvent.click(await findByRole('option', { name: location }));
};

describe('SetLocationModal', () => {
  it('warns that the location can only be set here one time', () => {
    const { getByRole, getByText } = renderModal();

    expect(getByRole('heading', { name: 'Set Your Location' })).toBeVisible();
    expect(getByText('one time').tagName).toBe('STRONG');
    expect(
      getByText(/the only way to change it is to submit a new Salary/),
    ).toBeInTheDocument();
  });

  it('lists the geographic locations, including None', async () => {
    const { findByRole, getByRole } = renderModal();

    await waitFor(() => expect(getByRole('combobox')).toBeEnabled());

    userEvent.click(getByRole('combobox'));

    expect(await findByRole('option', { name: 'None' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Orlando, FL' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'New York, NY' })).toBeInTheDocument();
  });

  it('disables Save until a location is chosen', async () => {
    const utils = renderModal();
    const saveButton = utils.getByRole('button', { name: 'Save' });

    expect(saveButton).toBeDisabled();

    await chooseLocation(utils, 'Orlando, FL');

    expect(saveButton).toBeEnabled();
  });

  it('saves the chosen location, refetches the request, and closes', async () => {
    const handleClose = jest.fn();
    const onCall = jest.fn();
    const utils = renderModal({ handleClose, onCall });

    await chooseLocation(utils, 'New York, NY');
    userEvent.click(utils.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(handleClose).toHaveBeenCalled());
    expect(onCall).toHaveGraphqlOperation('UpdateUserGeographicLocation', {
      geographicLocation: 'New York, NY',
    });
    await waitFor(() =>
      expect(
        onCall.mock.calls.filter(
          ([{ operation }]) =>
            operation.operationName === 'AdditionalSalaryRequest',
        ),
      ).toHaveLength(2),
    );
    expect(await utils.findByText('Saved successfully.')).toBeInTheDocument();
  });

  it('closes even when the refetch fails', async () => {
    const handleClose = jest.fn();
    const utils = renderModal({ handleClose, refetchFails: true });

    await chooseLocation(utils, 'Orlando, FL');
    userEvent.click(utils.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });

  it('stays open when the save fails', async () => {
    const handleClose = jest.fn();
    const onCall = jest.fn();
    const utils = renderModal({
      handleClose,
      onCall,
      saveFails: true,
    });

    await chooseLocation(utils, 'Orlando, FL');
    userEvent.click(utils.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('UpdateUserGeographicLocation'),
    );
    expect(handleClose).not.toHaveBeenCalled();
    expect(utils.queryByText('Saved successfully.')).not.toBeInTheDocument();
    expect(utils.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('closes without saving when Cancel is clicked', () => {
    const handleClose = jest.fn();
    const onCall = jest.fn();
    const { getByRole } = renderModal({ handleClose, onCall });

    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(handleClose).toHaveBeenCalled();
    expect(onCall).not.toHaveGraphqlOperation('UpdateUserGeographicLocation');
  });

  it('blocks saving when the year has no seeded constants', async () => {
    const { findByText, getByRole } = renderModal({
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
    expect(getByRole('combobox')).toBeDisabled();
    expect(getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});
