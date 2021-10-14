import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { StatusEnum as ContactPartnershipStatus } from '../../../../../../graphql/types.generated';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderStatusSection } from './ContactHeaderStatusSection';

const contactMock = (status: ContactPartnershipStatus) => {
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

  it.each([
    [ContactPartnershipStatus.NeverContacted, 'Never Contacted'],
    [ContactPartnershipStatus.AskInFuture, 'Ask in Future'],
    [ContactPartnershipStatus.CultivateRelationship, 'Cultivate Relationship'],
    [ContactPartnershipStatus.ContactForAppointment, 'Contact for Appointment'],
    [ContactPartnershipStatus.AppointmentScheduled, 'Appointment Scheduled'],
    [ContactPartnershipStatus.CallForDecision, 'Call for Decision'],
    [ContactPartnershipStatus.PartnerFinancial, 'Partner - Financial'],
    [ContactPartnershipStatus.PartnerSpecial, 'Partner - Special'],
    [ContactPartnershipStatus.PartnerPray, 'Partner - Prayer'],
    [ContactPartnershipStatus.NotInterested, 'Not Interested'],
    [ContactPartnershipStatus.Unresponsive, 'Unresponsive'],
    [ContactPartnershipStatus.NeverAsk, 'Never Ask'],
    [ContactPartnershipStatus.ResearchAbandoned, 'Research Abandoned'],
    [ContactPartnershipStatus.ExpiredReferral, 'Expired Referral'],
  ])('should render status | %s', async (status, expected) => {
    const { getByRole, getByText } = render(
      <ContactHeaderStatusSection
        loading={false}
        contact={contactMock(status)}
      />,
    );

    const handshakeIcon = getByRole('img', {
      hidden: true,
      name: 'HandshakeIcon',
    });
    expect(handshakeIcon).toBeInTheDocument();
    expect(getByText(expected)).toBeInTheDocument();
  });
});
