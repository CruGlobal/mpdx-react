import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactDetails } from './ContactDetails';
import { GetContactDetailsQuery } from './ContactDetails.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-1';

describe('ContactDetails', () => {
  it('default', async () => {
    const { findAllByRole, queryByText } = render(
      <GqlMockedProvider<GetContactDetailsQuery>>
        <ContactDetails accountListId={accountListId} contactId={null} />
      </GqlMockedProvider>,
    );

    expect((await findAllByRole('tablist'))[0]).toBeVisible();
    expect(queryByText('loading')).toBeNull();
  });

  it('should show loading state', async () => {
    const { getByText } = render(
      <GqlMockedProvider mocks={{ contact: { id: contactId } }}>
        <ContactDetails accountListId={accountListId} contactId={contactId} />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(getByText('loading')).toBeInTheDocument());
  });

  it('should render with contact details', async () => {
    const { findAllByRole, queryAllByText } = render(
      <GqlMockedProvider mocks={{ contact: { id: contactId } }}>
        <ContactDetails accountListId={accountListId} contactId={contactId} />
      </GqlMockedProvider>,
    );

    await waitFor(async () =>
      expect((await findAllByRole('contactName'))[0]).toBeInTheDocument(),
    );

    expect(queryAllByText('loading')).toEqual([]);
  });
});
