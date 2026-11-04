import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mockInvalidAddressesResponse,
  mpdxSourcedAddress,
  siebelSourcedAddress,
} from './ConfirmAddressesMock';
import {
  Components,
  accountListId,
  contactId,
} from './confirmAddressesTestUtils';

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
      `/accountLists/${accountListId}/tools/mailingAddresses/${contactId}`,
    );
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
