import { InMemoryCache } from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockInvalidAddressesResponse } from './ConfirmAddressesMock';
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

    // The second address can be made primary; Siebel addresses cannot
    const [contact] =
      mockInvalidAddressesResponse.InvalidAddresses.contacts.nodes;

    const switchableMocks = {
      InvalidAddresses: {
        contacts: {
          nodes: [
            {
              ...contact,
              addresses: {
                nodes: contact.addresses.nodes.map((address, index) =>
                  index === 1 ? { ...address, source: 'TntImport' } : address,
                ),
              },
            },
          ],
        },
      },
    };

    it('reloads the change log when a new primary saves but a later address fails', async () => {
      const cache = new InMemoryCache();
      const evict = jest.spyOn(cache, 'evict');
      const mutationSpy = jest.fn();
      let saves = 0;
      const { getAllByRole, findAllByTestId, queryByTestId } = render(
        <Components
          cache={cache}
          onCall={mutationSpy}
          mocks={{
            ...switchableMocks,
            // The second address saved is the new primary; the third fails
            UpdateContactAddress: () => {
              if (saves++ > 1) {
                throw new Error('Server Error');
              }
              return {};
            },
          }}
        />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      userEvent.click((await findAllByTestId('contactStarIcon'))[0]);
      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Error updating contact ${name}`,
          expect.anything(),
        ),
      );
      expect(evict).toHaveBeenCalledWith({ fieldName: 'addressChangeHistory' });
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation(
          'ContactPrimaryAddressChange',
          { contactId: 'contactId' },
        ),
      );
    });

    it('reloads the contact when the old primary was demoted but the new one failed', async () => {
      const mutationSpy = jest.fn();
      let saves = 0;
      const { getAllByRole, findAllByTestId, queryByTestId } = render(
        <Components
          onCall={mutationSpy}
          mocks={{
            ...switchableMocks,
            // The first save demotes the old primary; the second, the new primary, fails
            UpdateContactAddress: () => {
              if (saves++ === 1) {
                throw new Error('Server Error');
              }
              return {};
            },
          }}
        />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      userEvent.click((await findAllByTestId('contactStarIcon'))[0]);
      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation(
          'ContactPrimaryAddressChange',
          { contactId: 'contactId' },
        ),
      );
    });

    it('skips reloading the contact when no save went through', async () => {
      const mutationSpy = jest.fn();
      const { getAllByRole, queryByTestId } = render(
        <Components
          onCall={mutationSpy}
          mocks={{
            ...mockInvalidAddressesResponse,
            UpdateContactAddress: () => {
              throw new Error('Server Error');
            },
          }}
        />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Error updating contact ${name}`,
          expect.anything(),
        ),
      );
      expect(mutationSpy).not.toHaveGraphqlOperation(
        'ContactPrimaryAddressChange',
      );
    });

    it('drops the change history when a new primary is confirmed', async () => {
      const cache = new InMemoryCache();
      const evict = jest.spyOn(cache, 'evict');
      const { getAllByRole, findAllByTestId, queryByTestId } = render(
        <Components cache={cache} mocks={switchableMocks} />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      userEvent.click((await findAllByTestId('contactStarIcon'))[0]);
      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() =>
        expect(evict).toHaveBeenCalledWith({
          fieldName: 'addressChangeHistory',
        }),
      );
    });

    it('drops the change history whenever a primary is saved, since cached flags can be stale', async () => {
      const cache = new InMemoryCache();
      const evict = jest.spyOn(cache, 'evict');
      const { getAllByRole, queryByTestId } = render(
        <Components cache={cache} mocks={mockInvalidAddressesResponse} />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Updated contact ${name}`,
          expect.anything(),
        ),
      );
      expect(evict).toHaveBeenCalledWith({
        fieldName: 'addressChangeHistory',
      });
    });
  });
});
