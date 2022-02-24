import React from 'react';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import {
  PledgeFrequencyEnum,
  StatusEnum as ContactPartnershipStatusEnum,
} from '../../../../../../graphql/types.generated';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import i18n from '../../../../../lib/i18n';
import { ContactHeaderStatusSection } from './ContactHeaderStatusSection';

const contactMock = (status: ContactPartnershipStatusEnum) => {
  return gqlMock<ContactDetailsHeaderFragment>(
    ContactDetailsHeaderFragmentDoc,
    {
      mocks: {
        status,
        pledgeCurrency: 'USD',
        pledgeAmount: 500,
        pledgeFrequency: PledgeFrequencyEnum.Monthly,
        pledgeReceived: true,
      },
    },
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

  it.each([
    ['NEVER_CONTACTED', 'Never Contacted'],
    ['ASK_IN_FUTURE', 'Ask In Future'],
    ['CULTIVATE_RELATIONSHIP', 'Cultivate Relationship'],
    ['CONTACT_FOR_APPOINTMENT', 'Contact for Appointment'],
    ['APPOINTMENT_SCHEDULED', 'Appointment Scheduled'],
    ['CALL_FOR_DECISION', 'Call for Decision'],
    ['PARTNER_FINANCIAL', 'Partner - Financial'],
    ['PARTNER_SPECIAL', 'Partner - Special'],
    ['PARTNER_PRAY', 'Partner - Pray'],
    ['NOT_INTERESTED', 'Not Interested'],
    ['UNRESPONSIVE', 'Unresponsive'],
    ['NEVER_ASK', 'Never Ask'],
    ['RESEARCH_ABANDONED', 'Research Abandoned'],
    ['EXPIRED_REFERRAL', 'Expired Referral'],
  ])('should render status | %s', (status, expected) => {
    const { getByText } = render(
      <I18nextProvider i18n={i18n}>
        <ContactHeaderStatusSection
          loading={false}
          contact={contactMock(status as ContactPartnershipStatusEnum)}
        />
      </I18nextProvider>,
    );
    expect(getByText(expected)).toBeInTheDocument();
  });
});
