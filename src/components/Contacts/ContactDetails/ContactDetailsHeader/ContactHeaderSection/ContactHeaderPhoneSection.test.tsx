import React from 'react';
import { render } from '@testing-library/react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderPhoneSection } from './ContactHeaderPhoneSection';

const contact = gqlMock<ContactDetailsHeaderFragment>(
  ContactDetailsHeaderFragmentDoc,
  {
    mocks: {
      primaryPerson: {
        primaryPhoneNumber: {
          number: '(123)456-7890',
          location: 'Mobile',
        },
      },
      lastDonation: null,
    },
  },
);

describe('ContactHeaderPhoneSection', () => {
  it('should show loading state', async () => {
    const { queryByText } = render(
      <ContactHeaderPhoneSection loading={true} contact={undefined} />,
    );

    expect(
      queryByText(contact.primaryPerson?.primaryPhoneNumber?.number || ''),
    ).toBeNull();
  });

  it('should render with contact details', async () => {
    const { queryByText } = render(
      <ContactHeaderPhoneSection loading={false} contact={contact} />,
    );

    expect(
      queryByText(contact.primaryPerson?.primaryPhoneNumber?.number || ''),
    ).toBeInTheDocument();
    expect(
      queryByText(contact.primaryPerson?.primaryPhoneNumber?.location || ''),
    ).toBeInTheDocument();
  });
});
