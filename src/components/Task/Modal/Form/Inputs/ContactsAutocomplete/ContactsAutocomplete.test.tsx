import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsAutocomplete } from './ContactsAutocomplete';
import { ContactOptionsQuery } from './ContactsAutocomplete.generated';

const accountListId = 'account-list-1';

const mutationSpy = jest.fn();
const onChange = jest.fn();

interface TestComponentProps {
  value?: string[];
}

const TestComponent: React.FC<TestComponentProps> = ({ value = [] }) => (
  <GqlMockedProvider<{
    ContactOptions: ContactOptionsQuery;
  }>
    mocks={{
      ContactOptions: {
        contacts: {
          nodes: [
            { id: 'contact-1', name: 'Alice' },
            { id: 'contact-2', name: 'Bob' },
            { id: 'contact-3', name: 'Charlie' },
          ],
        },
      },
    }}
    onCall={mutationSpy}
  >
    <ContactsAutocomplete
      accountListId={accountListId}
      value={value}
      onChange={onChange}
    />
  </GqlMockedProvider>
);

describe('ContactsAutocomplete', () => {
  it('loads several options initially', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('combobox', { name: 'Contacts' }));
    expect(await findByRole('option', { name: 'Alice' })).toBeInTheDocument();

    expect(mutationSpy).toHaveBeenCalledTimes(1);
    expect(mutationSpy.mock.calls[0][0].operation).toMatchObject({
      operationName: 'ContactOptions',
      variables: {
        accountListId,
        first: 10,
        contactsFilters: { wildcardSearch: '' },
      },
    });
  });

  it('loads initially selected contacts and deduplicates', async () => {
    const { getAllByRole, getByRole } = render(
      <TestComponent value={['contact-1', 'contact-2']} />,
    );

    await waitFor(() => expect(mutationSpy).toHaveBeenCalledTimes(2));
    expect(mutationSpy.mock.calls[0][0].operation).toMatchObject({
      operationName: 'ContactOptions',
      variables: {
        accountListId,
        first: 10,
        contactsFilters: { wildcardSearch: '' },
      },
    });
    expect(mutationSpy.mock.calls[1][0].operation).toMatchObject({
      operationName: 'ContactOptions',
      variables: {
        accountListId,
        first: 2,
        contactsFilters: { ids: ['contact-1', 'contact-2'] },
      },
    });

    userEvent.click(getByRole('combobox', { name: 'Contacts' }));
    expect(getAllByRole('option')).toHaveLength(3);
  });

  it('searches for contacts', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.type(getByRole('combobox', { name: 'Contacts' }), 'Search');

    await waitFor(() => expect(mutationSpy).toHaveBeenCalledTimes(2));
    expect(mutationSpy.mock.calls[1][0].operation).toMatchObject({
      operationName: 'ContactOptions',
      variables: {
        accountListId,
        first: 10,
        contactsFilters: { wildcardSearch: 'Search' },
      },
    });
  });

  it('adds the highlighted contact when the user tabs away', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('combobox', { name: 'Contacts' }));
    userEvent.hover(await findByRole('option', { name: 'Alice' }));
    userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(['contact-1']);
  });

  it('does not remove the highlighted contact when the user tabs away', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent value={['contact-1']} />,
    );

    userEvent.click(getByRole('combobox', { name: 'Contacts' }));
    userEvent.hover(await findByRole('option', { name: 'Alice' }));
    userEvent.tab();

    expect(onChange).not.toHaveBeenCalled();
  });
});
