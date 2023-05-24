import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { placePromise, setupMocks } from '__tests__/util/googlePlacesMock';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import {
  ContactMailingFragment,
  ContactMailingFragmentDoc,
} from '../ContactMailing.generated';
import { EditContactAddressModal } from './EditContactAddressModal';

const handleClose = jest.fn();
const mock = gqlMock<ContactMailingFragment>(ContactMailingFragmentDoc);
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

const mockContact: ContactMailingFragment = {
  id: '123',
  name: mock.name,
  addresses: {
    nodes: [
      {
        ...mock.addresses.nodes[0],
        location: 'Home',
        historic: true,
        street: '123 Cool Street',
        primaryMailingAddress: false,
      },
    ],
  },
};

describe('EditContactAddressModal', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('should render edit contact address modal', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <EditContactAddressModal
              contactId={contactId}
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Address')).toBeInTheDocument();
  });

  it('should close edit contact other modal', () => {
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <EditContactAddressModal
              contactId={contactId}
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Address')).toBeInTheDocument();
    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <EditContactAddressModal
              contactId={contactId}
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Address')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should edit contact address', async () => {
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
            <EditContactAddressModal
              contactId={contactId}
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
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
    userEvent.click(getByLabelText('Primary'));
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
      expect(mockEnqueue).toHaveBeenCalledWith('Address updated successfully', {
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
    expect(operation.variables.attributes.historic).toEqual(false);

    const { operation: operation2 } = mutationSpy.mock.calls[1][0];
    expect(operation2.variables.primaryAddressId).toEqual(
      mockContact.addresses.nodes[0].id,
    );
  }, 80000);

  it('handles chosen address predictions', async () => {
    jest.useFakeTimers();

    const { getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <EditContactAddressModal
              contactId={contactId}
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    // Let Google Maps initialize
    jest.runOnlyPendingTimers();

    const addressAutocomplete = getByRole('combobox', { name: 'Street' });
    userEvent.clear(addressAutocomplete);
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

  it('should edit not set primary address when it has not changed', async () => {
    const mutationSpy = jest.fn();
    const newStreet = '4321 Neat Street';
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider onCall={mutationSpy}>
            <EditContactAddressModal
              contactId={contactId}
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
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
      expect(mockEnqueue).toHaveBeenCalledWith('Address updated successfully', {
        variant: 'success',
      }),
    );

    expect(mutationSpy).toHaveBeenCalledTimes(1);
  }, 30000);

  it('should handle delete click', async () => {
    const { getByText, getByTestId } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <EditContactAddressModal
              contactId={contactId}
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Address')).toBeInTheDocument();
    expect(getByTestId('modal-delete-button')).toBeInTheDocument();
    userEvent.click(getByTestId('modal-delete-button'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Address deleted successfully', {
        variant: 'success',
      }),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('should restrict editing of Siebel addresses', async () => {
    const { getByRole, getByText, findByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <EditContactAddressModal
              contactId={contactId}
              accountListId={accountListId}
              handleClose={handleClose}
              address={{ ...mockContact.addresses.nodes[0], source: 'Siebel' }}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(
      getByText('This address is provided by Donation Services'),
    ).toBeInTheDocument();
    expect(getByRole('combobox', { name: 'Street' })).toBeDisabled();
    expect(getByRole('button', { name: 'Location Home' })).not.toBeDisabled();
    expect(getByRole('textbox', { name: 'City' })).toBeDisabled();
    expect(getByRole('textbox', { name: 'State' })).toBeDisabled();
    expect(getByRole('textbox', { name: 'Zip' })).toBeDisabled();
    expect(getByRole('textbox', { name: 'Country' })).toBeDisabled();
    expect(getByRole('textbox', { name: 'Region' })).toBeDisabled();
    expect(getByRole('textbox', { name: 'Metro' })).toBeDisabled();
    expect(getByRole('checkbox', { name: 'Primary' })).not.toBeDisabled();
    expect(
      getByRole('checkbox', { name: 'Address no longer valid' }),
    ).not.toBeDisabled();
    expect(
      await findByRole('link', { name: 'Email Donation Services here' }),
    ).toBeInTheDocument();
  });
});
