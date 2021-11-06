import React from 'react';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { StatusEnum as ContactPartnershipStatusEnum } from '../../../../../../graphql/types.generated';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import i18n from '../../../../../lib/i18n';
import { ContactHeaderStatusSection } from './ContactHeaderStatusSection';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';

const contactMock = (status: ContactPartnershipStatusEnum) => {
  return gqlMock<ContactDetailsHeaderFragment>(
    ContactDetailsHeaderFragmentDoc,
    { mocks: { status } },
  );
};

describe('ContactHeaderStatusSection', () => {
  it('should show loading state', () => {
    const { queryByText } = render(
      <ContactHeaderStatusSection loading={true} contact={undefined} />,
    );

    expect(queryByText('Partner - Financial')).toBeNull();
  });

  it('should render if status is null', () => {
    const { queryByText } = render(
      <ContactHeaderStatusSection
        loading={false}
        contact={gqlMock<ContactDetailsHeaderFragment>(
          ContactDetailsHeaderFragmentDoc,
          { mocks: { status: null } },
        )}
      />,
    );

    expect(queryByText('Partner - Financial')).toBeNull();
  });

  it('should render if status is partner pray', () => {
    const { getByText } = render(
      <I18nextProvider i18n={i18n}>
        <ContactHeaderStatusSection
          loading={false}
          contact={contactMock(ContactPartnershipStatusEnum.PartnerPray)}
        />
      </I18nextProvider>,
    );

    expect(
      getByText(
        contactPartnershipStatus[ContactPartnershipStatusEnum.PartnerPray],
      ),
    ).toBeInTheDocument();
  });
});
