import React from 'react';
import { render } from '@testing-library/react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderNewsletterSection } from './ContactHeaderNewsletterSection';

const contact = gqlMock<ContactDetailsHeaderFragment>(
  ContactDetailsHeaderFragmentDoc,
  {
    mocks: {
      lastDonation: null,
      sendNewsletter: SendNewsletterEnum.Both,
    },
  },
);

describe('ContactHeaderNewsletterSection', () => {
  it('should show loading state', async () => {
    const { queryByText } = render(
      <ContactHeaderNewsletterSection loading={true} contact={undefined} />,
    );

    expect(queryByText('Newsletter', { exact: false })).not.toBeInTheDocument();
  });

  it('should render with contact details', async () => {
    const { queryByText } = render(
      <ContactHeaderNewsletterSection loading={false} contact={contact} />,
    );

    expect(queryByText('Newsletter', { exact: false })).toBeInTheDocument();
    expect(queryByText('Both', { exact: false })).toBeInTheDocument();
  });
});
