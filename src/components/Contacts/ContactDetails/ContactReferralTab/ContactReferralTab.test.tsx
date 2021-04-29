import React from 'react';
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
          contact: {
            id: 'contact-id',
            name: 'name',
            contactReferralsByMe: [
              {
                id: 'referral-id',
                createdAt: '2021-04-29T07:48:28+0000',
                referredTo: {
                  id: 'contact-id-2',
                  name: 'name-2',
                },
              },
            ],
          },
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
