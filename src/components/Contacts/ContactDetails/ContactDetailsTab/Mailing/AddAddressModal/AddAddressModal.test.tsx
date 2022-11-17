import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import { AddAddressModal } from './AddAddressModal';
import { CreateContactAddressMutation } from './CreateContactAddress.generated';

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

describe('AddAddressModal', () => {
  it('should render edit contact address modal', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<CreateContactAddressMutation>>
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
          <GqlMockedProvider<CreateContactAddressMutation>>
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
          <GqlMockedProvider<CreateContactAddressMutation>>
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
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<CreateContactAddressMutation> onCall={mutationSpy}>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.clear(getByLabelText('Street'));
    userEvent.clear(getByLabelText('City'));
    userEvent.clear(getByLabelText('State'));
    userEvent.clear(getByLabelText('Zip'));
    userEvent.clear(getByLabelText('Country'));
    userEvent.clear(getByLabelText('Region'));
    userEvent.clear(getByLabelText('Metro'));
    userEvent.click(getByLabelText('Location'));
    userEvent.click(getByLabelText('Mailing'));
    userEvent.type(getByLabelText('Street'), newStreet);
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
  });

  it('should set new address as primary', async () => {
    const mutationSpy = jest.fn();
    const newStreet = '4321 Neat Street';
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<CreateContactAddressMutation> onCall={mutationSpy}>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.clear(getByLabelText('Street'));
    userEvent.type(getByLabelText('Street'), newStreet);
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
    console.log(operation2);
    expect(operation2.variables.primaryAddressId).not.toBeNull();
  });

  it('should not set new address as primary if it is unchecked', async () => {
    const mutationSpy = jest.fn();
    const newStreet = '4321 Neat Street';
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<CreateContactAddressMutation> onCall={mutationSpy}>
            <AddAddressModal
              accountListId={accountListId}
              contactId={contactId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.clear(getByLabelText('Street'));
    userEvent.type(getByLabelText('Street'), newStreet);
    userEvent.click(getByLabelText('Primary'));
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Address added successfully', {
        variant: 'success',
      }),
    );

    expect(mutationSpy).toHaveBeenCalledTimes(1);
  });
});
