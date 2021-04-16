import { render } from '@testing-library/react';
import React from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderEmailSection } from './ContactHeaderEmailSection';

const contact = gqlMock<ContactDetailsHeaderFragment>(
  ContactDetailsHeaderFragmentDoc,
);

describe('ContactHeaderEmailSection', () => {
  it('should show loading state', async () => {
    const { queryByText } = render(
      <ContactHeaderEmailSection loading={true} contact={undefined} />,
    );

    expect(
      queryByText(contact.primaryPerson?.primaryEmailAddress?.email || ''),
    ).toBeNull();
  });

  it('should render with contact details', async () => {
    const { queryByText } = render(
      <ContactHeaderEmailSection loading={false} contact={contact} />,
    );

    expect(
      queryByText(contact.primaryPerson?.primaryEmailAddress?.email || ''),
    ).toBeInTheDocument();
  });
});
