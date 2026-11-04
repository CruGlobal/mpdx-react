import { InMemoryCache } from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mockInvalidAddressesResponse,
  mpdxSourcedAddress,
  siebelSourcedAddress,
} from './ConfirmAddressesMock';
import { Components, contactId } from './confirmAddressesTestUtils';

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

describe('ConfirmAddresses', () => {
  describe('Editing an address', () => {
    it('should edit Address via EditContactAddressModal', async () => {
      const cache = new InMemoryCache();
      jest.spyOn(cache, 'writeFragment');
      const { queryByTestId, getByText, getByRole, findByRole, findByText } =
        render(
          <Components
            cache={cache}
            mocks={{
              InvalidAddresses: {
                contacts: {
                  nodes: [
                    {
                      id: contactId,
                      name: 'Baggins, Frodo',
                      status: null,
                      addresses: {
                        nodes: [
                          mpdxSourcedAddress,
                          siebelSourcedAddress,
                          {
                            ...siebelSourcedAddress,
                            country: 'Canada',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            }}
          />,
        );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      expect(
        await findByText('100 Lake Hart Drive, Orlando FL 32832'),
      ).toBeInTheDocument();

      userEvent.click(getByText('100 Lake Hart Drive, Orlando FL 32832'));

      expect(await findByText('Edit Address')).toBeInTheDocument();

      const streetInput = getByRole('combobox', { name: 'Street' });
      const cityInput = getByRole('textbox', { name: 'City' });
      const zipInput = getByRole('textbox', { name: 'Zip' });
      const countryInput = getByRole('textbox', { name: 'Country' });

      userEvent.clear(streetInput);
      userEvent.type(streetInput, 'Buckingham Palace');
      userEvent.clear(cityInput);
      userEvent.type(cityInput, 'London');
      userEvent.clear(zipInput);
      userEvent.type(zipInput, 'SW1A 1AA');
      userEvent.clear(countryInput);
      userEvent.type(countryInput, 'United Kingdom');

      userEvent.click(getByRole('combobox', { name: 'Location' }));
      userEvent.click(await findByRole('option', { name: 'Business' }));

      expect(getByRole('button', { name: 'Save' })).not.toBeDisabled();
      userEvent.click(getByRole('button', { name: 'Save' }));

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Address updated successfully',
          {
            variant: 'success',
          },
        ),
      );
    });

    it('should delete address via EditContactAddressModal', async () => {
      const cache = new InMemoryCache();
      jest.spyOn(cache, 'writeFragment');
      const { queryByTestId, getByRole, queryByText, findByText } = render(
        <Components cache={cache} mocks={mockInvalidAddressesResponse} />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      userEvent.click(
        await findByText('100 Lake Hart Drive, Orlando FL 32832'),
      );

      expect(await findByText('Edit Address')).toBeInTheDocument();

      expect(getByRole('button', { name: 'Delete' })).not.toBeDisabled();
      userEvent.click(getByRole('button', { name: 'Delete' }));

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Address deleted successfully',
          {
            variant: 'success',
          },
        ),
      );

      await waitFor(() =>
        expect(
          queryByText('100 Lake Hart Drive, Orlando FL 32832'),
        ).not.toBeInTheDocument(),
      );
    });

    it("should not allow deletion of address when source isn't editable", async () => {
      const cache = new InMemoryCache();
      jest.spyOn(cache, 'writeFragment');
      const {
        findByTestId,
        getByRole,
        queryByTestId,
        queryByRole,
        findByText,
      } = render(
        <Components cache={cache} mocks={mockInvalidAddressesResponse} />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      userEvent.click(await findByTestId(`address-${siebelSourcedAddress.id}`));

      expect(await findByText('Edit Address')).toBeInTheDocument();

      expect(queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();

      const streetInput = getByRole('combobox', { name: 'Street' });
      const cityInput = getByRole('textbox', { name: 'City' });
      const zipInput = getByRole('textbox', { name: 'Zip' });
      const countryInput = getByRole('textbox', { name: 'Country' });
      const locationSelect = getByRole('combobox', { name: 'Location' });

      expect(streetInput).toBeDisabled();
      expect(cityInput).toBeDisabled();
      expect(zipInput).toBeDisabled();
      expect(countryInput).toBeDisabled();

      expect(locationSelect).not.toBeDisabled();
      expect(getByRole('button', { name: 'Save' })).not.toBeDisabled();
    });
  });

  describe('Added an address', () => {
    it('should add address via AddAddressModal and update cache', async () => {
      const {
        getByTestId,
        getByRole,
        findByRole,
        queryByTestId,
        queryByText,
        findByText,
      } = render(
        <Components
          mocks={{
            InvalidAddresses: {
              ...mockInvalidAddressesResponse.InvalidAddresses,
            },
            CreateContactAddress: {
              createAddress: {
                address: {
                  id: '1d4a1aa9-1d42-47ec-a8de-e30e7d8892e5',
                  city: 'London',
                  country: 'United Kingdom',
                  historic: false,
                  location: 'Business',
                  metroArea: '',
                  postalCode: 'SW1A 1AA',
                  primaryMailingAddress: false,
                  region: '',
                  source: 'MPDX',
                  state: '',
                  street: 'Buckingham Palace',
                  createdAt: '2024-06-13T10:09:05-04:00',
                },
              },
            },
          }}
        />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      await waitFor(() =>
        expect(
          queryByText('Buckingham Palace, College Park England SW1A 1AA'),
        ).not.toBeInTheDocument(),
      );

      userEvent.click(getByTestId(`addAddress-${contactId}`));

      expect(
        await findByRole('heading', { name: 'Add Address (MPDX)' }),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(getByRole('button', { name: 'Save' })).toBeDisabled();
      });

      const streetInput = getByRole('combobox', { name: 'Street' });
      const cityInput = getByRole('textbox', { name: 'City' });
      const zipInput = getByRole('textbox', { name: 'Zip' });
      const countryInput = getByRole('textbox', { name: 'Country' });
      const locationSelect = getByRole('combobox', { name: 'Location' });

      userEvent.clear(streetInput);
      userEvent.type(streetInput, 'Buckingham Palace');
      userEvent.clear(cityInput);
      userEvent.type(cityInput, 'London');
      userEvent.clear(zipInput);
      userEvent.type(zipInput, 'SW1A 1AA');
      userEvent.clear(countryInput);
      userEvent.type(countryInput, 'United Kingdom');

      userEvent.click(locationSelect);
      userEvent.click(await findByRole('option', { name: 'Business' }));

      await waitFor(() => {
        expect(getByRole('button', { name: 'Save' })).not.toBeDisabled();
      });

      userEvent.click(getByRole('button', { name: 'Save' }));

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith('Address added successfully', {
          variant: 'success',
        }),
      );

      expect(
        await findByText('Buckingham Palace, London SW1A 1AA'),
      ).toBeInTheDocument();
    }, 30000);
  });
});
