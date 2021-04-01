import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailsFragment,
  ContactDetailsFragmentDoc,
} from '../ContactDetails.generated';
import { ContactDetailsHeader } from './ContactDetailsHeader';

const contact = gqlMock<ContactDetailsFragment>(ContactDetailsFragmentDoc);

describe('ContactDetails', () => {
  it('default', async () => {
    const { queryByText } = render(
      <ContactDetailsHeader loading={false} contact={null} />,
    );

    expect(queryByText('loading')).toBeNull();
  });

  it('should show loading state', async () => {
    const { getByText } = render(
      <ContactDetailsHeader loading={true} contact={null} />,
    );

    await waitFor(() => expect(getByText('loading')).toBeInTheDocument());
  });

  it('should render with contact details', async () => {
    const { findAllByRole, queryAllByText } = render(
      <ContactDetailsHeader loading={false} contact={contact} />,
    );

    await waitFor(async () =>
      expect((await findAllByRole('contactName'))[0]).toBeInTheDocument(),
    );

    expect(queryAllByText('loading')).toEqual([]);
  });
});
