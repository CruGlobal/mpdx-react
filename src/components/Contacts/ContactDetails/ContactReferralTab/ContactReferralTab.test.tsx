import React from 'react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { ContactReferralTab } from './ContactReferralTab';
import { ContactReferralTabQuery } from './ContactReferralTab.generated';

const accountListId = 'accountListId';
const contactId = 'contactId';

const router = {
  query: {
    accountListId,
  },
  pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
};

describe('ContactReferralTab', () => {
  it('test render', async () => {
    const { findByText } = render(
      <TestRouter router={router}>
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
          <ContactPanelProvider>
            <ContactReferralTab
              accountListId={accountListId}
              contactId={contactId}
            />
          </ContactPanelProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );
    expect(await findByText('No Connections')).toBeVisible();
  });

  it('tests render with data and click event', async () => {
    const { findByRole } = render(
      <TestRouter router={router}>
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
          <ContactPanelProvider>
            <ContactReferralTab
              accountListId={accountListId}
              contactId={contactId}
            />
          </ContactPanelProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    const contactLink = await findByRole('link', { name: 'name-2' });

    expect(contactLink).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/contacts/contact-id-2`,
    );
  });
});
