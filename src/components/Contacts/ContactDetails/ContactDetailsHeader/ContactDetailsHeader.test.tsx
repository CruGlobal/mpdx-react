import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailsHeader } from './ContactDetailsHeader';
import { GetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';

const accountListId = 'abc';
const contactId = 'contact-1';

describe('ContactDetails', () => {
  it('should show loading state', async () => {
    const { queryByRole } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>>
        <ContactDetailsHeader
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );

    expect(queryByRole('Skeleton')).toBeInTheDocument();
    expect(queryByRole('ContactName')).toBeNull();
  });

  it('should render with contact details', async () => {
    const { findAllByRole, queryByRole } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>>
        <ContactDetailsHeader
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );

    await waitFor(async () => {
      expect((await findAllByRole('ContactName'))[0]).toBeInTheDocument();
    });

    expect(queryByRole('Skeleton')).toBeNull();
  });
});
