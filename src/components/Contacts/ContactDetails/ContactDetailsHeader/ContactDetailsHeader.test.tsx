import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailsHeader } from './ContactDetailsHeader';
import { GetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';

const accountListId = 'abc';
const contactId = 'contact-1';

describe('ContactDetails', () => {
  it('should show loading state', async () => {
    const { findAllByRole } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>>
        <ContactDetailsHeader
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );

    expect((await findAllByRole('ContactName'))[0]).toBeInTheDocument();
  });

  it('should render with contact details', async () => {
    const { findAllByRole } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>>
        <ContactDetailsHeader
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );

    await waitFor(async () =>
      expect((await findAllByRole('ContactName'))[0]).toBeInTheDocument(),
    );
  });
});
