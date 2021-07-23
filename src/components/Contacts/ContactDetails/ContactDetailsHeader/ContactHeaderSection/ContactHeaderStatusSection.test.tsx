import React from 'react';
import { render } from '@testing-library/react';
import { StatusEnum } from '../../../../../../graphql/types.generated';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderStatusSection } from './ContactHeaderStatusSection';

const contactMock = (status: StatusEnum) => {
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
    [StatusEnum.NeverContacted, 'Never Contacted'],
    [StatusEnum.AskInFuture, 'Ask in Future'],
    [StatusEnum.CultivateRelationship, 'Cultivate Relationship'],
    [StatusEnum.ContactForAppointment, 'Contact for Appointment'],
    [StatusEnum.AppointmentScheduled, 'Appointment Scheduled'],
    [StatusEnum.CallForDecision, 'Call for Decision'],
    [StatusEnum.PartnerFinancial, 'Partner - Financial'],
    [StatusEnum.PartnerSpecial, 'Partner - Special'],
    [StatusEnum.PartnerPray, 'Partner - Prayer'],
    [StatusEnum.NotInterested, 'Not Interested'],
    [StatusEnum.Unresponsive, 'Unresponsive'],
    [StatusEnum.NeverAsk, 'Never Ask'],
    [StatusEnum.ResearchAbandoned, 'Research Abandoned'],
    [StatusEnum.ExpiredReferral, 'Expired Referral'],
  ])('should render status | %s', (status, expected) => {
    const { queryByText } = render(
      <ContactHeaderStatusSection
        loading={false}
        contact={contactMock(status)}
      />,
    );
    expect(queryByText(expected)).toBeInTheDocument();
  });
});
