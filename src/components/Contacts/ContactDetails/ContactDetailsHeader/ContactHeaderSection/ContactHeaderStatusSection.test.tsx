import React from 'react';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@mui/material/styles';
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
import theme from '../../../../../theme';
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
        lastDonation: {
          donationDate: '2021-09-07T16:38:20.242-04:00',
          amount: {
            currency: 'CAD',
          },
        },
        contactReferralsToMe: {
          nodes: [
            {
              id: 'referred-by-id-1',
              referredBy: {
                id: 'referred-by-contact-id',
                name: 'Person, Cool',
              },
            },
          ],
        },
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
          { mocks: { status: null, lastDonation: null } },
        )}
      />,
    );

    expect(queryByText('Partner - Financial')).toBeNull();
  });

  it('renders for financial partner', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <ContactHeaderStatusSection
          loading={false}
          contact={contactMock(
            'PARTNER_FINANCIAL' as ContactPartnershipStatusEnum,
          )}
        />
      </ThemeProvider>,
    );
    expect(queryByText('Partner - Financial')).toBeInTheDocument();
    expect(queryByText('$500 - Monthly')).toBeInTheDocument();
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip.each([
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
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          <ContactHeaderStatusSection
            loading={false}
            contact={contactMock(status as ContactPartnershipStatusEnum)}
          />
        </I18nextProvider>
      </ThemeProvider>,
    );
    expect(getByText(expected)).toBeInTheDocument();
  });
});
