import { render } from '@testing-library/react';
import React from 'react';
import { StatusEnum } from '../../../../../../graphql/types.generated';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderStatusSection } from './ContactHeaderStatusSection';

const contact = gqlMock<ContactDetailsHeaderFragment>(
  ContactDetailsHeaderFragmentDoc,
  { mocks: { status: StatusEnum.PartnerFinancial } },
);

describe('ContactHeaderStatusSection', () => {
  it('should show loading state', async () => {
    const { queryByText } = render(
      <ContactHeaderStatusSection loading={true} contact={null} />,
    );

    expect(queryByText('Partner - Financial')).toBeNull();
  });

  it('should render with contact details', async () => {
    const { queryByText } = render(
      <ContactHeaderStatusSection loading={false} contact={contact} />,
    );

    expect(queryByText('Partner - Financial')).toBeInTheDocument();
  });
});
