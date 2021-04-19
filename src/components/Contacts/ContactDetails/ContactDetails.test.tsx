import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactDetails } from './ContactDetails';
import { GetContactDetailsHeaderQuery } from './ContactDetailsHeader/ContactDetailsHeader.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const onClose = jest.fn();

describe('ContactDetails', () => {
  it('should show loading state', async () => {
    const { queryByRole } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>
        mocks={{ contact: { id: contactId } }}
      >
        <ContactDetails
          accountListId={accountListId}
          contactId={contactId}
          onClose={onClose}
        />
      </GqlMockedProvider>,
    );

    expect(queryByRole('Skeleton')).toBeInTheDocument();
    expect(queryByRole('ContactName')).toBeNull();
  });

  it('should render with contact details', async () => {
    const { findAllByRole, queryByRole } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>
        mocks={{ contact: { id: contactId } }}
      >
        <ContactDetails
          accountListId={accountListId}
          contactId={contactId}
          onClose={onClose}
        />
      </GqlMockedProvider>,
    );

    await waitFor(async () => {
      expect((await findAllByRole('ContactName'))[0]).toBeInTheDocument();
    });

    expect(queryByRole('Skeleton')).toBeNull();
  });
});
