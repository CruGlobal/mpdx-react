import { ApolloCache, InMemoryCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { CreateContactAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/AddAddressModal/CreateContactAddress.generated';
import { AppSettingsProvider } from 'src/components/common/AppSettings/AppSettingsProvider';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import FixMailingAddresses from './FixMailingAddresses';
import {
  mockInvalidAddressesResponse,
  mpdxSourcedAddress,
  siebelSourcedAddress,
} from './FixMailingAddressesMock';
import { InvalidAddressesQuery } from './GetInvalidAddresses.generated';

jest.mock('next-auth/react');
const accountListId = 'account-list-1';
const contactId = 'contactId';
const router = {
  pathname:
    '/accountLists/[accountListId]/tools/fix/mailingAddresses/[[...contactId]]',
  query: { accountListId },
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

const Components = ({
  mocks,
  cache,
}: {
  mocks: ApolloErgonoMockMap;
  cache?: ApolloCache<object>;
}) => (
  <AppSettingsProvider>
    <SnackbarProvider>
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{
            InvalidAddresses: InvalidAddressesQuery;
            CreateContactAddress: CreateContactAddressMutation;
          }>
            mocks={mocks}
            cache={cache}
          >
            <ContactPanelProvider>
              <FixMailingAddresses accountListId={accountListId} />
            </ContactPanelProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>
    </SnackbarProvider>
  </AppSettingsProvider>
);

describe('FixMailingAddresses', () => {
  it('should show noData component', async () => {
    const { queryByTestId, getByText } = render(
      <Components
        mocks={{
          InvalidAddresses: {
            contacts: {
              nodes: [],
            },
          },
        }}
      />,
    );
    await waitFor(() =>
      expect(queryByTestId('loading')).not.toBeInTheDocument(),
    );
    expect(
      getByText('No contacts with mailing addresses need attention'),
    ).toBeInTheDocument();
  });

  it('should not show noData', async () => {
    const { queryByTestId, queryByText } = render(
      <Components
        mocks={{
          InvalidAddresses: {
            contacts: {
              nodes: [siebelSourcedAddress],
            },
          },
        }}
      />,
    );
    await waitFor(() =>
      expect(queryByTestId('loading')).not.toBeInTheDocument(),
    );
    expect(
      queryByText('No contacts with mailing addresses need attention'),
    ).not.toBeInTheDocument();
  });

  it('should count total contacts and startDate', async () => {
    const { queryByTestId, getByText, findByText } = render(
      <Components
        mocks={{
          InvalidAddresses: {
            contacts: {
              nodes: [
                {
                  addresses: {
                    nodes: [siebelSourcedAddress],
                  },
                },
                {},
                {},
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
      getByText('You have 3 mailing addresses to confirm.'),
    ).toBeInTheDocument();
    expect(await findByText(/12\/10\/2022/i)).toBeInTheDocument();
  });

  it('should show createdAt date when startDate is null', async () => {
    const { queryByTestId, findByText } = render(
      <Components
        mocks={{
          InvalidAddresses: {
            contacts: {
              nodes: [
                {
                  addresses: {
                    nodes: [mpdxSourcedAddress],
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
    expect(await findByText(/6\/12\/2024/i)).toBeInTheDocument();
  });

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
    }, 10000);
  });

  describe('Set primary mailing address', () => {
    it('should set the address as primary', async () => {
      const {
        findAllByTestId,
        getAllByTestId,
        queryByTestId,
        queryAllByTestId,
      } = render(
        <Components
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
                        {
                          ...mpdxSourcedAddress,
                          id: 'test1',
                          primaryMailingAddress: true,
                        },
                        {
                          ...siebelSourcedAddress,
                          id: 'test2',
                          source: 'TntImport',
                          primaryMailingAddress: false,
                        },
                        {
                          ...siebelSourcedAddress,
                          id: 'test3',
                          country: 'Canada',
                          source: 'TntImport',
                          primaryMailingAddress: false,
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

      const addresses = await findAllByTestId('address');

      expect(addresses.length).toBe(3);

      const primaryAddress = within(addresses[0]).getByTestId(
        'primaryContactStarIcon',
      );
      expect(primaryAddress).toBeInTheDocument();

      const secondaryAddresses = getAllByTestId('contactStarIcon');

      expect(secondaryAddresses.length).toBe(2);
      expect(queryAllByTestId('settingPrimaryAddress').length).toBe(0);

      userEvent.click(secondaryAddresses[1]);

      const newPrimaryAddress = within(addresses[2]).getByTestId(
        'primaryContactStarIcon',
      );

      expect(newPrimaryAddress).toBeInTheDocument();
      expect(newPrimaryAddress).not.toBe(primaryAddress);
      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });

  it('should render link with correct href', async () => {
    const { findByRole } = render(
      <Components
        mocks={{
          InvalidAddresses: {
            ...mockInvalidAddressesResponse.InvalidAddresses,
          },
        }}
      />,
    );

    const contactName = await findByRole('link', { name: 'Baggins, Frodo' });
    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/fix/mailingAddresses/${contactId}`,
    );
  });

  describe('handleSingleConfirm()', () => {
    const name = 'Baggins, Frodo';
    it('should handle error', async () => {
      const {
        getAllByRole,
        getByText,
        queryByTestId,
        findAllByTestId,
        findByText,
      } = render(
        <Components
          mocks={{
            InvalidAddresses: {
              ...mockInvalidAddressesResponse.InvalidAddresses,
            },
            UpdateContactAddress: () => {
              throw new Error('Server Error');
            },
          }}
        />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      expect(await findAllByTestId('address')).toHaveLength(3);

      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);

      expect(await findByText(name)).toBeInTheDocument();

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Error updating contact ${name}`,
          {
            variant: 'error',
            autoHideDuration: 7000,
          },
        );
      });
      expect(getByText(name)).toBeInTheDocument();
    });

    it('should handle success and remove contact', async () => {
      const {
        getAllByRole,
        findAllByTestId,
        queryByTestId,
        queryByText,
        findByText,
      } = render(
        <Components
          mocks={{
            InvalidAddresses: {
              ...mockInvalidAddressesResponse.InvalidAddresses,
            },
          }}
        />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      expect(await findAllByTestId('address')).toHaveLength(3);

      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);

      expect(await findByText(name)).toBeInTheDocument();

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(`Updated contact ${name}`, {
          variant: 'success',
        });
      });

      await waitFor(() => expect(queryByText(name)).not.toBeInTheDocument());
    });
  });

  describe('handleBulkConfirm()', () => {
    const name1 = 'Baggins, Frodo';
    const name2 = 'Gamgee, Samwise';

    it('should handle Error', async () => {
      const { getByRole, getByText, queryByTestId, findByRole } = render(
        <Components
          mocks={{
            InvalidAddresses: {
              contacts: {
                nodes: [
                  {
                    id: 'contactId',
                    name: name1,
                    status: null,
                    addresses: {
                      nodes: [mpdxSourcedAddress, siebelSourcedAddress],
                    },
                  },
                  {
                    id: 'contactId2',
                    name: name2,
                    status: null,
                    addresses: {
                      nodes: [mpdxSourcedAddress, siebelSourcedAddress],
                    },
                  },
                ],
              },
            },
            UpdateContactAddress: () => {
              throw new Error('Server Error');
            },
          }}
        />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      expect(getByText(name1)).toBeInTheDocument();
      expect(getByText(name2)).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Confirm 2 as MPDX' }));

      expect(
        await findByRole('heading', { name: 'Confirm' }),
      ).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Error updating contact ${name1}`,
          {
            variant: 'error',
            autoHideDuration: 7000,
          },
        );
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Error updating contact ${name2}`,
          {
            variant: 'error',
            autoHideDuration: 7000,
          },
        );
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Error when updating 2 contact(s)`,
          {
            variant: 'error',
          },
        );

        expect(getByText(name1)).toBeInTheDocument();
        expect(getByText(name2)).toBeInTheDocument();
      });
    });

    it('should handle success and remove contacts', async () => {
      const { getByRole, queryByTestId, queryByText, findByRole } = render(
        <Components
          mocks={{
            InvalidAddresses: {
              contacts: {
                nodes: [
                  {
                    id: 'contactId',
                    name: name1,
                    status: null,
                    addresses: {
                      nodes: [mpdxSourcedAddress, siebelSourcedAddress],
                    },
                  },
                  {
                    id: 'contactId2',
                    name: name2,
                    status: null,
                    addresses: {
                      nodes: [mpdxSourcedAddress, siebelSourcedAddress],
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
      userEvent.click(getByRole('button', { name: 'Confirm 2 as MPDX' }));

      expect(
        await findByRole('heading', { name: 'Confirm' }),
      ).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(`Updated contact ${name1}`, {
          variant: 'success',
        });
        expect(mockEnqueue).toHaveBeenCalledWith(`Updated contact ${name2}`, {
          variant: 'success',
        });

        expect(queryByText(name1)).not.toBeInTheDocument();
        expect(queryByText(name2)).not.toBeInTheDocument();
      });
    });
  });

  it('should not fire handleSingleConfirm', async () => {
    const { getByRole, queryByTestId, queryByText, findByRole } = render(
      <Components
        mocks={{
          InvalidAddresses: {
            ...mockInvalidAddressesResponse.InvalidAddresses,
          },
        }}
      />,
    );
    await waitFor(() =>
      expect(queryByTestId('loading')).not.toBeInTheDocument(),
    );
    const name = 'Baggins, Frodo';
    userEvent.click(getByRole('combobox'));
    userEvent.click(getByRole('option', { name: 'US Donation Services' }));

    userEvent.click(
      getByRole('button', { name: 'Confirm 1 as US Donation Services' }),
    );

    expect(
      await findByRole('heading', { name: 'Confirm' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'No' }));

    await waitFor(() => {
      expect(mockEnqueue).not.toHaveBeenCalled();
      expect(queryByText(name)).toBeInTheDocument();
    });
  });
});
