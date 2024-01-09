import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { placePromise, setupMocks } from '__tests__/util/googlePlacesMock';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import { AddAddressModal } from './AddAddressModal';

const handleClose = jest.fn();
const accountListId = 'abc';
const contactId = '123';

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

jest.mock('@react-google-maps/api');

describe('AddAddressModal', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('should render edit contact address modal', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Add Address')).toBeInTheDocument();
  });

  it('should close edit contact other modal', () => {
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Add Address')).toBeInTheDocument();
    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Add Address')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should create contact address', async () => {
    const mutationSpy = jest.fn();
    const newStreet = '4321 Neat Street';
    const newCity = 'Orlando';
    const newState = 'FL';
    const newPostalCode = '55555';
    const newCountry = 'United States';
    const newRegion = 'New Region';
    const newMetroArea = 'New Metro';
    const { getByRole, getByText, getByLabelText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider onCall={mutationSpy}>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.clear(getByRole('combobox', { name: 'Street' }));
    userEvent.clear(getByLabelText('City'));
    userEvent.clear(getByLabelText('State'));
    userEvent.clear(getByLabelText('Zip'));
    userEvent.clear(getByLabelText('Country'));
    userEvent.clear(getByLabelText('Region'));
    userEvent.clear(getByLabelText('Metro'));
    userEvent.click(getByLabelText('Location'));
    userEvent.click(getByLabelText('Mailing'));
    userEvent.type(getByRole('combobox', { name: 'Street' }), newStreet);
    userEvent.type(getByLabelText('City'), newCity);
    userEvent.type(getByLabelText('State'), newState);
    userEvent.type(getByLabelText('Zip'), newPostalCode);
    userEvent.type(getByLabelText('Country'), newCountry);
    userEvent.type(getByLabelText('Region'), newRegion);
    userEvent.type(getByLabelText('Metro'), newMetroArea);
    userEvent.click(getByLabelText('Address no longer valid'));
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Address added successfully', {
        variant: 'success',
      }),
    );

    const { operation } = mutationSpy.mock.calls[0][0];

    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.street).toEqual(newStreet);
    expect(operation.variables.attributes.location).toEqual('Mailing');
    expect(operation.variables.attributes.city).toEqual(newCity);
    expect(operation.variables.attributes.state).toEqual(newState);
    expect(operation.variables.attributes.postalCode).toEqual(newPostalCode);
    expect(operation.variables.attributes.country).toEqual(newCountry);
    expect(operation.variables.attributes.region).toEqual(newRegion);
    expect(operation.variables.attributes.metroArea).toEqual(newMetroArea);
    expect(operation.variables.attributes.historic).toEqual(true);
  }, 10000);

  it('handles chosen address predictions', async () => {
    jest.useFakeTimers();

    const { getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    // Let Google Maps initialize
    jest.runOnlyPendingTimers();

    const addressAutocomplete = getByRole('combobox', { name: 'Street' });
    userEvent.type(addressAutocomplete, '100 Lake Hart');

    jest.advanceTimersByTime(2000);
    await act(async () => {
      await placePromise;
    });

    userEvent.click(
      getByRole('option', { name: '100 Lake Hart Dr, Orlando, FL 32832, USA' }),
    );
    expect(addressAutocomplete).toHaveValue('A/100 Lake Hart Drive');
    expect(getByRole('textbox', { name: 'City' })).toHaveValue('Orlando');
    expect(getByRole('textbox', { name: 'State' })).toHaveValue('FL');
    expect(getByRole('textbox', { name: 'Zip' })).toHaveValue('32832');
    expect(getByRole('textbox', { name: 'Country' })).toHaveValue(
      'United States',
    );
    expect(getByRole('textbox', { name: 'Region' })).toHaveValue(
      'Orange County',
    );
    expect(getByRole('textbox', { name: 'Metro' })).toHaveValue('Orlando');
  }, 20000);

  it('should set new address as primary', async () => {
    const mutationSpy = jest.fn();
    const newStreet = '4321 Neat Street';
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider onCall={mutationSpy}>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    const street = getByRole('combobox', { name: 'Street' });
    userEvent.clear(street);
    userEvent.type(street, newStreet);
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Address added successfully', {
        variant: 'success',
      }),
    );

    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.street).toEqual(newStreet);

    const { operation: operation2 } = mutationSpy.mock.calls[1][0];
    expect(operation2.variables.primaryAddressId).not.toBeNull();
  }, 30000);

  it('should not set new address as primary if it is unchecked', async () => {
    const mutationSpy = jest.fn();
    const newStreet = '4321 Neat Street';
    const { getByText, getByLabelText, getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider onCall={mutationSpy}>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.type(getByRole('combobox', { name: 'Street' }), newStreet);
    userEvent.click(getByLabelText('Primary'));
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Address added successfully', {
        variant: 'success',
      }),
    );

    expect(mutationSpy).toHaveBeenCalledTimes(1);
  }, 30000);
});
