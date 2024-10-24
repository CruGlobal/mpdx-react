import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { ContactReferralTab } from './ContactReferralTab';
import {
  ContactReferralTabQuery,
  useContactReferralTabQuery,
} from './ContactReferralTab.generated';

const accountListId = 'accountListId';
const contactId = 'contactId';

describe('ContactReferralTab', () => {
  it('test query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useContactReferralTabQuery({
          variables: {
            accountListId,
            contactId,
          },
        }),
      {
        wrapper: GqlMockedProvider,
      },
    );
    await waitForNextUpdate();

    expect(result.current.variables).toMatchInlineSnapshot(`
      Object {
        "accountListId": "accountListId",
        "contactId": "contactId",
      }
    `);
  });

  it('test render', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{ ContactReferralTab: ContactReferralTabQuery }>
        mocks={{
          ContactReferralTab: {
            contact: {
              id: 'contact-id',
              name: 'name',
              contactReferralsByMe: {
                nodes: [],
              },
            },
          },
        }}
      >
        <ContactReferralTab
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );
    expect(await findByText('No Connections')).toBeVisible();
  });

  it('tests render with data and click event', async () => {
    const { findByRole } = render(
      <GqlMockedProvider<{ ContactReferralTab: ContactReferralTabQuery }>
        mocks={{
          ContactReferralTab: {
            contact: {
              id: 'contact-id',
              name: 'name',
              contactReferralsByMe: {
                nodes: [
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
            },
          },
        }}
      >
        <ContactReferralTab
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );

    const contactLink = await findByRole('link', { name: 'name-2' });

    expect(contactLink).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/contacts/contact-id-2`,
    );
  });
});
