/* eslint-disable react/react-in-jsx-scope */
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { render } from '../../../../../__tests__/util/testingLibraryReactMock';
import { ContactReferralTab } from './ContactReferralTab';
import {
  ContactReferralTabQuery,
  useContactReferralTabQuery,
} from './ContactReferralTab.generated';

describe('ContactReferralTab', () => {
  it('test query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useContactReferralTabQuery({
          variables: {
            accountListId: 'accountList-id',
            contactId: 'contact-id',
          },
        }),
      {
        wrapper: GqlMockedProvider,
      },
    );
    await waitForNextUpdate();

    expect(result.current.variables).toMatchInlineSnapshot(`
      Object {
        "accountListId": "accountList-id",
        "contactId": "contact-id",
      }
    `);
  });

  it('test render', async () => {
    const { findByText } = render(
      <GqlMockedProvider<ContactReferralTabQuery>
        mocks={{
          contact: { id: 'contact-id' },
        }}
      >
        <ContactReferralTab
          accountListId="accountList-id"
          contactId="contact-id"
        />
      </GqlMockedProvider>,
    );
    expect(await findByText('No Referrals')).toBeVisible();
  });
});
