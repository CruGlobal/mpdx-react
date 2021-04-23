import { render } from '@testing-library/react';
import React from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailsHeader } from './ContactDetailsHeader';
import { GetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';

const accountListId = 'abc';
const contactId = 'contact-1';

describe('ContactDetails', () => {
  it('should show loading state', async () => {
    const { queryByTestId } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>>
        <ContactDetailsHeader
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );

    expect(queryByTestId('Skeleton')).toBeInTheDocument();
  });

  it('should render with contact details', async () => {
    const { findByText, queryByTestId } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>
        mocks={{
          GetContactDetailsHeader: {
            contact: {
              primaryPerson: { firstName: 'Fname', lastName: 'Lname' },
            },
          },
        }}
      >
        <ContactDetailsHeader
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );

    expect(await findByText('Fname Lname')).toBeVisible();

    expect(queryByTestId('Skeleton')).toBeNull();
  });
});
