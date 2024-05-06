import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AssigneeOptionsQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import { AssigneeAutocomplete } from './AssigneeAutocomplete';

const accountListId = 'account-list-1';

describe('AssigneeAutocomplete', () => {
  it('loads the options and handles clicks', async () => {
    const onChange = jest.fn();

    const { getByRole, findByRole } = render(
      <GqlMockedProvider<{ AssigneeOptions: AssigneeOptionsQuery }>
        mocks={{
          AssigneeOptions: {
            accountListUsers: {
              nodes: [
                { user: { id: '1', firstName: 'John', lastName: 'Doe' } },
                { user: { id: '2', firstName: 'Jane', lastName: 'Doe' } },
              ],
            },
          },
        }}
      >
        <AssigneeAutocomplete
          accountListId={accountListId}
          value={null}
          onChange={onChange}
        />
      </GqlMockedProvider>,
    );

    userEvent.click(getByRole('combobox', { name: 'Assignee' }));
    userEvent.click(await findByRole('option', { name: 'John Doe' }));
    expect(onChange).toHaveBeenCalledWith('1');
  });
});
