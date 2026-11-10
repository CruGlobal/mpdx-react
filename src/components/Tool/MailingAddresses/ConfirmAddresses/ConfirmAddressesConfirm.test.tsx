import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mockInvalidAddressesResponse,
  mpdxSourcedAddress,
  siebelSourcedAddress,
} from './ConfirmAddressesMock';
import { Components } from './confirmAddressesTestUtils';

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

    it('should disable the button while confirming', async () => {
      const mutationSpy = jest.fn();
      const { getAllByRole, findByRole, queryByTestId } = render(
        <Components
          mocks={{
            InvalidAddresses: {
              ...mockInvalidAddressesResponse.InvalidAddresses,
            },
          }}
          onCall={mutationSpy}
        />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);

      const confirmingButton = await findByRole('button', {
        name: 'Confirming...',
      });
      expect(confirmingButton).toBeDisabled();
      fireEvent.click(confirmingButton);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(`Updated contact ${name}`, {
          variant: 'success',
        });
      });
      expect(
        mutationSpy.mock.calls.filter(
          ([{ operation }]) =>
            operation.operationName === 'UpdateContactAddress',
        ),
      ).toHaveLength(3);
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
});
