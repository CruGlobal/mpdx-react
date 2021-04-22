import { render } from '@testing-library/react';
import React from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderAddressSection } from './ContactHeaderAddressSection';

const contact = gqlMock<ContactDetailsHeaderFragment>(
  ContactDetailsHeaderFragmentDoc,
);

describe('ContactHeaderAddressSection', () => {
  it('should show loading state', async () => {
    const { queryByText } = render(
      <ContactHeaderAddressSection loading={true} contact={undefined} />,
    );

    expect(queryByText(contact.primaryAddress?.street || '')).toBeNull();
  });

  it('should render with contact details', async () => {
    const { queryByText } = render(
      <ContactHeaderAddressSection loading={false} contact={contact} />,
    );

    expect(queryByText(contact.greeting || '')).toBeInTheDocument();
    expect(
      queryByText(contact.primaryAddress?.street || ''),
    ).toBeInTheDocument();
  });
});
