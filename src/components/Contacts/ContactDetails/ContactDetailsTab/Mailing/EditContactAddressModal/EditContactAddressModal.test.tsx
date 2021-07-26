import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
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
import { UpdateContactAddressMutation } from './EditContactAddress.generated';

const handleClose = jest.fn();
const mock = gqlMock<ContactMailingFragment>(ContactMailingFragmentDoc);
const accountListId = 'abc';

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

const mockContact: ContactMailingFragment = {
  name: mock.name,
  addresses: {
    nodes: [
      {
        ...mock.addresses.nodes[0],
        location: 'Home',
        historic: true,
        street: '123 Cool Street',
      },
    ],
  },
};

describe('EditContactAddressModal', () => {
  it('should render edit contact address modal', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactAddressMutation>>
            <EditContactAddressModal
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
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactAddressMutation>>
            <EditContactAddressModal
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Address')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactAddressMutation>>
            <EditContactAddressModal
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
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactAddressMutation> onCall={mutationSpy}>
            <EditContactAddressModal
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.clear(getByRole('textbox', { name: 'Street' }));
    userEvent.clear(getByRole('textbox', { name: 'City' }));
    userEvent.clear(getByRole('textbox', { name: 'State' }));
    userEvent.clear(getByRole('textbox', { name: 'Zip' }));
    userEvent.clear(getByRole('textbox', { name: 'Country' }));
    userEvent.clear(getByRole('textbox', { name: 'Region' }));
    userEvent.clear(getByRole('textbox', { name: 'Metro' }));
    userEvent.click(getByRole('button', { name: 'Location' }));
    userEvent.click(getByRole('option', { name: 'Mailing' }));
    userEvent.type(getByRole('textbox', { name: 'Street' }), newStreet);
    userEvent.type(getByRole('textbox', { name: 'City' }), newCity);
    userEvent.type(getByRole('textbox', { name: 'State' }), newState);
    userEvent.type(getByRole('textbox', { name: 'Zip' }), newPostalCode);
    userEvent.type(getByRole('textbox', { name: 'Country' }), newCountry);
    userEvent.type(getByRole('textbox', { name: 'Region' }), newRegion);
    userEvent.type(getByRole('textbox', { name: 'Metro' }), newMetroArea);
    userEvent.click(getByRole('checkbox', { name: 'Address no longer valid' }));
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
  });

  it('should handle errors with editing contact other details', async () => {
    const newStreet = '4321 New Street';
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactAddressMutation>
            mocks={{
              UpdateContactAddress: {
                updateAddress: {
                  address: new GraphQLError(
                    'GraphQL Error #42: Error updating contact.',
                  ),
                },
              },
            }}
          >
            <EditContactAddressModal
              accountListId={accountListId}
              handleClose={handleClose}
              address={mockContact.addresses.nodes[0]}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.clear(getByRole('textbox', { name: 'Street' }));
    userEvent.type(getByRole('textbox', { name: 'Street' }), newStreet);
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'GraphQL Error #42: Error updating contact.',
        {
          variant: 'error',
        },
      ),
    );
  });
});
