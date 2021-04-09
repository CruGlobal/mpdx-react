import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { useContactDetailsTabQuery } from './ContactDetailsTab.generated';

describe('ContactDetailTab', () => {
  it('test query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useContactDetailsTabQuery({
          variables: {
            accountListId: 'accountList-id',
            contactId: 'contact-id',
          },
        }),
      { wrapper: GqlMockedProvider },
    );
    await waitForNextUpdate();
    expect(result.current.variables).toMatchSnapshot();
    expect(result.current.data.contact.name).toMatchSnapshot();
  });
});
