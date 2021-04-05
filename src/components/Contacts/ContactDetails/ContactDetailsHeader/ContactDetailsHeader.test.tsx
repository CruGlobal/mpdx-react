import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailsHeader } from './ContactDetailsHeader';
import { GetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';

const accountListId = 'abc';
const contactId = 'contact-1';

describe('ContactDetails', () => {
  it('should show loading state', async () => {
    const { getByText } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>>
        <ContactDetailsHeader
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(getByText('loading')).toBeInTheDocument());
  });

  it('should render with contact details', async () => {
    const { findAllByRole, queryAllByText } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>>
        <ContactDetailsHeader
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );

    await waitFor(async () =>
      expect((await findAllByRole('contactName'))[0]).toBeInTheDocument(),
    );

    expect(queryAllByText('loading')).toEqual([]);
  });
});
