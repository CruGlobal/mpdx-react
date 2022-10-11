import { render } from '@testing-library/react';
import React from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderNewsletterSection } from './ContactHeaderNewsletterSection';

const contact = gqlMock<ContactDetailsHeaderFragment>(
  ContactDetailsHeaderFragmentDoc,
  { mocks: { lastDonation: null } },
);

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('ContactHeaderNewsletterSection', () => {
  it('should show loading state', async () => {
    const { queryByText } = render(
      <ContactHeaderNewsletterSection loading={true} contact={undefined} />,
    );

    expect(queryByText(contact.sendNewsletter || '')).toBeNull();
  });

  it('should render with contact details', async () => {
    const { queryByText } = render(
      <ContactHeaderNewsletterSection loading={false} contact={contact} />,
    );

    expect(queryByText(`Newsletter: {{newsletter}}` || '')).toBeInTheDocument();
  });
});
